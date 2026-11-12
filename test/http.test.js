const test = require("node:test");
const assert = require("node:assert/strict");
process.env.NODE_ENV = process.env.NODE_ENV || "test";
const app = require("../src/app");

test("health endpoint is public and management endpoints require a bearer token", async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });

  const version = await fetch(`${baseUrl}/v3/api/auth/version`);
  assert.equal(version.status, 200);
  assert.deepEqual(await version.json(), {
    version: process.env.APP_VERSION || "1.0.0",
  });
  assert.match(version.headers.get("cache-control"), /no-store/);

  const users = await fetch(`${baseUrl}/v3/api/auth/users`);
  assert.equal(users.status, 401);
  assert.equal((await users.json()).message, "Bearer token required");
  const activity = await fetch(`${baseUrl}/v3/api/auth/users/me/activity`, {
    method: "POST",
  });
  assert.equal(activity.status, 401);
  const commands = await fetch(`${baseUrl}/v3/api/auth/users/me/commands`);
  assert.equal(commands.status, 401);
  const sendCommand = await fetch(`${baseUrl}/v3/api/auth/users/1/commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commandType: "refresh" }),
  });
  assert.equal(sendCommand.status, 401);
  const operatorUsers = await fetch(`${baseUrl}/v3/api/auth/pda/operators`);
  assert.equal(operatorUsers.status, 401);
  const workspace = await fetch(`${baseUrl}/v3/api/auth/applications/workspace`);
  assert.equal(workspace.status, 401);
  const navigation = await fetch(`${baseUrl}/v3/api/auth/applications/navigation`);
  assert.equal(navigation.status, 401);

  const pdaLogin = await fetch(`${baseUrl}/v3/api/auth/pda/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(pdaLogin.status, 400);
  assert.equal(
    (await pdaLogin.json()).message,
    "employeeCode and authCode are required",
  );
});
