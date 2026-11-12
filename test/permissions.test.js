const test = require("node:test");
const assert = require("node:assert/strict");
const { userHasPermission } = require("../src/security/permissions");

test("permission checks require enabled roles and enabled exact or wildcard permission", () => {
  const user = {
    roles: [
      { enabled: false, permissions: [{ name: "users:manage", enabled: true }] },
      { enabled: true, permissions: [{ name: "themes:manage", enabled: false }] },
      { enabled: true, permissions: [{ name: "users:manage", enabled: true }] },
    ],
  };
  assert.equal(userHasPermission(user, "users:manage"), true);
  assert.equal(userHasPermission(user, "roles:manage"), false);
  assert.equal(userHasPermission(null, "users:manage"), false);
});

test("wildcard permission grants access only when its role and permission are enabled", () => {
  assert.equal(
    userHasPermission({ roles: [{ enabled: true, permissions: [{ name: "*", enabled: true }] }] }, "roles:manage"),
    true,
  );
  assert.equal(
    userHasPermission({ roles: [{ enabled: true, permissions: [{ name: "*", enabled: false }] }] }, "roles:manage"),
    false,
  );
});
