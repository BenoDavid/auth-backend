"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("app_vendors", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal("gen_random_uuid()") },
      code: { type: Sequelize.STRING(80), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(180), allowNull: false },
      category: { type: Sequelize.STRING(120), allowNull: false, defaultValue: "General" },
      contact_name: { type: Sequelize.STRING(160), allowNull: true },
      phone: { type: Sequelize.STRING(80), allowNull: true },
      email: { type: Sequelize.STRING(180), allowNull: true },
      organization_id: { type: Sequelize.STRING(120), allowNull: true },
      organization_name: { type: Sequelize.STRING(180), allowNull: true },
      factory_id: { type: Sequelize.STRING(120), allowNull: true },
      factory_name: { type: Sequelize.STRING(180), allowNull: true },
      service_level: { type: Sequelize.STRING(80), allowNull: false, defaultValue: "Standard" },
      status: { type: Sequelize.STRING(40), allowNull: false, defaultValue: "Active" },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("app_vendors", ["organization_id", "factory_id"]);
    await queryInterface.bulkInsert("app_vendors", [{
      id: Sequelize.literal("gen_random_uuid()"), code: "VND-001", name: "Precision Industrial Services", category: "Mechanical", contact_name: "Rami N.", phone: "+962 6 000 0000", email: "service@precision.local", service_level: "Standard", status: "Active", created_at: new Date(), updated_at: new Date(),
    }]);
  },
  async down(queryInterface) { await queryInterface.dropTable("app_vendors"); },
};
