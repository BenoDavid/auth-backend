const createProtectedRouter = require("./routeFactory");
const controller = require("../controllers/roles.controller");

module.exports = createProtectedRouter("roles:manage", controller);
