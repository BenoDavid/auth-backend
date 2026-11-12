module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "Theme",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      primaryColor: { type: DataTypes.STRING(255), field: "primary_color" },
      secondaryColor: { type: DataTypes.STRING(255), field: "secondary_color" },
      textColor: { type: DataTypes.STRING(255), field: "text_color" },
    },
    { tableName: "app_themes", timestamps: false },
  );
