require("dotenv").config();

const { sequelize, User, Role, Permission } = require("../src/models");

async function bootstrap(employeeCode) {
  if (!employeeCode) throw new Error("Usage: npm run bootstrap:admin -- <employeeCode>");
  const user = await User.findOne({ where: { employeeCode } });
  if (!user) throw new Error(`No user found for employeeCode '${employeeCode}'`);
  const [permission] = await Permission.findOrCreate({
    where: { name: "*" },
    defaults: { name: "*", appname: "authguardv2", enabled: true },
  });
  const [role] = await Role.findOrCreate({
    where: { name: "ADMIN" },
    defaults: { name: "ADMIN", enabled: true },
  });
  await role.addPermission(permission);
  await user.addRole(role);
  console.log(`Granted ADMIN access to ${employeeCode}`);
}

bootstrap(process.argv[2])
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
