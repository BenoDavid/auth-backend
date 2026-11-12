const test = require("node:test");
const assert = require("node:assert/strict");
const { User } = require("../src/models");
const authenticate = require("../src/middleware/authenticate");
const { issueToken } = require("../src/services/auth.service");

test("development requests bypass bearer JWT auth and receive wildcard permissions", async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDevBypass = process.env.ALLOW_DEV_AUTH_BYPASS;
  process.env.NODE_ENV = "development";
  process.env.ALLOW_DEV_AUTH_BYPASS = "true";

  try {
    const req = { ip: "127.0.0.1" };
    let nextCalled = false;
    await authenticate(req, {}, (error) => {
      assert.equal(error, undefined);
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.roles[0].permissions[0].name, "*");
    assert.match(issueToken({ id: 42, employeeCode: "E1001" }), /^development:42:0:\d+$/);

    let legacyError;
    await authenticate(
      { get: () => "Bearer development" },
      {},
      (error) => {
        legacyError = error;
      },
    );
    assert.equal(legacyError.status, 401);
    assert.match(legacyError.message, /sign in again/);
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalDevBypass === undefined) delete process.env.ALLOW_DEV_AUTH_BYPASS;
    else process.env.ALLOW_DEV_AUTH_BYPASS = originalDevBypass;
  }
});

test("development login sessions preserve user identity and command polling time", async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFindByPk = User.findByPk;
  process.env.NODE_ENV = "development";
  const user = {
    id: 42,
    employeeCode: "E1001",
    isActive: true,
    sessionVersion: 3,
  };
  User.findByPk = async (id) => (id === "42" ? user : null);

  try {
    const token = issueToken(user);
    const req = {
      get: () => `Bearer ${token}`,
    };
    let nextCalled = false;
    await authenticate(req, {}, (error) => {
      assert.equal(error, undefined);
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, 42);
    assert.equal(req.user.roles[0].permissions[0].name, "*");
    assert.equal(req.authClaims.sessionVersion, 3);
    assert.ok(Number.isSafeInteger(req.authClaims.iat));
  } finally {
    User.findByPk = originalFindByPk;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});
