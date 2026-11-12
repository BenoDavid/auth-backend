const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const securityHeaders = require("./middleware/security");
const { requestTelemetry } = require("./services/telemetry.service");

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN || "*";

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(
  cors({
    origin:
      allowedOrigins === "*"
        ? (process.env.NODE_ENV === "production" ? false : "*")
        : allowedOrigins.split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-application-name", "x-app-name", "x-organization-id", "x-organization-name", "x-factory-id", "x-factory-name", "x-vendor-id", "x-vendor-name"],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(requestTelemetry);
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/v3/api/auth/version", (req, res) => {
  res
    .set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    .set("Pragma", "no-cache")
    .set("Expires", "0")
    .json({ version: process.env.APP_VERSION || "1.0.0" });
});
app.use("/v3/api/auth", routes);
app.use((req, res) =>
  res.status(404).json({ status: 404, message: "Route not found" }),
);
app.use(errorHandler);

module.exports = app;
