const { recordError } = require("../services/telemetry.service");

module.exports = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === "SequelizeUniqueConstraintError" ? 409 : 500);
  void recordError(req, error, status);
  if (status >= 500) console.error(error);
  res.status(status).json({
    status,
    message: status >= 500 ? "Internal server error" : error.message,
  });
};
