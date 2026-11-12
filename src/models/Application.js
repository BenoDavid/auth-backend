module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "Application",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      applicationName: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: "application_name" },
      applicationIcon: { type: DataTypes.STRING(255), allowNull: true, field: "application_icon" },
      requiredPermission: { type: DataTypes.STRING(255), allowNull: true, field: "required_permission" },
    },
    { tableName: "app_applications", timestamps: false },
  );
