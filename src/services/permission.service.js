const { Permission } = require("../models");
const HttpError = require("../errors/HttpError");
const { notifyPresenceChanged } = require("./presence-events");

async function list() {
  return Permission.findAll();
}

async function create(values) {
  if (typeof values.name !== "string" || !values.name.trim()) throw new HttpError(400, "name is required");
  const permission = await Permission.create({
    name: values.name.trim(),
    appname: typeof values.appname === "string" ? values.appname.trim() : null,
    enabled: true,
  });
  notifyPresenceChanged();
  return permission;
}

async function update(id, values) {
  const permission = await Permission.findByPk(id);
  if (!permission) throw new HttpError(404, "Permission not found");
  if (values.name !== undefined) {
    if (typeof values.name !== "string" || !values.name.trim()) throw new HttpError(400, "name must be a non-empty string");
    permission.name = values.name.trim();
  }
  if (values.appname !== undefined) {
    if (values.appname !== null && typeof values.appname !== "string") throw new HttpError(400, "appname must be a string or null");
    permission.appname = values.appname ? values.appname.trim() : null;
  }
  await permission.save();
  notifyPresenceChanged();
  return permission;
}

async function setStatus(id, enabled) {
  if (typeof enabled !== "boolean") throw new HttpError(400, "enable must be true or false");
  const permission = await Permission.findByPk(id);
  if (!permission) throw new HttpError(404, "Permission not found");
  permission.enabled = enabled;
  await permission.save();
  notifyPresenceChanged();
}

async function remove(id) {
  const permission = await Permission.findByPk(id);
  if (!permission) throw new HttpError(404, "Permission not found");
  await permission.destroy();
  notifyPresenceChanged();
}

module.exports = { list, create, update, setStatus, remove };
