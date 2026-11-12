"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("app_usage_daily", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      usage_date: { type: Sequelize.DATEONLY, allowNull: false }, application_name: { type: Sequelize.STRING(120), allowNull: false }, user_id: { type: Sequelize.BIGINT, allowNull: false },
      employee_code: { type: Sequelize.STRING(255) }, employee_name: { type: Sequelize.STRING(255) }, organization_id: { type: Sequelize.STRING(120) }, organization_name: { type: Sequelize.STRING(180) }, factory_id: { type: Sequelize.STRING(120) }, factory_name: { type: Sequelize.STRING(180) }, vendor_id: { type: Sequelize.STRING(120) }, vendor_name: { type: Sequelize.STRING(180) }, ip_address: { type: Sequelize.STRING(80) }, login_at: { type: Sequelize.DATE, allowNull: false }, last_seen_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addConstraint("app_usage_daily", { fields: ["usage_date", "application_name", "user_id"], type: "unique", name: "app_usage_daily_date_app_user_unique" });
    await queryInterface.addIndex("app_usage_daily", ["usage_date", "application_name"]);
    await queryInterface.addIndex("app_usage_daily", ["organization_id", "factory_id", "vendor_id"]);
  },
  async down(queryInterface) { await queryInterface.dropTable("app_usage_daily"); },
};
