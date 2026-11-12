function values(record, keys) {
  return keys.map((key) => record?.[key]).filter((value) => value !== undefined && value !== null && String(value).trim()).map((value) => String(value).trim().toLowerCase());
}

function permissionNames(req) {
  return Array.isArray(req.authClaims?.permissions) ? req.authClaims.permissions : [];
}

function isGlobal(req) { return permissionNames(req).includes("*") || permissionNames(req).includes("vendors:manage"); }

function vendorAssignments(req) {
  if (isGlobal(req)) return null;
  return (Array.isArray(req.authClaims?.accessScopes) ? req.authClaims.accessScopes : []).filter((scope) => scope.enabled !== false && ["*", "MMMS", "WMS", "ROOTV2", "SUPERADMINV2"].includes(String(scope.applicationName || "").toUpperCase()));
}

function vendorMatchesScope(vendor, assignments) {
  if (assignments === null) return true;
  if (!assignments.length) return false;
  return assignments.some((scope) => {
    const organization = values(vendor, ["organizationId", "organizationName"]);
    const factory = values(vendor, ["factoryId", "factoryName"]);
    const assignedOrganizations = values(scope, ["organizationId", "organizationName"]);
    const assignedFactories = values(scope, ["factoryId", "factoryName"]);
    return (!assignedOrganizations.length || assignedOrganizations.some((item) => organization.includes(item))) && (!assignedFactories.length || assignedFactories.some((item) => factory.includes(item)));
  });
}

function filterVendors(req, vendors) { const assignments = vendorAssignments(req); return vendors.filter((vendor) => vendorMatchesScope(vendor, assignments)); }
function assertVendorScope(req, vendor) { if (!vendorMatchesScope(vendor, vendorAssignments(req))) { const error = new Error("Vendor is outside your assigned organization or factory scope"); error.status = 403; throw error; } }

module.exports = { filterVendors, assertVendorScope, vendorAssignments, isGlobal };
