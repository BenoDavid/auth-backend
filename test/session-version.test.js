const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { User } = require("../src/models");
const authenticate = require("../src/middleware/authenticate");

test("administrator logout invalidates older tokens but accepts newly issued sessions", async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalFindOne = User.findOne;
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-session-version-secret";
  User.findOne = async () => ({
    isActive: true,
    sessionVersion: 2,
    roles: [],
  });

  async function authenticateVersion(sessionVersion) {
    const token = jwt.sign(
      { sub: "E1001", sessionVersion },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1h", issuer: "platform-iam", audience: "platform-applications" },
    );
    const req = {
      get: () => `Bearer ${token}`,
    };
    let receivedError;
    await authenticate(req, {}, (error) => {
      receivedError = error;
    });
    return { req, receivedError };
  }

  try {
    const oldSession = await authenticateVersion(1);
    assert.equal(oldSession.receivedError.status, 401);
    assert.equal(oldSession.req.authClaims, undefined);

    const currentSession = await authenticateVersion(2);
    assert.equal(currentSession.receivedError, undefined);
    assert.equal(currentSession.req.authClaims.sessionVersion, 2);
  } finally {
    User.findOne = originalFindOne;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  }
});
