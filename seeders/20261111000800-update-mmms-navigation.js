"use strict";

const pages = [
  ["bi-speedometer2", "/mmms", "Dashboard", "MMMS-DASHBOARD"],
  ["bi-building", "/mmms/organization", "Organization", "MMMS-ORGANIZATION"],
  ["bi-buildings", "/mmms/factories", "Factories & Sites", "MMMS-FACTORIES"],
  ["bi-diagram-3", "/mmms/departments", "Departments", "MMMS-DEPARTMENTS"],
  ["bi-layout-three-columns", "/mmms/production-lines", "Floors & Production Lines", "MMMS-PRODUCTION-LINES"],
  ["bi-tags", "/mmms/machine-categories", "Machine Categories", "MMMS-MACHINE-CATEGORIES"],
  ["bi-cpu", "/mmms/machines", "Machine Master", "MMMS-MACHINES"],
  ["bi-pin-map", "/mmms/allocations", "Machine Allocation", "MMMS-ALLOCATIONS"],
  ["bi-arrow-left-right", "/mmms/transfers", "Machine Transfers", "MMMS-TRANSFERS"],
  ["bi-qr-code-scan", "/mmms/qr-management", "QR Code Management", "MMMS-QR-MANAGEMENT"],
  ["bi-exclamation-triangle", "/mmms/breakdowns", "Breakdowns", "MMMS-BREAKDOWNS"],
  ["bi-people", "/mmms/technicians", "Mechanics & Technicians", "MMMS-TECHNICIANS"],
  ["bi-clock-history", "/mmms/machines", "Maintenance History", "MMMS-HISTORY"],
  ["bi-calendar2-week", "/mmms/preventive-maintenance", "Preventive Maintenance", "MMMS-PREVENTIVE-MAINTENANCE"],
  ["bi-clipboard2-pulse", "/mmms/work-orders", "Work Orders", "MMMS-WORK-ORDERS"],
  ["bi-clipboard-check", "/mmms/inspections", "Inspections", "MMMS-INSPECTIONS"],
  ["bi-box-seam", "/mmms/spare-parts", "Spare Parts", "MMMS-SPARE-PARTS"],
  ["bi-cash-stack", "/mmms/costs", "Maintenance Costs", "MMMS-COSTS"],
  ["bi-person-lines-fill", "/mmms/vendors", "Vendors", "MMMS-VENDORS"],
  ["bi-sliders2-vertical", "/mmms/calibration", "Calibration", "MMMS-CALIBRATION"],
  ["bi-bar-chart-line", "/mmms/reports", "Reports & Analytics", "MMMS-REPORTS"],
  ["bi-bell", "/mmms/notifications", "Notifications", "MMMS-NOTIFICATIONS"],
  ["bi-phone", "/mmms/mobile", "Mobile Maintenance", "MMMS-MOBILE"],
  ["bi-gear", "/mmms/configuration", "Application Configuration", "MMMS-CONFIGURATION"],
  ["bi-question-circle", "/mmms/help", "Help & User Guide", "MMMS-HELP"],
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const permissions = pages.map(([, , , permission]) => permission);
    const existing = await queryInterface.sequelize.query("SELECT id, name FROM app_permissions WHERE name IN (:names)", { replacements: { names: permissions }, type: Sequelize.QueryTypes.SELECT });
    const existingNames = new Set(existing.map((row) => row.name));
    const missing = permissions.filter((name) => !existingNames.has(name)).map((name) => ({ name, appname: "MMMS", enabled: true }));
    if (missing.length) await queryInterface.bulkInsert("app_permissions", missing);

    const roleRows = await queryInterface.sequelize.query("SELECT id FROM app_roles WHERE UPPER(name) IN ('ADMIN', 'SUPERADMIN', 'SUPER ADMIN')", { type: Sequelize.QueryTypes.SELECT });
    const permissionRows = await queryInterface.sequelize.query("SELECT id FROM app_permissions WHERE name IN (:names)", { replacements: { names: permissions }, type: Sequelize.QueryTypes.SELECT });
    for (const role of roleRows) {
      const links = await queryInterface.sequelize.query("SELECT permission_id FROM app_role_permissions WHERE role_id = :roleId", { replacements: { roleId: role.id }, type: Sequelize.QueryTypes.SELECT });
      const linked = new Set(links.map((link) => link.permission_id));
      const missingLinks = permissionRows.filter((permission) => !linked.has(permission.id)).map((permission) => ({ role_id: role.id, permission_id: permission.id }));
      if (missingLinks.length) await queryInterface.bulkInsert("app_role_permissions", missingLinks);
    }

    await queryInterface.bulkUpdate("app_application_navigation", { landing_route: "/mmms", navbar_items: JSON.stringify(pages.map(([icon, link, label, permission]) => ({ icon, link, label, permission }))) }, { application_name: "MMMS" });
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate("app_application_navigation", { landing_route: "/mmms", navbar_items: JSON.stringify(pages.slice(0, 1).map(([icon, link, label, permission]) => ({ icon, link, label, permission }))) }, { application_name: "MMMS" });
  },
};
