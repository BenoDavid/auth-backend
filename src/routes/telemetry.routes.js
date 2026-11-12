const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authenticate = require("../middleware/authenticate");
const authorizeAny = require("../middleware/authorize-any");
const controller = require("../controllers/telemetry.controller");

const router = express.Router();
router.use(authenticate);
router.get("/errors", authorizeAny(["admin-logs", "*"]), asyncHandler(controller.errors));
router.get("/usage", authorizeAny(["admin-user", "usage:read", "*"]), asyncHandler(controller.usage));
router.get("/summary", authorizeAny(["admin-user", "usage:read", "*"]), asyncHandler(controller.summary));
module.exports = router;
