"use strict";

const navbarItems = [
  ["bi-activity", "/adminv2/error/logs", "Error Logs", "admin-logs"],
  ["bi-wrench-adjustable", "/adminv2/webutil", "WebUtil", "admin-user"],
  ["bi-palette", "/adminv2/theme", "Theme", "admin-user"],
  ["bi-person-vcard", "/adminv2/user", "User", "admin-user"],
  ["bi-grid", "/adminv2/application", "Applications", "applications:manage"],
  ["bi-key", "/adminv2/permission", "Permission", "admin-permission"],
  ["bi-people", "/adminv2/role", "Role", "admin-role"],
  ["bi-person-lines-fill", "/adminv2/employees", "Employees", "admin-user"],
  ["bi-list-nested", "/adminv2/workspace-navigation", "Workspace navigation", "applications:manage"],
  ["bi-person-lines-fill", "/adminv2/vendors", "Vendors", "vendors:manage"],
].map(([icon, link, label, permission]) => ({ icon, link, label, permission }));

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("app_application_navigation", [{
      application_name: "superadminv2",
      landing_route: "/adminv2/welcome",
      navbar_items: JSON.stringify(navbarItems),
    }], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("app_application_navigation", { application_name: "superadminv2" });
  },
};
