"use strict";

const ROOT_V2_VENDOR_NAV = {
  icon: "bi-person-lines-fill",
  link: "/adminv2/vendors",
  label: "Vendors",
  permission: "vendors:manage",
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("app_permissions", [
      { name: "vendors:manage", appname: "ROOTV2", enabled: true },
      { name: "vendors:read", appname: "ROOTV2", enabled: true },
    ], { ignoreDuplicates: true });

    const permissions = await queryInterface.sequelize.query(
      "SELECT id FROM app_permissions WHERE name IN ('vendors:manage', 'vendors:read')",
      { type: Sequelize.QueryTypes.SELECT },
    );
    const roles = await queryInterface.sequelize.query(
      "SELECT id FROM app_roles WHERE UPPER(name) IN ('ADMIN', 'SUPERADMIN', 'SUPER ADMIN')",
      { type: Sequelize.QueryTypes.SELECT },
    );
    for (const role of roles) {
      const links = permissions.map((permission) => ({ role_id: role.id, permission_id: permission.id }));
      if (links.length) await queryInterface.bulkInsert("app_role_permissions", links, { ignoreDuplicates: true });
    }

    const rows = await queryInterface.sequelize.query(
      "SELECT application_name, navbar_items FROM app_application_navigation WHERE application_name = 'superadminv2' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT },
    );
    const row = rows[0];
    if (!row) return;
    const current = Array.isArray(row.navbar_items) ? row.navbar_items : JSON.parse(row.navbar_items || "[]");
    const next = current.filter((item) => item?.link !== ROOT_V2_VENDOR_NAV.link);
    next.push(ROOT_V2_VENDOR_NAV);
    await queryInterface.bulkUpdate("app_application_navigation", { navbar_items: JSON.stringify(next) }, { application_name: row.application_name });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "DELETE FROM app_role_permissions WHERE permission_id IN (SELECT id FROM app_permissions WHERE name IN ('vendors:manage', 'vendors:read'))",
    );
    await queryInterface.bulkDelete("app_permissions", { name: { [Sequelize.Op.in]: ["vendors:manage", "vendors:read"] } });
  },
};
