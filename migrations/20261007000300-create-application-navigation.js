"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("app_application_navigation", {
      application_name: {
        type: Sequelize.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      landing_route: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      navbar_items: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("app_application_navigation");
  },
};
