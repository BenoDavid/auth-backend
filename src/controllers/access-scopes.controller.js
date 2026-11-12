const scopes = require("../services/access-scope.service");

async function list(req, res) { res.json({ status: 200, result: await scopes.list(req.params.id) }); }
async function replace(req, res) { res.json({ status: 200, message: "User data access scopes saved", result: await scopes.replace(req.params.id, req.body?.scopes) }); }

module.exports = { list, replace };
