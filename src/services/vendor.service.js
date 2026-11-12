const { Op } = require("sequelize");
const { Vendor } = require("../models");
const HttpError = require("../errors/HttpError");
const { filterVendors, assertVendorScope } = require("../security/data-scope");

function text(value) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function payload(values) {
  const result = { ...values };
  result.code = text(values.code);
  result.name = text(values.name);
  if (!result.code || !result.name) throw new HttpError(400, "Vendor code and name are required");
  result.category = text(values.category) || "General";
  result.contactName = text(values.contactName || values.contact);
  result.phone = text(values.phone); result.email = text(values.email);
  result.organizationId = text(values.organizationId); result.organizationName = text(values.organizationName);
  result.factoryId = text(values.factoryId); result.factoryName = text(values.factoryName);
  result.serviceLevel = text(values.serviceLevel) || "Standard"; result.status = text(values.status) || "Active"; result.notes = text(values.notes);
  return result;
}

async function list(req) {
  const where = {};
  if (req.query.search) where[Op.or] = [{ code: { [Op.iLike]: `%${req.query.search}%` } }, { name: { [Op.iLike]: `%${req.query.search}%` } }, { category: { [Op.iLike]: `%${req.query.search}%` } }];
  return filterVendors(req, await Vendor.findAll({ where, order: [["name", "ASC"]] }));
}
async function create(req) { const values = payload(req.body || {}); assertVendorScope(req, values); return Vendor.create(values); }
async function update(req) { const vendor = await Vendor.findByPk(req.params.id); if (!vendor) throw new HttpError(404, "Vendor not found"); assertVendorScope(req, vendor); const values = payload({ ...vendor.toJSON(), ...(req.body || {}) }); assertVendorScope(req, values); await vendor.update(values); return vendor; }
async function remove(req) { const vendor = await Vendor.findByPk(req.params.id); if (!vendor) throw new HttpError(404, "Vendor not found"); assertVendorScope(req, vendor); await vendor.destroy(); }

module.exports = { list, create, update, remove };
