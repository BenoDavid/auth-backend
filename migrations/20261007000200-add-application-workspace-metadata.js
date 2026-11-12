"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("app_applications", "application_icon", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("app_applications", "required_permission", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("app_applications", "required_permission");
    await queryInterface.removeColumn("app_applications", "application_icon");
  },
};
