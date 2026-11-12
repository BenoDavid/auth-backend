const { User, UserAccessScope } = require("../models");
const HttpError = require("../errors/HttpError");

function text(value) { return typeof value === "string" && value.trim() ? value.trim() : null; }

function normalizeScope(scope) {
  const applicationName = text(scope.applicationName || scope.application || scope.app);
  const organizationId = text(scope.organizationId);
  const organizationName = text(scope.organizationName);
  const factoryId = text(scope.factoryId);
  const factoryName = text(scope.factoryName);
  if (!applicationName) throw new HttpError(400, "applicationName is required");
  if (!organizationId && !organizationName && !factoryId && !factoryName) throw new HttpError(400, "An organization or factory scope is required");
  return { applicationName, organizationId, organizationName, factoryId, factoryName, enabled: scope.enabled !== false };
}

async function list(userId) { return UserAccessScope.findAll({ where: { userId }, order: [["applicationName", "ASC"], ["id", "ASC"]] }); }

async function replace(userId, values) {
  if (!await User.findByPk(userId)) throw new HttpError(404, "User not found");
  if (!Array.isArray(values)) throw new HttpError(400, "scopes must be an array");
  const unique = new Map(values.map(normalizeScope).map((scope) => [JSON.stringify(scope), scope]));
  await UserAccessScope.destroy({ where: { userId } });
  if (unique.size) await UserAccessScope.bulkCreate([...unique.values()].map((scope) => ({ ...scope, userId })));
  await User.increment("sessionVersion", { where: { id: userId }, by: 1 });
  return list(userId);
}

module.exports = { list, replace, normalizeScope };
