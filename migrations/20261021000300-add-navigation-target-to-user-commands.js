"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("app_user_commands", "application_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("app_user_commands", "target_route", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("app_user_commands", "target_route");
    await queryInterface.removeColumn("app_user_commands", "application_name");
  },
};
