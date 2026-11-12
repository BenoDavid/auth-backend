const roles = require("../services/role.service");

async function list(req, res) {
  res.json({ status: 200, message: "roles retrieved successfully", result: await roles.list() });
}

async function create(req, res) {
  res.json(await roles.create(req.body));
}

async function update(req, res) {
  res.json(await roles.update(req.params.id, req.body));
}

async function setStatus(req, res) {
  const enabled = req.query.enable === "true" ? true : req.query.enable === "false" ? false : undefined;
  await roles.setStatus(req.params.id, enabled);
  res.json("Role status updated");
}

async function remove(req, res) {
  await roles.remove(req.params.id);
  res.json("Role deleted successfully");
}

module.exports = { list, create, update, setStatus, remove };
