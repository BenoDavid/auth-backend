const HttpError = require("../errors/HttpError");
const { userHasPermission } = require("../security/permissions");

module.exports = (permissionNames) => (req, res, next) => {
  if (!permissionNames.some((permission) => userHasPermission(req.user, permission))) return next(new HttpError(403, "Insufficient permissions"));
  next();
};
