const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/users.controller");
const loginRateLimit = require("../middleware/rate-limit");

const router = express.Router();
router.post("/users/register", asyncHandler(userController.register));
router.post("/users/login", loginRateLimit(), asyncHandler(authController.login));
router.post("/users/generate-token", loginRateLimit(), asyncHandler(authController.generateToken));
router.post("/token/need-token", loginRateLimit(), asyncHandler(authController.issueServiceToken));

module.exports = router;
