module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "Vendor",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      code: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      name: { type: DataTypes.STRING(180), allowNull: false },
      category: { type: DataTypes.STRING(120), allowNull: false, defaultValue: "General" },
      contactName: { type: DataTypes.STRING(160), field: "contact_name" },
      phone: { type: DataTypes.STRING(80) },
      email: { type: DataTypes.STRING(180) },
      organizationId: { type: DataTypes.STRING(120), field: "organization_id" },
      organizationName: { type: DataTypes.STRING(180), field: "organization_name" },
      factoryId: { type: DataTypes.STRING(120), field: "factory_id" },
      factoryName: { type: DataTypes.STRING(180), field: "factory_name" },
      serviceLevel: { type: DataTypes.STRING(80), field: "service_level", defaultValue: "Standard" },
      status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: "Active" },
      notes: { type: DataTypes.TEXT },
    },
    { tableName: "app_vendors", timestamps: true, underscored: true },
  );
