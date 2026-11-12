const { TelemetryEvent, UsageDaily } = require("../models");

const safeHeaders = new Set(["user-agent", "x-request-id", "referer"]);

function contextFromRequest(req) {
  const user = req.user || {};
  const header = (name) => req.get(name) || null;
  return {
    applicationName: header("x-application-name") || header("x-app-name"),
    userId: user.id || null,
    employeeCode: user.employeeCode || null,
    employeeName: user.employeeName || null,
    organizationId: header("x-organization-id"),
    organizationName: header("x-organization-name"),
    factoryId: header("x-factory-id"),
    factoryName: header("x-factory-name"),
    vendorId: header("x-vendor-id"),
    vendorName: header("x-vendor-name"),
    ipAddress: req.ip || req.socket?.remoteAddress || null,
  };
}

function safeRequestMetadata(req) {
  return Object.fromEntries([...safeHeaders].map((key) => [key, req.get(key)]).filter(([, value]) => value));
}

async function recordUsage(req) {
  if (!req.user) return;
  try {
    const context = contextFromRequest(req);
    const usageDate = new Date().toISOString().slice(0, 10);
    const applicationName = context.applicationName || "IAM";
    const [row] = await UsageDaily.findOrCreate({
      where: { usageDate, applicationName, userId: context.userId },
      defaults: { usageDate, applicationName, ...context, loginAt: new Date(), lastSeenAt: new Date() },
    });
    if (row.lastSeenAt < new Date(Date.now() - 30_000)) await row.update({ lastSeenAt: new Date(), ...context });
  } catch (error) {
    console.error("Unable to record telemetry usage:", error.message);
  }
}

async function recordAppLogin(req, user) {
  req.user = user;
  await recordUsage(req);
}

async function recordError(req, error, statusCode) {
  try {
    await TelemetryEvent.create({
      eventType: "error",
      severity: statusCode >= 500 ? "error" : "warning",
      ...contextFromRequest(req),
      method: req.method,
      route: req.originalUrl?.split("?")[0],
      statusCode,
      message: error?.message || "Unhandled error",
      stack: process.env.NODE_ENV === "production" ? null : error?.stack || null,
      metadata: safeRequestMetadata(req),
    });
  } catch (telemetryError) {
    console.error("Unable to record telemetry error:", telemetryError.message);
  }
}

function requestTelemetry(req, res, next) {
  const startedAt = Date.now();
  res.once("finish", () => recordUsage(req));
  next();
}

module.exports = { requestTelemetry, recordError, recordAppLogin };
