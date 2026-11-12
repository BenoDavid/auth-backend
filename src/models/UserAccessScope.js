module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "UserAccessScope",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.BIGINT, allowNull: false, field: "user_id" },
      applicationName: { type: DataTypes.STRING(120), allowNull: false, field: "application_name" },
      organizationId: { type: DataTypes.STRING(120), allowNull: true, field: "organization_id" },
      organizationName: { type: DataTypes.STRING(180), allowNull: true, field: "organization_name" },
      factoryId: { type: DataTypes.STRING(120), allowNull: true, field: "factory_id" },
      factoryName: { type: DataTypes.STRING(180), allowNull: true, field: "factory_name" },
      enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "app_user_access_scopes", timestamps: true, underscored: true },
  );
