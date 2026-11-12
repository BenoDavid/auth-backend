module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "UserRole",
    {
      userId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        field: "employee_code",
        references: { model: "app_users", key: "id" },
      },
      roleId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        field: "role_id",
        references: { model: "app_roles", key: "id" },
      },
    },
    { tableName: "app_user_roles", timestamps: false },
  );
