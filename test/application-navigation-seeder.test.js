const test = require("node:test");
const assert = require("node:assert/strict");
const configurations = require("../seeders/workspace-navigation.json");
const seeder = require("../seeders/20261007000200-seed-application-navigation");

test("workspace navigation seed contains each current workspace configuration", () => {
  assert.equal(configurations.length, 23);
  assert.equal(
    configurations.reduce((total, config) => total + config.navbarItems.length, 0),
    199,
  );
  assert.equal(
    configurations.find((config) => config.applicationName === "superadminv2").landingRoute,
    "/adminv2/welcome",
  );
  assert.equal(
    configurations.find((config) => config.applicationName === "WMS").navbarItems[0].permission,
    "wms",
  );
  const courierTracker = configurations.find(
    (config) => config.applicationName === "Courier Tracker",
  );
  assert.equal(courierTracker.landingRoute, "/ct/welcome");
  assert.deepEqual(
    courierTracker.navbarItems.map((item) => item.link),
    ["/ct/welcome", "/ct/trackings"],
  );
});

test("navigation seed inserts all missing configurations in database format", async () => {
  let inserted;
  await seeder.up(
    {
      sequelize: {
        query: async () => [{ application_name: "wms" }],
      },
      bulkInsert: async (table, records) => {
        assert.equal(table, "app_application_navigation");
        inserted = records;
      },
    },
    { QueryTypes: { SELECT: "SELECT" } },
  );

  assert.equal(inserted.length, 22);
  assert.equal(inserted.some((record) => record.application_name === "WMS"), false);
  const rootConfig = inserted.find((record) => record.application_name === "superadminv2");
  assert.equal(rootConfig.landing_route, "/adminv2/welcome");
  assert.equal(JSON.parse(rootConfig.navbar_items).length, 8);
});

test("navigation seed does not replace existing configuration", async () => {
  let inserted = false;
  await seeder.up(
    {
      sequelize: {
        query: async () =>
          configurations.map((configuration) => ({
            application_name: configuration.applicationName,
          })),
      },
      bulkInsert: async () => {
        inserted = true;
      },
    },
    { QueryTypes: { SELECT: "SELECT" } },
  );
  assert.equal(inserted, false);
});
