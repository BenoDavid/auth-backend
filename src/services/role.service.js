const { Role, Permission, User } = require("../models");
const HttpError = require("../errors/HttpError");
const { notifyPresenceChanged } = require("./presence-events");

const includePermissions = [{ model: Permission, as: "permissions", through: { attributes: [] } }];

async function list() {
  return Role.findAll({ include: includePermissions });
}

async function resolvePermissions(ids) {
  if (!Array.isArray(ids)) throw new HttpError(400, "permissionIds must be an array");
  const uniqueIds = [...new Set(ids)];
  const permissions = await Permission.findAll({ where: { id: uniqueIds } });
  if (permissions.length !== uniqueIds.length) throw new HttpError(400, "One or more permissionIds do not exist");
  return permissions;
}

async function create(values) {
  if (typeof values.name !== "string" || !values.name.trim()) throw new HttpError(400, "name is required");
  const permissions = values.permissionIds === undefined ? null : await resolvePermissions(values.permissionIds);
  const role = await Role.create({ name: values.name.trim(), enabled: true });
  if (permissions) {
    await role.setPermissions(permissions);
    notifyPresenceChanged();
    return Role.findByPk(role.id, { include: includePermissions });
  }
  notifyPresenceChanged();
  return role;
}

async function update(id, values) {
  const role = await Role.findByPk(id);
  if (!role) throw new HttpError(404, "Role not found");
  const permissions = values.permissionIds === undefined ? null : await resolvePermissions(values.permissionIds);
  if (values.name !== undefined) {
    if (typeof values.name !== "string" || !values.name.trim()) throw new HttpError(400, "name must be a non-empty string");
    role.name = values.name.trim();
  }
  await role.save();
  if (permissions) {
    await role.setPermissions(permissions);
    notifyPresenceChanged();
    return Role.findByPk(id, { include: includePermissions });
  }
  notifyPresenceChanged();
  return Role.findByPk(id, { include: includePermissions });
}

async function setStatus(id, enabled) {
  if (typeof enabled !== "boolean") throw new HttpError(400, "enable must be true or false");
  const role = await Role.findByPk(id);
  if (!role) throw new HttpError(404, "Role not found");
  role.enabled = enabled;
  await role.save();
  notifyPresenceChanged();
}

async function remove(id) {
  const role = await Role.findByPk(id);
  if (!role) throw new HttpError(404, "Role not found");
  if ((await User.count({ include: [{ model: Role, as: "roles", where: { id }, through: { attributes: [] } }] })) > 0) {
    throw new HttpError(409, "Role is assigned to users and cannot be deleted");
  }
  await role.destroy();
  notifyPresenceChanged();
}

module.exports = { list, create, update, setStatus, remove };
