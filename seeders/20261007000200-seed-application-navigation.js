"use strict";

const configurations = require("./workspace-navigation.json");

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT application_name FROM app_application_navigation",
      { type: Sequelize.QueryTypes.SELECT },
    );
    const existingNames = new Set(
      existing.map((record) => record.application_name.toLocaleLowerCase()),
    );
    const missing = configurations
      .filter((configuration) => !existingNames.has(configuration.applicationName.toLocaleLowerCase()))
      .map((configuration) => ({
        application_name: configuration.applicationName,
        landing_route: configuration.landingRoute,
        navbar_items: JSON.stringify(configuration.navbarItems),
      }));

    if (missing.length > 0) {
      await queryInterface.bulkInsert("app_application_navigation", missing);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("app_application_navigation", {
      application_name: {
        [Sequelize.Op.in]: configurations.map((configuration) => configuration.applicationName),
      },
    });
  },
};
