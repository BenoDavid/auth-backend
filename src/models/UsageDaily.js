module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "UsageDaily",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      usageDate: { type: DataTypes.DATEONLY, allowNull: false, field: "usage_date" },
      applicationName: { type: DataTypes.STRING(120), allowNull: false, field: "application_name" },
      userId: { type: DataTypes.BIGINT, allowNull: false, field: "user_id" },
      employeeCode: { type: DataTypes.STRING(255), allowNull: true, field: "employee_code" },
      employeeName: { type: DataTypes.STRING(255), allowNull: true, field: "employee_name" },
      organizationId: { type: DataTypes.STRING(120), allowNull: true, field: "organization_id" },
      organizationName: { type: DataTypes.STRING(180), allowNull: true, field: "organization_name" },
      factoryId: { type: DataTypes.STRING(120), allowNull: true, field: "factory_id" },
      factoryName: { type: DataTypes.STRING(180), allowNull: true, field: "factory_name" },
      vendorId: { type: DataTypes.STRING(120), allowNull: true, field: "vendor_id" },
      vendorName: { type: DataTypes.STRING(180), allowNull: true, field: "vendor_name" },
      ipAddress: { type: DataTypes.STRING(80), allowNull: true, field: "ip_address" },
      loginAt: { type: DataTypes.DATE, allowNull: false, field: "login_at" },
      lastSeenAt: { type: DataTypes.DATE, allowNull: false, field: "last_seen_at" },
    },
    { tableName: "app_usage_daily", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" },
  );
