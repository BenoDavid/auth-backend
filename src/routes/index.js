const express = require("express");

const router = express.Router();
router.use(require("./auth.routes"));
router.use("/users", require("./users.routes"));
router.use("/roles", require("./roles.routes"));
router.use("/permissions", require("./permissions.routes"));
router.use("/applications", require("./applications.routes"));
router.use("/themes", require("./themes.routes"));
router.use("/pda", require("./pda.routes"));
router.use("/vendors", require("./vendors.routes"));
router.use("/telemetry", require("./telemetry.routes"));

module.exports = router;
