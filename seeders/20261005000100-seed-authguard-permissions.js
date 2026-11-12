"use strict";

module.exports = {
  async up(queryInterface) {
    const [permissions] = await queryInterface.sequelize.query(
      "SELECT id FROM app_permissions WHERE name = '*'",
    );
    if (permissions.length === 0) {
      await queryInterface.bulkInsert("app_permissions", [{ name: "*", appname: "authguardv2", enabled: true }]);
    }
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM app_roles WHERE name = 'ADMIN'",
    );
    if (roles.length === 0) {
      await queryInterface.bulkInsert("app_roles", [{ name: "ADMIN", enabled: true }]);
    }
    const [adminRows] = await queryInterface.sequelize.query(
      "SELECT id FROM app_roles WHERE name = 'ADMIN'",
    );
    const [wildcardRows] = await queryInterface.sequelize.query(
      "SELECT id FROM app_permissions WHERE name = '*'",
    );
    const [links] = await queryInterface.sequelize.query(
      "SELECT role_id FROM app_role_permissions WHERE role_id = :roleId AND permission_id = :permissionId",
      { replacements: { roleId: adminRows[0].id, permissionId: wildcardRows[0].id } },
    );
    if (links.length === 0) {
      await queryInterface.bulkInsert("app_role_permissions", [{ role_id: adminRows[0].id, permission_id: wildcardRows[0].id }]);
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE FROM app_role_permissions WHERE role_id IN (SELECT id FROM app_roles WHERE name = 'ADMIN')",
    );
    await queryInterface.sequelize.query(
      "DELETE FROM app_user_roles WHERE role_id IN (SELECT id FROM app_roles WHERE name = 'ADMIN')",
    );
    await queryInterface.bulkDelete("app_roles", { name: "ADMIN" });
    await queryInterface.bulkDelete("app_permissions", { name: "*" });
  },
};
