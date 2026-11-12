const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

module.exports = function createProtectedRouter(permission, controller, { statusRoute = true } = {}) {
  const router = express.Router();
  const route = (handler) => asyncHandler(handler);
  router.use(authenticate, authorize(permission));
  router.get("/", route(controller.list));
  router.post("/", route(controller.create));
  router.put("/:id", route(controller.update));
  if (statusRoute && controller.setStatus) router.patch("/:id/status", route(controller.setStatus));
  router.delete("/:id", route(controller.remove));
  return router;
};
