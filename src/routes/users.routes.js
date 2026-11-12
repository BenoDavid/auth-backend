const express = require("express");
const createProtectedRouter = require("./routeFactory");
const controller = require("../controllers/users.controller");
const asyncHandler = require("../middleware/asyncHandler");
const authenticate = require("../middleware/authenticate");
const { safeUser } = require("../services/auth.service");
const HttpError = require("../errors/HttpError");
const authorize = require("../middleware/authorize");
const users = require("../services/users.service");
const { notifyPresenceChanged } = require("../services/presence-events");
const scopeController = require("../controllers/access-scopes.controller");

const router = express.Router();

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ status: 200, result: safeUser(req.user) });
  }),
);

router.post(
  "/me/activity",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user.id) {
      throw new HttpError(503, "Presence tracking is unavailable in development mode");
    }
    const lastActivityAt = new Date();
    await req.user.update({ lastActivityAt });
    notifyPresenceChanged();
    res.json({ status: 200, result: { lastActivityAt } });
  }),
);

router.get(
  "/me/commands",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user.id || !Number.isSafeInteger(req.authClaims?.iat)) {
      throw new HttpError(503, "Admin commands are unavailable in development mode");
    }
    const afterId = req.query.after ?? "0";
    if (typeof afterId !== "string" || !/^\d{1,19}$/.test(afterId)) {
      throw new HttpError(400, "after must be a non-negative integer");
    }
    const result = await users.listAdminCommands(
      req.user.id,
      new Date(req.authClaims.iat * 1000),
      afterId,
    );
    res.json({ status: 200, result });
  }),
);

router.post(
  "/:id/commands",
  authenticate,
  authorize("users:manage"),
  asyncHandler(controller.issueAdminCommand),
);

router.get("/:id/scopes", authenticate, authorize("access-scopes:manage"), asyncHandler(scopeController.list));
router.put("/:id/scopes", authenticate, authorize("access-scopes:manage"), asyncHandler(scopeController.replace));

router.use(createProtectedRouter("users:manage", controller));

module.exports = router;
