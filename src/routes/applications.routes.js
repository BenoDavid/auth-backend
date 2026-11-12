const express = require("express");
const createProtectedRouter = require("./routeFactory");
const asyncHandler = require("../middleware/asyncHandler");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const controller = require("../controllers/applications.controller");

const router = express.Router();
router.get("/workspace", authenticate, asyncHandler(controller.workspace));
router.get(
  "/navigation",
  authenticate,
  authorize("applications:manage"),
  asyncHandler(controller.listNavigation),
);
router.put(
  "/navigation/:applicationName",
  authenticate,
  authorize("applications:manage"),
  asyncHandler(controller.saveNavigation),
);
router.delete(
  "/navigation/:applicationName",
  authenticate,
  authorize("applications:manage"),
  asyncHandler(controller.removeNavigation),
);
router.use(createProtectedRouter("applications:manage", controller, { statusRoute: false }));

module.exports = router;
