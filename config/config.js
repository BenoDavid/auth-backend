require("dotenv").config();

const common = {
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  dialectOptions: process.env.DB_SSL === "true"
    ? { ssl: { require: true, rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } }
    : {},
  logging: false,
};

module.exports = {
  development: {
    ...common,
    database: process.env.DB_NAME || "authguard",
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  test: {
    ...common,
    database: process.env.DB_NAME || "authguard_test",
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  production: {
    ...common,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
