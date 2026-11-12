const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const models = {
  User: require("./User")(sequelize, DataTypes),
  AdminUserCommand: require("./AdminUserCommand")(sequelize, DataTypes),
  Role: require("./Role")(sequelize, DataTypes),
  Permission: require("./Permission")(sequelize, DataTypes),
  UserRole: require("./UserRole")(sequelize, DataTypes),
  UserAccessScope: require("./UserAccessScope")(sequelize, DataTypes),
  Vendor: require("./Vendor")(sequelize, DataTypes),
  RolePermission: require("./RolePermission")(sequelize, DataTypes),
  Theme: require("./Theme")(sequelize, DataTypes),
  Application: require("./Application")(sequelize, DataTypes),
  ApplicationNavigation: require("./ApplicationNavigation")(sequelize, DataTypes),
  ApplicationTheme: require("./ApplicationTheme")(sequelize, DataTypes),
  TelemetryEvent: require("./TelemetryEvent")(sequelize, DataTypes),
  UsageDaily: require("./UsageDaily")(sequelize, DataTypes),
};

const { User, AdminUserCommand, Role, Permission, UserRole, RolePermission, Theme, Application, ApplicationTheme, UserAccessScope } = models;

User.hasMany(AdminUserCommand, { as: "adminCommands", foreignKey: "userId" });
AdminUserCommand.belongsTo(User, { as: "user", foreignKey: "userId" });
User.belongsToMany(Role, { as: "roles", through: UserRole, foreignKey: "userId", otherKey: "roleId", sourceKey: "id" });
User.hasMany(UserAccessScope, { as: "accessScopes", foreignKey: "userId" });
UserAccessScope.belongsTo(User, { as: "user", foreignKey: "userId" });
Role.belongsToMany(User, { as: "users", through: UserRole, foreignKey: "roleId", otherKey: "userId", targetKey: "id" });
Role.belongsToMany(Permission, { as: "permissions", through: RolePermission, foreignKey: "roleId", otherKey: "permissionId" });
Permission.belongsToMany(Role, { as: "roles", through: RolePermission, foreignKey: "permissionId", otherKey: "roleId" });
Application.hasOne(ApplicationTheme, { as: "applicationTheme", foreignKey: "applicationId" });
ApplicationTheme.belongsTo(Application, { as: "application", foreignKey: "applicationId" });
ApplicationTheme.belongsTo(Theme, { as: "theme", foreignKey: "themeId" });
Theme.hasOne(ApplicationTheme, { as: "applicationTheme", foreignKey: "themeId" });

module.exports = { sequelize, ...models };
