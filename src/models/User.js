module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "User",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      employeeCode: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: "employee_code" },
      employeeName: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: "employee_name" },
      authCode: { type: DataTypes.STRING(255), allowNull: false, field: "auth_code" },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "is_active" },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: "last_login_at" },
      lastActivityAt: { type: DataTypes.DATE, allowNull: true, field: "last_activity_at" },
      sessionVersion: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "session_version" },
    },
    { tableName: "app_users", timestamps: false, defaultScope: { attributes: { exclude: ["authCode"] } } },
  );
