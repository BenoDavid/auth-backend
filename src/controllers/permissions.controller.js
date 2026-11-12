const permissions = require("../services/permission.service");

async function list(req, res) {
  res.json({ status: 200, message: "permissions retrieved successfully", result: await permissions.list() });
}

async function create(req, res) {
  res.json(await permissions.create(req.body));
}

async function update(req, res) {
  res.json(await permissions.update(req.params.id, req.body));
}

async function setStatus(req, res) {
  const enabled = req.query.enable === "true" ? true : req.query.enable === "false" ? false : undefined;
  await permissions.setStatus(req.params.id, enabled);
  res.json("Permission status updated successfully");
}

async function remove(req, res) {
  await permissions.remove(req.params.id);
  res.json("Permission deleted successfully");
}

module.exports = { list, create, update, setStatus, remove };
