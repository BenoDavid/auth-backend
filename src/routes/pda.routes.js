const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authenticate = require("../middleware/authenticate");
const controller = require("../controllers/pda.controller");

const router = express.Router();
router.post("/login", asyncHandler(controller.login));
router.get("/operators", authenticate, asyncHandler(controller.listOperatorUsers));

module.exports = router;
