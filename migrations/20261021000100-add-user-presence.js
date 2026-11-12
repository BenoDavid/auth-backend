"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("app_users", "last_login_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("app_users", "last_activity_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("app_users", "last_activity_at");
    await queryInterface.removeColumn("app_users", "last_login_at");
  },
};
