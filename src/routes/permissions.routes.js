const createProtectedRouter = require("./routeFactory");
const controller = require("../controllers/permissions.controller");

module.exports = createProtectedRouter("permissions:manage", controller);
