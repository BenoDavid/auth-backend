module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "RolePermission",
    {
      roleId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        field: "role_id",
        references: { model: "app_roles", key: "id" },
      },
      permissionId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        field: "permission_id",
        references: { model: "app_permissions", key: "id" },
      },
    },
    { tableName: "app_role_permissions", timestamps: false },
  );
