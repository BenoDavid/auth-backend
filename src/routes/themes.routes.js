const createProtectedRouter = require("./routeFactory");
const controller = require("../controllers/themes.controller");

module.exports = createProtectedRouter("themes:manage", controller, { statusRoute: false });
