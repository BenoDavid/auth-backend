const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const authorizeAny = require("../middleware/authorize-any");
const controller = require("../controllers/vendors.controller");

const router = express.Router();
router.get("/", authenticate, authorizeAny(["vendors:manage", "vendors:read", "MMMS-VENDORS", "WMS-VENDORS"]), asyncHandler(controller.list));
router.post("/", authenticate, authorize("vendors:manage"), asyncHandler(controller.create));
router.put("/:id", authenticate, authorize("vendors:manage"), asyncHandler(controller.update));
router.delete("/:id", authenticate, authorize("vendors:manage"), asyncHandler(controller.remove));
module.exports = router;
