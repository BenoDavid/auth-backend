const jwt = require("jsonwebtoken");
const { User, Role, Permission, UserAccessScope } = require("../models");
const HttpError = require("../errors/HttpError");

module.exports = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "development") {
      const header =
        typeof req.get === "function" ? req.get("authorization") || "" : "";
      if (header === "Bearer development") {
        throw new HttpError(
          401,
          "Development session is outdated; sign in again",
        );
      }
      const match = header.match(/^Bearer development:(\d+):(\d+):(\d+)$/);
      if (match) {
        const user = await User.findByPk(match[1]);
        if (
          !user ||
          !user.isActive ||
          user.sessionVersion !== Number(match[2]) ||
          !Number.isSafeInteger(Number(match[3]))
        ) {
          throw new HttpError(401, "User is unavailable");
        }
        req.user = user;
        req.user.roles = [
          { enabled: true, permissions: [{ name: "*", enabled: true }] },
        ];
        req.authClaims = {
          sub: user.employeeCode,
          sessionVersion: user.sessionVersion,
          iat: Number(match[3]),
          permissions: ["*"],
          accessScopes: [],
        };
        return next();
      }
      if (process.env.ALLOW_DEV_AUTH_BYPASS !== "true") {
        throw new HttpError(401, "Bearer token required");
      }
      const address = req.ip || req.socket?.remoteAddress || "";
      if (!/^::ffff:127\.0\.0\.1$|^127\.0\.0\.1$|^::1$/.test(address)) {
        throw new HttpError(401, "Development bypass is restricted to local requests");
      }
      req.user = {
        roles: [{ enabled: true, permissions: [{ name: "*", enabled: true }] }],
      };
      req.authClaims = {
        permissions: ["*"],
        accessScopes: [],
      };
      return next();
    }

    const header = req.get("authorization") || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) throw new HttpError(401, "Bearer token required");

    let claims;
    try {
      claims = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: process.env.JWT_ISSUER || "platform-iam",
        audience: process.env.JWT_AUDIENCE || "platform-applications",
      });
    } catch {
      throw new HttpError(401, "Invalid or expired token");
    }

    const user = await User.findOne({
      where: { employeeCode: claims.sub },
      include: [
        { model: Role, as: "roles", through: { attributes: [] }, include: [{ model: Permission, as: "permissions", through: { attributes: [] } }] },
        { model: UserAccessScope, as: "accessScopes", where: { enabled: true }, required: false },
      ],
    });
    if (!user || !user.isActive) throw new HttpError(401, "User is unavailable");
    if ((claims.sessionVersion ?? 0) !== user.sessionVersion) {
      throw new HttpError(401, "User session was ended by an administrator");
    }
    req.user = user;
    req.authClaims = claims;
    next();
  } catch (error) {
    next(error);
  }
};
