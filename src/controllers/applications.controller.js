const applications = require("../services/application.service");

async function list(req, res) {
  res.json({ status: 200, message: "applications retrieved successfully", result: await applications.list() });
}

async function workspace(req, res) {
  const result = await applications.listWorkspace(req);
  res.json({
    status: 200,
    message: "application workspace retrieved successfully",
    result: result.applications,
    navigation: result.navigation,
  });
}

async function listNavigation(req, res) {
  res.json({
    status: 200,
    message: "workspace navigation retrieved successfully",
    result: await applications.listNavigation(),
  });
}

async function saveNavigation(req, res) {
  res.json({
    status: 200,
    message: "workspace navigation saved successfully",
    result: await applications.saveNavigation(
      req.params.applicationName,
      req.body,
    ),
  });
}

async function removeNavigation(req, res) {
  res.json({
    status: 200,
    message: "Application navigation and related data deleted successfully",
    result: await applications.removeNavigation(req.params.applicationName),
  });
}

async function create(req, res) {
  res.json(await applications.create(req.body));
}

async function update(req, res) {
  res.json(await applications.update(req.params.id, req.body));
}

async function remove(req, res) {
  res.json({
    status: 200,
    message: "Application and related workspace data deleted successfully",
    result: await applications.remove(req.params.id),
  });
}

module.exports = {
  list,
  workspace,
  listNavigation,
  saveNavigation,
  removeNavigation,
  create,
  update,
  remove,
};
