const HttpError = require("../errors/HttpError");
const { userHasPermission } = require("../security/permissions");

module.exports = (permissionName) => (req, res, next) => {
  if (!userHasPermission(req.user, permissionName)) {
    return next(new HttpError(403, "Insufficient permissions"));
  }
  next();
};
