"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("app_users", "session_version", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.createTable("app_user_commands", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "app_users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      command_type: { type: Sequelize.STRING(16), allowNull: false },
      message: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("app_user_commands", ["user_id", "id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("app_user_commands");
    await queryInterface.removeColumn("app_users", "session_version");
  },
};
