module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "ApplicationTheme",
    {
      applicationId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        field: "application_id",
        references: { model: "app_applications", key: "id" },
      },
      themeId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        field: "theme_id",
        references: { model: "app_themes", key: "id" },
      },
    },
    { tableName: "application_themes", timestamps: false },
  );
