"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("app_telemetry_events", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      event_type: { type: Sequelize.STRING(30), allowNull: false },
      severity: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "info" },
      application_name: { type: Sequelize.STRING(120) }, user_id: { type: Sequelize.BIGINT },
      employee_code: { type: Sequelize.STRING(255) }, employee_name: { type: Sequelize.STRING(255) },
      organization_id: { type: Sequelize.STRING(120) }, organization_name: { type: Sequelize.STRING(180) },
      factory_id: { type: Sequelize.STRING(120) }, factory_name: { type: Sequelize.STRING(180) },
      vendor_id: { type: Sequelize.STRING(120) }, vendor_name: { type: Sequelize.STRING(180) },
      ip_address: { type: Sequelize.STRING(80) }, method: { type: Sequelize.STRING(12) }, route: { type: Sequelize.STRING(255) },
      status_code: { type: Sequelize.INTEGER }, duration_ms: { type: Sequelize.INTEGER }, message: { type: Sequelize.TEXT }, stack: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("app_telemetry_events", ["event_type", "created_at"]);
    await queryInterface.addIndex("app_telemetry_events", ["application_name", "employee_code"]);
    await queryInterface.addIndex("app_telemetry_events", ["organization_id", "factory_id", "vendor_id"]);
  },
  async down(queryInterface) { await queryInterface.dropTable("app_telemetry_events"); },
};
