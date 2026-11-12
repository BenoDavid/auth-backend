"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const legacy = await queryInterface.sequelize.query(
      "SELECT id, application_name FROM app_applications WHERE LOWER(application_name) = 'root'",
      { type: Sequelize.QueryTypes.SELECT },
    );

    for (const application of legacy) {
      await queryInterface.bulkDelete("app_application_navigation", {
        application_name: application.application_name,
      });
      await queryInterface.bulkDelete("app_application_themes", {
        application_id: application.id,
      });
      await queryInterface.bulkDelete("app_applications", { id: application.id });
    }

    await queryInterface.bulkDelete("app_application_navigation", {
      application_name: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("application_name")),
        "root",
      ),
    });
  },

  async down() {
    // The legacy ROOT workspace is intentionally not restored. ROOT V2 is the supported administrator workspace.
  },
};
