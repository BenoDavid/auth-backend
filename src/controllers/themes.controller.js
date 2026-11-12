const themes = require("../services/theme.service");

async function list(req, res) {
  res.json({ status: 200, message: "themes retrieved successfully", result: await themes.list() });
}

async function create(req, res) {
  res.json(await themes.create(req.body));
}

async function update(req, res) {
  res.json(await themes.update(req.params.id, req.body));
}

async function remove(req, res) {
  await themes.remove(req.params.id);
  res.json("Theme deleted successfully");
}

module.exports = { list, create, update, remove };
