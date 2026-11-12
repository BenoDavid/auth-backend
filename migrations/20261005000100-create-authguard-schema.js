"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("app_roles", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    });
    await queryInterface.createTable("app_permissions", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      appname: { type: Sequelize.STRING(255), allowNull: true },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    });
    await queryInterface.createTable("app_users", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      employee_code: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      employee_name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      auth_code: { type: Sequelize.STRING(255), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    });
    await queryInterface.createTable("app_user_roles", {
      employee_code: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: { model: "app_users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      role_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: { model: "app_roles", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    });
    await queryInterface.createTable("app_role_permissions", {
      role_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: { model: "app_roles", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      permission_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: { model: "app_permissions", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    });
    await queryInterface.createTable("app_themes", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      primary_color: { type: Sequelize.STRING(255), allowNull: true },
      secondary_color: { type: Sequelize.STRING(255), allowNull: true },
      text_color: { type: Sequelize.STRING(255), allowNull: true },
    });
    await queryInterface.createTable("app_applications", {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      application_name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
    });
    await queryInterface.createTable("application_themes", {
      application_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        references: { model: "app_applications", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      theme_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        references: { model: "app_themes", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("application_themes");
    await queryInterface.dropTable("app_applications");
    await queryInterface.dropTable("app_themes");
    await queryInterface.dropTable("app_role_permissions");
    await queryInterface.dropTable("app_user_roles");
    await queryInterface.dropTable("app_users");
    await queryInterface.dropTable("app_permissions");
    await queryInterface.dropTable("app_roles");
  },
};
