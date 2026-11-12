const test = require("node:test");
const assert = require("node:assert/strict");
const { ApplicationNavigation } = require("../src/models");
const service = require("../src/services/application.service");

test("navigation save validates and persists application routes and navbar items", async () => {
  const originalUpsert = ApplicationNavigation.upsert;
  let saved;
  ApplicationNavigation.upsert = async (record) => {
    saved = record;
  };

  try {
    const result = await service.saveNavigation("Example App", {
      landingRoute: "/example/home",
      navbarItems: [
        {
          icon: "bi-house",
          link: "/example/home",
          label: "Home",
          permission: "example-home",
        },
      ],
    });

    assert.deepEqual(result, {
      applicationName: "Example App",
      landingRoute: "/example/home",
      navbarItems: [
        {
          icon: "bi-house",
          link: "/example/home",
          label: "Home",
          permission: "example-home",
        },
      ],
    });
    assert.equal(saved.applicationName, "Example App");
    assert.equal(saved.landingRoute, "/example/home");
    assert.deepEqual(JSON.parse(saved.navbarItems), result.navbarItems);
  } finally {
    ApplicationNavigation.upsert = originalUpsert;
  }
});

test("navigation save rejects invalid routes and incomplete navbar entries", async () => {
  await assert.rejects(
    service.saveNavigation("Example App", {
      landingRoute: "example/home",
      navbarItems: [],
    }),
    { status: 400, message: "landingRoute must be an absolute application route" },
  );
  await assert.rejects(
    service.saveNavigation("Example App", {
      landingRoute: "/example/home",
      navbarItems: [{ icon: "bi-house", link: "/example/home", label: "Home" }],
    }),
    { status: 400, message: "navbarItems[0].permission is required" },
  );
});
