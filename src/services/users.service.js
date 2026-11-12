const bcrypt = require("bcryptjs");
const {
  User,
  AdminUserCommand,
  ApplicationNavigation,
  Role,
  Permission,
  UserAccessScope,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const HttpError = require("../errors/HttpError");
const { safeUser } = require("./auth.service");
const { notifyPresenceChanged } = require("./presence-events");

const includes = [
  { model: Role, as: "roles", through: { attributes: [] }, include: [{ model: Permission, as: "permissions", through: { attributes: [] } }] },
  { model: UserAccessScope, as: "accessScopes", where: { enabled: true }, required: false },
];

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new HttpError(400, `${field} is required`);
  return value.trim();
}

async function resolveRoles(roleIds, defaultUserRole = false) {
  if (defaultUserRole && (!Array.isArray(roleIds) || roleIds.length === 0)) {
    const role = await Role.findOne({ where: { name: "USER", enabled: true } });
    if (!role) throw new HttpError(500, "Default USER role is missing; run database seeds");
    return [role];
  }
  if (!Array.isArray(roleIds)) throw new HttpError(400, "roleIds must be an array");
  const roles = await Role.findAll({ where: { id: [...new Set(roleIds)] } });
  if (roles.length !== new Set(roleIds).size) throw new HttpError(400, "One or more roleIds do not exist");
  return roles;
}

async function create(values, { registration = false } = {}) {
  const employeeCode = requireText(values.employeeCode, "employeeCode");
  const employeeName = requireText(values.employeeName, "employeeName");
  const authCode = requireText(values.authCode, "authCode");
  const existing = await User.findOne({ where: { employeeCode } });
  if (existing) throw new HttpError(409, "employeeCode already exists");
  if (await User.findOne({ where: { employeeName } })) throw new HttpError(409, "employeeName already exists");
  const roles = registration ? await resolveRoles([], true) : await resolveRoles(values.roleIds || []);
  const user = await User.create({
    employeeCode,
    employeeName,
    authCode: await bcrypt.hash(authCode, 12),
    isActive: true,
  });
  await user.setRoles(roles);
  notifyPresenceChanged();
  return safeUser(await User.findByPk(user.id, { include: includes }));
}

async function list() {
  return (await User.findAll({ include: includes })).map(safeUser);
}

async function update(id, values) {
  const user = await User.unscoped().findByPk(id);
  if (!user) throw new HttpError(404, "User not found");
  if (values.employeeCode !== undefined) user.employeeCode = requireText(values.employeeCode, "employeeCode");
  if (values.employeeName !== undefined) user.employeeName = requireText(values.employeeName, "employeeName");
  if (values.authCode !== undefined && values.authCode !== null && values.authCode !== "") {
    user.authCode = await bcrypt.hash(requireText(values.authCode, "authCode"), 12);
  }
  if (values.roleIds !== undefined) await user.setRoles(await resolveRoles(values.roleIds));
  await user.save();
  notifyPresenceChanged();
  return safeUser(await User.findByPk(id, { include: includes }));
}

async function setStatus(id, enabled) {
  if (typeof enabled !== "boolean") throw new HttpError(400, "enable must be true or false");
  const user = await User.findByPk(id);
  if (!user) throw new HttpError(404, "User not found");
  user.isActive = enabled;
  await user.save();
  notifyPresenceChanged();
}

async function remove(id) {
  const user = await User.findByPk(id);
  if (!user) throw new HttpError(404, "User not found");
  await user.destroy();
  notifyPresenceChanged();
}

async function issueAdminCommand(
  id,
  commandType,
  message,
  applicationName,
  targetRoute,
) {
  const user = await User.findByPk(id);
  if (!user) throw new HttpError(404, "User not found");
  if (!["refresh", "logout", "message", "navigate"].includes(commandType)) {
    throw new HttpError(400, "commandType must be refresh, logout, message, or navigate");
  }
  if (commandType === "message" && (typeof message !== "string" || !message.trim())) {
    throw new HttpError(400, "A message is required");
  }
  if (commandType !== "message" && message !== undefined) {
    throw new HttpError(400, "Messages are only valid for message commands");
  }
  if (commandType === "navigate") {
    if (
      typeof applicationName !== "string" ||
      !applicationName.trim() ||
      typeof targetRoute !== "string" ||
      !/^\/(?!\/)\S+/.test(targetRoute)
    ) {
      throw new HttpError(400, "A valid applicationName and targetRoute are required");
    }
  } else if (applicationName !== undefined || targetRoute !== undefined) {
    throw new HttpError(400, "Navigation targets are only valid for navigate commands");
  }
  if (commandType === "navigate" && message !== undefined) {
    throw new HttpError(400, "Messages are only valid for message commands");
  }
  const normalizedMessage = commandType === "message" ? message.trim() : null;
  if (normalizedMessage && normalizedMessage.length > 500) {
    throw new HttpError(400, "Messages must be 500 characters or fewer");
  }

  let navigationTarget = null;
  if (commandType === "navigate") {
    const normalizedApplicationName = applicationName.trim();
    const normalizedRoute = targetRoute.trim();
    const configuration = await ApplicationNavigation.findByPk(
      normalizedApplicationName,
    );
    if (!configuration) {
      throw new HttpError(400, "No workspace navigation exists for that application");
    }
    const navbarItems = JSON.parse(configuration.navbarItems);
    const isConfiguredRoute =
      configuration.landingRoute === normalizedRoute ||
      navbarItems.some((item) => item.link === normalizedRoute);
    if (!isConfiguredRoute) {
      throw new HttpError(400, "targetRoute is not configured for that application");
    }
    navigationTarget = {
      applicationName: normalizedApplicationName,
      targetRoute: normalizedRoute,
    };
  }

  const transaction = await sequelize.transaction();
  try {
    await AdminUserCommand.destroy({
      where: { createdAt: { [Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60_000) } },
      transaction,
    });
    if (commandType === "logout") {
      await user.increment("sessionVersion", { by: 1, transaction });
    }
    const command = await AdminUserCommand.create(
      {
        userId: user.id,
        commandType,
        message: normalizedMessage,
        ...(navigationTarget ?? {}),
        createdAt: new Date(),
      },
      { transaction },
    );
    await transaction.commit();
    if (commandType === "logout") notifyPresenceChanged();
    return {
      id: String(command.id),
      commandType,
      message: normalizedMessage,
      ...(navigationTarget ?? {}),
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function listAdminCommands(userId, issuedAt, afterId) {
  const commands = await AdminUserCommand.findAll({
    attributes: ["id", "commandType", "message", "applicationName", "targetRoute"],
    where: {
      userId,
      id: { [Op.gt]: afterId },
      createdAt: { [Op.gte]: issuedAt },
    },
    order: [["id", "ASC"]],
    limit: 100,
  });
  return commands.map((command) => ({
    id: String(command.id),
    commandType: command.commandType,
    message: command.message,
    applicationName: command.applicationName,
    targetRoute: command.targetRoute,
  }));
}

module.exports = { create, list, update, setStatus, remove, issueAdminCommand, listAdminCommands };
