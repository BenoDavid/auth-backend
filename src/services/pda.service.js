const { User, Role } = require("../models");

async function listOperatorUsers() {
  return User.findAll({
    attributes: ["id", "employeeCode", "employeeName", "isActive"],
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["id", "name"],
        through: { attributes: [] },
        where: { name: "BIA-PDA-OPERATOR" },
        required: true,
      },
    ],
    order: [["employeeName", "ASC"]],
  });
}

module.exports = { listOperatorUsers };
