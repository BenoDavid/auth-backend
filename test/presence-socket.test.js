const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const WebSocket = require("ws");
const { User } = require("../src/models");
const users = require("../src/services/users.service");
const {
  attachPresenceSocket,
  SOCKET_PATH,
} = require("../src/services/presence-socket");

test("presence WebSocket rejects connections that do not authenticate", async (t) => {
  const server = http.createServer();
  const presenceSocket = attachPresenceSocket(server);
  t.after(async () => {
    presenceSocket.close();
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const address = server.address();
  const socket = new WebSocket(
    `ws://127.0.0.1:${address.port}${SOCKET_PATH}`,
  );
  const closeCode = new Promise((resolve) =>
    socket.once("close", (code) => resolve(code)),
  );
  await new Promise((resolve) => socket.once("open", resolve));
  socket.send(JSON.stringify({ type: "auth", token: "invalid-token" }));

  assert.equal(await closeCode, 1008);
});

test("presence WebSocket sends snapshots to identified development sessions", async (t) => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFindByPk = User.findByPk;
  const originalList = users.list;
  process.env.NODE_ENV = "development";
  User.findByPk = async (id) =>
    id === "42"
      ? { id: 42, isActive: true, sessionVersion: 3 }
      : null;
  users.list = async () => [{ id: 42, employeeCode: "E1001" }];

  const server = http.createServer();
  const presenceSocket = attachPresenceSocket(server);
  let socket;
  t.after(async () => {
    socket?.terminate();
    presenceSocket.close();
    await new Promise((resolve) => server.close(resolve));
    User.findByPk = originalFindByPk;
    users.list = originalList;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const address = server.address();
  socket = new WebSocket(
    `ws://127.0.0.1:${address.port}${SOCKET_PATH}`,
  );
  const snapshot = new Promise((resolve, reject) => {
    socket.once("message", (data) => resolve(JSON.parse(data.toString())));
    socket.once("error", reject);
  });
  await new Promise((resolve) => socket.once("open", resolve));
  socket.send(
    JSON.stringify({
      type: "auth",
      token: `development:42:3:${Math.floor(Date.now() / 1000)}`,
    }),
  );

  assert.deepEqual(await snapshot, {
    type: "presence",
    result: [{ id: 42, employeeCode: "E1001" }],
  });
});
