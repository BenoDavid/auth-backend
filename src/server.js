require("dotenv").config();

if (process.env.NODE_ENV !== "development" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === "your-256-bit-secret-your-256-bit-secret")) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters");
}

const app = require("./app");
const { sequelize } = require("./models");
const { attachPresenceSocket } = require("./services/presence-socket");
const port = Number(process.env.PORT || 8082);

async function start() {
  await sequelize.authenticate();
  const server = app.listen(port, () => console.log(`AuthGuard v2 API listening on port ${port}`));
  const presenceSocket = attachPresenceSocket(server);
  const shutdown = async () => {
    presenceSocket.close();
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Unable to start AuthGuard v2 API:", error);
  process.exitCode = 1;
});
