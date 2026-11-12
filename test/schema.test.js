const test = require("node:test");
const assert = require("node:assert/strict");
const Sequelize = require("sequelize");
const { User, Role, Permission, UserRole, RolePermission, Application, ApplicationNavigation, Theme, ApplicationTheme } = require("../src/models");
const migration = require("../migrations/20261005000100-create-authguard-schema");
const applicationMetadataMigration = require("../migrations/20261007000200-add-application-workspace-metadata");
const applicationNavigationMigration = require("../migrations/20261007000300-create-application-navigation");
const userPresenceMigration = require("../migrations/20261021000100-add-user-presence");
const adminUserCommandsMigration = require("../migrations/20261021000200-add-admin-user-commands");
const adminUserNavigationCommandMigration = require("../migrations/20261021000300-add-navigation-target-to-user-commands");

test("models match legacy SQL Server key types, column mappings, and associations", () => {
  assert.equal(User.rawAttributes.id.type.key, "BIGINT");
  assert.equal(Role.rawAttributes.id.type.key, "BIGINT");
  assert.equal(User.rawAttributes.employeeCode.field, "employee_code");
  assert.equal(User.rawAttributes.authCode.field, "auth_code");
  assert.equal(User.rawAttributes.lastLoginAt.field, "last_login_at");
  assert.equal(User.rawAttributes.lastActivityAt.field, "last_activity_at");
  assert.equal(User.rawAttributes.sessionVersion.field, "session_version");
  assert.equal(User.associations.adminCommands.target, require("../src/models").AdminUserCommand);
  assert.equal(
    require("../src/models").AdminUserCommand.rawAttributes.applicationName.field,
    "application_name",
  );
  assert.equal(
    require("../src/models").AdminUserCommand.rawAttributes.targetRoute.field,
    "target_route",
  );
  assert.equal(User._scope.attributes.exclude.includes("authCode"), true);
  assert.equal(User.associations.roles.target, Role);
  assert.equal(User.associations.roles.foreignKey, "userId");
  assert.equal(User.associations.roles.sourceKey, "id");
  assert.equal(Role.associations.permissions.target, Permission);
  assert.equal(UserRole.rawAttributes.userId.type.key, "BIGINT");
  assert.equal(UserRole.rawAttributes.roleId.type.key, "BIGINT");
  assert.equal(RolePermission.rawAttributes.permissionId.type.key, "BIGINT");
  assert.equal(Application.associations.applicationTheme.target, ApplicationTheme);
  assert.equal(Application.rawAttributes.applicationIcon.field, "application_icon");
  assert.equal(Application.rawAttributes.requiredPermission.field, "required_permission");
  assert.equal(ApplicationNavigation.rawAttributes.navbarItems.field, "navbar_items");
  assert.equal(ApplicationNavigation.rawAttributes.landingRoute.field, "landing_route");
  assert.equal(Theme.associations.applicationTheme.target, ApplicationTheme);
});

test("admin command migration creates the command queue and session version", async () => {
  const changes = [];
  const queryInterface = {
    addColumn: async (...args) => changes.push(["addColumn", ...args]),
    removeColumn: async (...args) => changes.push(["removeColumn", ...args]),
    createTable: async (...args) => changes.push(["createTable", ...args]),
    dropTable: async (...args) => changes.push(["dropTable", ...args]),
    addIndex: async (...args) => changes.push(["addIndex", ...args]),
  };
  await adminUserCommandsMigration.up(queryInterface, Sequelize);
  await adminUserCommandsMigration.down(queryInterface);

  assert.equal(changes[0][1], "app_users");
  assert.equal(changes[0][2], "session_version");
  assert.equal(changes[1][1], "app_user_commands");
  assert.deepEqual(Object.keys(changes[1][2]), [
    "id",
    "user_id",
    "command_type",
    "message",
    "created_at",
  ]);
  assert.deepEqual(changes[3], ["dropTable", "app_user_commands"]);
  assert.deepEqual(changes[4], [
    "removeColumn",
    "app_users",
    "session_version",
  ]);
});

test("navigation command migration adds and removes application and route targets", async () => {
  const changes = [];
  const queryInterface = {
    addColumn: async (...args) => changes.push(["add", ...args]),
    removeColumn: async (...args) => changes.push(["remove", ...args]),
  };
  await adminUserNavigationCommandMigration.up(queryInterface, Sequelize);
  await adminUserNavigationCommandMigration.down(queryInterface);

  assert.deepEqual(
    changes.map(([operation, table, column]) => [operation, table, column]),
    [
      ["add", "app_user_commands", "application_name"],
      ["add", "app_user_commands", "target_route"],
      ["remove", "app_user_commands", "target_route"],
      ["remove", "app_user_commands", "application_name"],
    ],
  );
});

test("user presence migration adds and removes login and activity timestamps", async () => {
  const changes = [];
  const queryInterface = {
    addColumn: async (...args) => changes.push(["add", ...args]),
    removeColumn: async (...args) => changes.push(["remove", ...args]),
  };
  await userPresenceMigration.up(queryInterface, Sequelize);
  await userPresenceMigration.down(queryInterface);

  assert.deepEqual(
    changes.map(([operation, table, column]) => [operation, table, column]),
    [
      ["add", "app_users", "last_login_at"],
      ["add", "app_users", "last_activity_at"],
      ["remove", "app_users", "last_activity_at"],
      ["remove", "app_users", "last_login_at"],
    ],
  );
});

test("application navigation migration creates and removes its catalog table", async () => {
  const changes = [];
  const queryInterface = {
    createTable: async (...args) => changes.push(["create", ...args]),
    dropTable: async (...args) => changes.push(["drop", ...args]),
  };
  await applicationNavigationMigration.up(queryInterface, Sequelize);
  await applicationNavigationMigration.down(queryInterface);

  assert.equal(changes[0][1], "app_application_navigation");
  assert.deepEqual(Object.keys(changes[0][2]), [
    "application_name",
    "landing_route",
    "navbar_items",
  ]);
  assert.deepEqual(changes[1], ["drop", "app_application_navigation"]);
});

test("application metadata migration adds and removes optional workspace catalog fields", async () => {
  const changes = [];
  const queryInterface = {
    addColumn: async (...args) => changes.push(["add", ...args]),
    removeColumn: async (...args) => changes.push(["remove", ...args]),
  };
  await applicationMetadataMigration.up(queryInterface, Sequelize);
  await applicationMetadataMigration.down(queryInterface);

  assert.deepEqual(
    changes.map(([operation, table, column]) => [operation, table, column]),
    [
      ["add", "app_applications", "application_icon"],
      ["add", "app_applications", "required_permission"],
      ["remove", "app_applications", "required_permission"],
      ["remove", "app_applications", "application_icon"],
    ],
  );
});

test("initial migration creates each legacy entity and join table", async () => {
  const tables = [];
  const queryInterface = {
    createTable: async (name, columns) => tables.push({ name, columns }),
  };
  await migration.up(queryInterface, Sequelize);
  assert.deepEqual(
    tables.map(({ name }) => name),
    ["app_roles", "app_permissions", "app_users", "app_user_roles", "app_role_permissions", "app_themes", "app_applications", "application_themes"],
  );
  assert.equal(tables.find(({ name }) => name === "app_users").columns.id.type.key, "BIGINT");
  assert.equal(tables.find(({ name }) => name === "app_user_roles").columns.employee_code.type.key, "BIGINT");
  assert.equal(tables.find(({ name }) => name === "app_user_roles").columns.employee_code.references.key, "id");
});
