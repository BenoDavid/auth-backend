const jwt = require("jsonwebtoken");
const { URL } = require("node:url");
const WebSocket = require("ws");
const { User, Role, Permission } = require("../models");
const { userHasPermission } = require("../security/permissions");
const users = require("./users.service");
const { presenceEvents } = require("./presence-events");

const SOCKET_PATH = "/v3/api/auth/admin/presence";
const userIncludes = [
  {
    model: Role,
    as: "roles",
    through: { attributes: [] },
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  },
];

function attachPresenceSocket(server) {
  const webSocketServer = new WebSocket.Server({
    noServer: true,
    maxPayload: 4096,
  });
  const administrators = new Map();
  let broadcastTimer;
  let broadcastInProgress = false;
  let broadcastPending = false;

  async function sendSnapshot(socket) {
    if (socket.readyState !== WebSocket.OPEN) return;
    const result = await users.list();
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "presence", result }));
    }
  }

  async function validateAdministratorSessions() {
    const authenticated = [...administrators.entries()].filter(
      ([, session]) => session,
    );
    if (authenticated.length === 0) return;

    const userIds = [...new Set(authenticated.map(([, session]) => session.userId))];
    const usersById = new Map(
      (await User.findAll({
        attributes: ["id", "isActive", "sessionVersion"],
        where: { id: userIds },
        include: userIncludes,
      })).map((user) => [String(user.id), user]),
    );

    for (const [socket, session] of authenticated) {
      const user = usersById.get(String(session.userId));
      if (
        !user ||
        !user.isActive ||
        user.sessionVersion !== session.sessionVersion ||
        (!session.development && !userHasPermission(user, "users:manage"))
      ) {
        administrators.delete(socket);
        socket.close(1008, "User session is unavailable");
      }
    }
  }

  async function broadcastSnapshot() {
    broadcastPending = true;
    if (broadcastInProgress) return;
    broadcastInProgress = true;
    try {
      while (broadcastPending) {
        broadcastPending = false;
        await validateAdministratorSessions();
        const result = await users.list();
        const payload = JSON.stringify({ type: "presence", result });
        for (const socket of administrators.keys()) {
          if (socket.readyState === WebSocket.OPEN) socket.send(payload);
        }
      }
    } catch (error) {
      console.error("Unable to publish user presence:", error);
    } finally {
      broadcastInProgress = false;
    }
  }

  function scheduleBroadcast() {
    clearTimeout(broadcastTimer);
    broadcastTimer = setTimeout(() => {
      void broadcastSnapshot();
    }, 100);
  }

  presenceEvents.on("changed", scheduleBroadcast);

  server.on("upgrade", (request, socket, head) => {
    let pathname;
    try {
      pathname = new URL(request.url, "http://localhost").pathname;
    } catch {
      socket.destroy();
      return;
    }
    if (pathname !== SOCKET_PATH) {
      socket.destroy();
      return;
    }

    webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
      webSocketServer.emit("connection", webSocket);
    });
  });

  webSocketServer.on("connection", (socket) => {
    let authenticated = false;
    const authTimeout = setTimeout(() => {
      socket.close(1008, "Authentication required");
    }, 5000);

    socket.on("message", async (data, isBinary) => {
      if (authenticated) return;
      if (isBinary) {
        socket.close(1008, "Text authentication required");
        return;
      }

      try {
        const message = JSON.parse(data.toString());
        if (message.type !== "auth" || typeof message.token !== "string") {
          socket.close(1008, "Invalid authentication message");
          return;
        }

        let user;
        let session;
        const developmentSession =
          process.env.NODE_ENV === "development"
            ? message.token.match(/^development:(\d+):(\d+):(\d+)$/)
            : null;
        if (developmentSession) {
          user = await User.findByPk(developmentSession[1], {
            include: userIncludes,
          });
          if (
            !user ||
            !user.isActive ||
            user.sessionVersion !== Number(developmentSession[2]) ||
            !Number.isSafeInteger(Number(developmentSession[3]))
          ) {
            socket.close(1008, "User session is unavailable");
            return;
          }
          user.roles = [
            { enabled: true, permissions: [{ name: "*", enabled: true }] },
          ];
          session = {
            userId: user.id,
            sessionVersion: user.sessionVersion,
            development: true,
          };
        } else if (process.env.NODE_ENV === "development" && message.token === "development") {
          user = {
            roles: [{ enabled: true, permissions: [{ name: "*", enabled: true }] }],
          };
        } else {
          const claims = jwt.verify(message.token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
          });
          if (!Number.isSafeInteger(claims.exp)) {
            socket.close(1008, "Token expiration is required");
            return;
          }
          user = await User.findOne({
            where: { employeeCode: claims.sub },
            include: userIncludes,
          });
          if (
            !user ||
            !user.isActive ||
            (claims.sessionVersion ?? 0) !== user.sessionVersion
          ) {
            socket.close(1008, "User session is unavailable");
            return;
          }
          session = {
            userId: user.id,
            sessionVersion: user.sessionVersion,
            expiresAt: claims.exp * 1000,
          };
        }

        if (!userHasPermission(user, "users:manage")) {
          socket.close(1008, "Insufficient permissions");
          return;
        }

        authenticated = true;
        clearTimeout(authTimeout);
        if (session) {
          if (session.expiresAt) {
            session.expiryTimer = setTimeout(
              () => socket.close(1008, "Token expired"),
              Math.max(0, session.expiresAt - Date.now()),
            );
          }
        }
        administrators.set(socket, session);
        socket.once("close", () => {
          clearTimeout(session?.expiryTimer);
          administrators.delete(socket);
        });
        await sendSnapshot(socket);
      } catch (error) {
        if (error.name === "SequelizeError" || error.name?.startsWith("Sequelize")) {
          console.error("Unable to authenticate presence socket:", error);
          socket.close(1011, "Authentication service unavailable");
          return;
        }
        socket.close(1008, "Invalid or expired token");
      }
    });

    socket.once("close", () => clearTimeout(authTimeout));
  });

  return {
    close() {
      clearTimeout(broadcastTimer);
      presenceEvents.off("changed", scheduleBroadcast);
      for (const socket of administrators.keys()) socket.close(1001, "Server shutting down");
      webSocketServer.close();
    },
  };
}

module.exports = { attachPresenceSocket, SOCKET_PATH };
