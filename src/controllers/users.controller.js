const users = require("../services/users.service");

async function register(req, res) {
  const user = await users.create(req.body, { registration: true });
  res.json({ status: 200, message: "User created successfully", result: user, token: null });
}

async function list(req, res) {
  res.json({ status: 200, message: "Users retrieved successfully", result: await users.list() });
}

async function create(req, res) {
  res.json({ status: 200, message: "Users created successfully", result: await users.create(req.body) });
}

async function update(req, res) {
  res.json(await users.update(req.params.id, req.body));
}

async function setStatus(req, res) {
  await users.setStatus(req.params.id, req.query.enable === "true" ? true : req.query.enable === "false" ? false : undefined);
  res.json({ status: 200, message: "Users status changed successfully", result: null });
}

async function remove(req, res) {
  await users.remove(req.params.id);
  res.json({ status: 200, message: "Users deleted successfully", result: null });
}

async function issueAdminCommand(req, res) {
  const result = await users.issueAdminCommand(
    req.params.id,
    req.body.commandType,
    req.body.message,
    req.body.applicationName,
    req.body.targetRoute,
  );
  res.json({ status: 200, message: "User command sent", result });
}

module.exports = { register, list, create, update, setStatus, remove, issueAdminCommand };
