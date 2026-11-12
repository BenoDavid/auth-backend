"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const employeeCode = process.env.SUPERADMIN_EMPLOYEE_CODE;
    const password = process.env.SUPERADMIN_PASSWORD;
    const employeeName = process.env.SUPERADMIN_NAME || "Super Administrator";

    if (!employeeCode || !password) {
      throw new Error("SUPERADMIN_EMPLOYEE_CODE and SUPERADMIN_PASSWORD must be configured before seeding");
    }

    const [existingUsers] = await queryInterface.sequelize.query(
      "SELECT id FROM app_users WHERE employee_code = :employeeCode",
      { replacements: { employeeCode }, type: Sequelize.QueryTypes.SELECT },
    );
    let userId = existingUsers?.id;

    if (!userId) {
      const authCode = await bcrypt.hash(password, 12);
      await queryInterface.bulkInsert("app_users", [{
        employee_code: employeeCode,
        employee_name: employeeName,
        auth_code: authCode,
        is_active: true,
      }]);
      const [createdUsers] = await queryInterface.sequelize.query(
        "SELECT id FROM app_users WHERE employee_code = :employeeCode",
        { replacements: { employeeCode }, type: Sequelize.QueryTypes.SELECT },
      );
      userId = createdUsers.id;
    }

    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM app_roles WHERE name = 'ADMIN'",
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (!roles) throw new Error("ADMIN role is missing; run the authguard permission seeder first");

    const [links] = await queryInterface.sequelize.query(
      "SELECT employee_code FROM app_user_roles WHERE employee_code = :userId AND role_id = :roleId",
      { replacements: { userId, roleId: roles.id }, type: Sequelize.QueryTypes.SELECT },
    );
    if (!links) {
      await queryInterface.bulkInsert("app_user_roles", [{ employee_code: userId, role_id: roles.id }]);
    }
  },

  async down(queryInterface) {
    const employeeCode = process.env.SUPERADMIN_EMPLOYEE_CODE;
    if (!employeeCode) return;
    await queryInterface.sequelize.query(
      "DELETE FROM app_user_roles WHERE employee_code IN (SELECT id FROM app_users WHERE employee_code = :employeeCode)",
      { replacements: { employeeCode } },
    );
    await queryInterface.bulkDelete("app_users", { employee_code: employeeCode });
  },
};
