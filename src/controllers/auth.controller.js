const { authenticate } = require("../services/auth.service");
const { recordAppLogin } = require("../services/telemetry.service");

async function login(req, res) {
  const result = await authenticate(req.body.employeeCode, req.body.authCode);
  await recordAppLogin(req, result.user);
  res.json({ status: 200, message: "User logged in successfully", result: result.user, token: result.token });
}

async function generateToken(req, res) {
  const result = await authenticate(req.body.employeeCode, req.body.authCode);
  res.json({ token: result.token });
}

async function issueServiceToken(req, res) {
  const result = await authenticate(req.body.employeeCode, req.body.authCode);
  res.json({ token: result.token, validity: "8 hrs" });
}

module.exports = { login, generateToken, issueServiceToken };
