module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "AdminUserCommand",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.BIGINT, allowNull: false, field: "user_id" },
      commandType: {
        type: DataTypes.STRING(16),
        allowNull: false,
        field: "command_type",
      },
      message: { type: DataTypes.STRING(500), allowNull: true },
      applicationName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "application_name",
      },
      targetRoute: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "target_route",
      },
      createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
    },
    {
      tableName: "app_user_commands",
      timestamps: false,
      indexes: [{ fields: ["user_id", "id"] }],
    },
  );
