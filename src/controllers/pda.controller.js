const { authenticate } = require("../services/auth.service");
const pda = require("../services/pda.service");

async function login(req, res) {
  const result = await authenticate(req.body.employeeCode, req.body.authCode);
  const user = result.user;
  res.json({
    status: 200,
    message: "PDA user logged in successfully",
    result: {
      id: user.id,
      employeeCode: user.employeeCode,
      employeeName: user.employeeName,
      roles: (user.roles || []).map((role) => ({
        id: role.id,
        name: role.name,
        enabled: role.enabled,
        permissions: (role.permissions || []).map((permission) => ({
          id: permission.id,
          name: permission.name,
          appname: permission.appname,
          enabled: permission.enabled,
        })),
      })),
    },
    token: result.token,
  });
}

async function listOperatorUsers(req, res) {
  res.json({
    status: 200,
    message: "Operator users retrieved successfully",
    result: await pda.listOperatorUsers(),
  });
}

module.exports = { login, listOperatorUsers };
