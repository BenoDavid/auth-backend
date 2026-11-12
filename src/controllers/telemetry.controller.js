const { Op, fn, col, literal } = require("sequelize");
const { TelemetryEvent, UsageDaily } = require("../models");

const filterFields = ["applicationName", "employeeCode", "organizationId", "factoryId", "vendorId", "ipAddress", "severity", "eventType"];

function whereFromQuery(query) {
  const where = {};
  for (const field of filterFields) if (query[field]) where[field] = { [Op.iLike]: `%${String(query[field]).slice(0, 100)}%` };
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt[Op.gte] = new Date(query.from);
    if (query.to) where.createdAt[Op.lte] = new Date(query.to);
  }
  if (query.search) {
    const search = `%${String(query.search).slice(0, 100)}%`;
    where[Op.or] = ["message", "route", "employeeName", "applicationName", "organizationName", "factoryName", "vendorName"].map((field) => ({ [field]: { [Op.iLike]: search } }));
  }
  return where;
}

function paging(query) {
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 25, 1), 100);
  const page = Math.max(Number(query.page) || 1, 1);
  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}

async function listErrors(req, res) {
  const { page, pageSize, limit, offset } = paging(req.query);
  const where = { ...whereFromQuery(req.query), eventType: "error" };
  const { rows, count } = await TelemetryEvent.findAndCountAll({ where, order: [["created_at", "DESC"]], limit, offset });
  res.json({ status: 200, result: rows, pagination: { page, pageSize, total: count, pages: Math.ceil(count / pageSize) } });
}

async function usage(req, res) {
  const { page, pageSize, limit, offset } = paging(req.query);
  const where = {};
  for (const field of ["applicationName", "employeeCode", "organizationId", "factoryId", "vendorId", "ipAddress"]) if (req.query[field]) where[field] = { [Op.iLike]: `%${String(req.query[field]).slice(0, 100)}%` };
  if (req.query.search) where[Op.or] = ["applicationName", "employeeCode", "employeeName", "organizationName", "factoryName", "vendorName", "ipAddress"].map((field) => ({ [field]: { [Op.iLike]: `%${String(req.query.search).slice(0, 100)}%` } }));
  if (req.query.from || req.query.to) { where.usageDate = {}; if (req.query.from) where.usageDate[Op.gte] = req.query.from; if (req.query.to) where.usageDate[Op.lte] = req.query.to; }
  const { rows, count } = await UsageDaily.findAndCountAll({ where, order: [["usage_date", "DESC"], ["last_seen_at", "DESC"]], limit, offset });
  res.json({ status: 200, result: rows, pagination: { page, pageSize, total: count, pages: Math.ceil(count / pageSize) } });
}

async function errors(req, res) { return listErrors(req, res); }

async function summary(req, res) {
  const where = whereFromQuery(req.query);
  const [total, errorsCount, users, applications, average] = await Promise.all([
    UsageDaily.count({ where }),
    TelemetryEvent.count({ where: { ...where, eventType: "error" } }),
    UsageDaily.count({ where, distinct: true, col: "user_id" }),
    UsageDaily.count({ where, distinct: true, col: "application_name" }),
  ]);
  res.json({ status: 200, result: { activeUserDays: total, totalErrors: errorsCount, errorRate: total ? Number(((errorsCount / total) * 100).toFixed(2)) : 0, uniqueUsers: users, applications } });
}

module.exports = { errors, usage, summary };
