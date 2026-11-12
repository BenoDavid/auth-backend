module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "Permission",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      appname: { type: DataTypes.STRING(255), allowNull: true },
      enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "app_permissions", timestamps: false },
  );
