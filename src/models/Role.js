module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "Role",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "app_roles", timestamps: false },
  );
