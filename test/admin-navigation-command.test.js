const test = require("node:test");
const assert = require("node:assert/strict");
const {
  User,
  AdminUserCommand,
  ApplicationNavigation,
  sequelize,
} = require("../src/models");
const users = require("../src/services/users.service");

test("navigation commands only accept routes configured for the selected application", async () => {
  const originalUserFindByPk = User.findByPk;
  const originalNavigationFindByPk = ApplicationNavigation.findByPk;
  const originalTransaction = sequelize.transaction;
  const originalCommandCreate = AdminUserCommand.create;
  const originalCommandDestroy = AdminUserCommand.destroy;
  const createdCommands = [];
  User.findByPk = async () => ({ id: 27 });
  ApplicationNavigation.findByPk = async (name) =>
    name === "Quality"
      ? {
          landingRoute: "/cqc/home",
          navbarItems: JSON.stringify([
            { link: "/cqc/inspections", label: "Inspections" },
          ]),
        }
      : null;
  sequelize.transaction = async () => ({
    commit: async () => {},
    rollback: async () => {},
  });
  AdminUserCommand.destroy = async () => {};
  AdminUserCommand.create = async (command) => {
    createdCommands.push(command);
    return { id: 5, ...command };
  };

  try {
    await assert.rejects(
      users.issueAdminCommand(
        27,
        "navigate",
        undefined,
        "Quality",
        "https://example.org/",
      ),
      (error) => error.status === 400,
    );
    assert.equal(createdCommands.length, 0);

    const result = await users.issueAdminCommand(
      27,
      "navigate",
      undefined,
      "Quality",
      "/cqc/inspections",
    );
    assert.equal(result.commandType, "navigate");
    assert.equal(result.applicationName, "Quality");
    assert.equal(result.targetRoute, "/cqc/inspections");
    assert.equal(createdCommands[0].userId, 27);
  } finally {
    User.findByPk = originalUserFindByPk;
    ApplicationNavigation.findByPk = originalNavigationFindByPk;
    sequelize.transaction = originalTransaction;
    AdminUserCommand.create = originalCommandCreate;
    AdminUserCommand.destroy = originalCommandDestroy;
  }
});
