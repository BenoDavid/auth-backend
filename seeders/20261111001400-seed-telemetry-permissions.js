"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("app_permissions", [{ name: "usage:read", appname: "ROOTV2", enabled: true }], { ignoreDuplicates: true });
    const [permission] = await queryInterface.sequelize.query("SELECT id FROM app_permissions WHERE name = 'usage:read' LIMIT 1", { type: Sequelize.QueryTypes.SELECT });
    const roles = await queryInterface.sequelize.query("SELECT id FROM app_roles WHERE UPPER(name) IN ('SUPERADMIN', 'ADMIN')", { type: Sequelize.QueryTypes.SELECT });
    for (const role of roles) if (permission?.id) await queryInterface.bulkInsert("app_role_permissions", [{ role_id: role.id, permission_id: permission.id }], { ignoreDuplicates: true });
  },
  async down(queryInterface) { await queryInterface.sequelize.query("DELETE FROM app_role_permissions WHERE permission_id IN (SELECT id FROM app_permissions WHERE name = 'usage:read')"); await queryInterface.bulkDelete("app_permissions", { name: "usage:read" }); },
};
