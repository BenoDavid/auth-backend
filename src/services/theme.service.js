const { Theme } = require("../models");
const HttpError = require("../errors/HttpError");

const colorFields = ["primaryColor", "secondaryColor", "textColor"];

async function list() {
  return Theme.findAll();
}

async function create(values) {
  if (typeof values.name !== "string" || !values.name.trim()) throw new HttpError(400, "name is required");
  return Theme.create({
    name: values.name.trim(),
    ...Object.fromEntries(colorFields.filter((field) => values[field] !== undefined).map((field) => [field, values[field]])),
  });
}

async function update(id, values) {
  const theme = await Theme.findByPk(id);
  if (!theme) throw new HttpError(404, "Theme not found");
  if (values.name !== undefined) {
    if (typeof values.name !== "string" || !values.name.trim()) throw new HttpError(400, "name must be a non-empty string");
    theme.name = values.name.trim();
  }
  for (const field of colorFields) {
    if (values[field] !== undefined) {
      if (values[field] !== null && typeof values[field] !== "string") throw new HttpError(400, `${field} must be a string or null`);
      theme[field] = values[field];
    }
  }
  await theme.save();
  return theme;
}

async function remove(id) {
  const theme = await Theme.findByPk(id);
  if (!theme) throw new HttpError(404, "Theme not found");
  await theme.destroy();
}

module.exports = { list, create, update, remove };
