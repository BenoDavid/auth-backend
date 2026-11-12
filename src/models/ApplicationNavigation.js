module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "ApplicationNavigation",
    {
      applicationName: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        field: "application_name",
      },
      landingRoute: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "landing_route",
      },
      navbarItems: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "navbar_items",
      },
    },
    { tableName: "app_application_navigation", timestamps: false },
  );
