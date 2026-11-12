"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("app_user_access_scopes", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: "app_users", key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" },
      application_name: { type: Sequelize.STRING(120), allowNull: false },
      organization_id: { type: Sequelize.STRING(120), allowNull: true },
      organization_name: { type: Sequelize.STRING(180), allowNull: true },
      factory_id: { type: Sequelize.STRING(120), allowNull: true },
      factory_name: { type: Sequelize.STRING(180), allowNull: true },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("app_user_access_scopes", ["user_id", "application_name"]);
    await queryInterface.addIndex("app_user_access_scopes", ["organization_id", "factory_id"]);
  },
  async down(queryInterface) { await queryInterface.dropTable("app_user_access_scopes"); },
};
