"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("app_permissions", [{ name: "access-scopes:manage", appname: "ROOTV2", enabled: true }], { ignoreDuplicates: true });
    const [permission] = await queryInterface.sequelize.query("SELECT id FROM app_permissions WHERE name = 'access-scopes:manage' LIMIT 1", { type: Sequelize.QueryTypes.SELECT });
    const [role] = await queryInterface.sequelize.query("SELECT id FROM app_roles WHERE name IN ('SUPERADMIN', 'ADMIN') ORDER BY CASE WHEN name = 'SUPERADMIN' THEN 0 ELSE 1 END LIMIT 1", { type: Sequelize.QueryTypes.SELECT });
    if (permission?.id && role?.id) await queryInterface.bulkInsert("app_role_permissions", [{ role_id: role.id, permission_id: permission.id }], { ignoreDuplicates: true });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query("DELETE FROM app_role_permissions WHERE permission_id IN (SELECT id FROM app_permissions WHERE name = 'access-scopes:manage')");
    await queryInterface.sequelize.query("DELETE FROM app_permissions WHERE name = 'access-scopes:manage'");
  },
};
