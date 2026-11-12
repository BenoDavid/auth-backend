const { Application, ApplicationNavigation, ApplicationTheme, Theme } = require("../models");
const HttpError = require("../errors/HttpError");
const { userHasPermission } = require("../security/permissions");

const includeTheme = [{ model: ApplicationTheme, as: "applicationTheme", include: [{ model: Theme, as: "theme" }] }];

function optionalText(value, field) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${field} must be a non-empty string or null`);
  }
  return value.trim();
}

async function list() {
  return Application.findAll({ include: includeTheme });
}

function canAccess(req, permission) {
  if (!permission) return userHasPermission(req.user, "superadmin") || userHasPermission(req.user, "*");
  return userHasPermission(req.user, permission) || userHasPermission(req.user, "*");
}

function visibleNavigation(req, configuration) {
  return {
    applicationName: configuration.applicationName,
    landingRoute: canAccess(req, configuration.requiredPermission) ? configuration.landingRoute : null,
    navbarItems: configuration.navbarItems.filter((item) => canAccess(req, item.permission)),
  };
}

async function listWorkspace(req) {
  const [applicationRecords, navigationRecords] = await Promise.all([
    Application.findAll({ include: includeTheme }),
    ApplicationNavigation.findAll({ order: [["applicationName", "ASC"]] }),
  ]);
  const navigation = navigationRecords.map((record) => {
    const value = record.toJSON();
    return visibleNavigation(req, {
      applicationName: value.applicationName,
      landingRoute: value.landingRoute,
      navbarItems: JSON.parse(value.navbarItems),
      requiredPermission: applicationRecords.find((application) => application.applicationName === value.applicationName)?.requiredPermission,
    });
  });

  return { applications: applicationRecords.filter((application) => canAccess(req, application.requiredPermission)), navigation };
}

async function listNavigation() {
  const records = await ApplicationNavigation.findAll({
    order: [["applicationName", "ASC"]],
  });
  return records.map((record) => ({
    applicationName: record.applicationName,
    landingRoute: record.landingRoute,
    navbarItems: JSON.parse(record.navbarItems),
  }));
}

function validateNavigation(values) {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    throw new HttpError(400, "Navigation configuration is required");
  }
  if (typeof values.landingRoute !== "string" || !/^\/(?!\/)\S+/.test(values.landingRoute)) {
    throw new HttpError(400, "landingRoute must be an absolute application route");
  }
  if (!Array.isArray(values.navbarItems)) {
    throw new HttpError(400, "navbarItems must be an array");
  }

  const navbarItems = values.navbarItems.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new HttpError(400, `navbarItems[${index}] must be an object`);
    }
    const normalized = {};
    for (const field of ["icon", "link", "label", "permission"]) {
      if (typeof item[field] !== "string" || !item[field].trim()) {
        throw new HttpError(400, `navbarItems[${index}].${field} is required`);
      }
      normalized[field] = item[field].trim();
    }
    if (!/^\/(?!\/)\S+/.test(normalized.link)) {
      throw new HttpError(400, `navbarItems[${index}].link must be an absolute application route`);
    }
    return normalized;
  });

  return { landingRoute: values.landingRoute.trim(), navbarItems };
}

async function saveNavigation(applicationName, values) {
  if (typeof applicationName !== "string" || !applicationName.trim()) {
    throw new HttpError(400, "applicationName is required");
  }
  const configuration = validateNavigation(values);
  await ApplicationNavigation.upsert({
    applicationName: applicationName.trim(),
    landingRoute: configuration.landingRoute,
    navbarItems: JSON.stringify(configuration.navbarItems),
  });
  return {
    applicationName: applicationName.trim(),
    ...configuration,
  };
}

async function removeNavigation(applicationName) {
  const application = await Application.findOne({
    where: { applicationName },
  });
  if (application) return remove(application.id);

  const navigation = await ApplicationNavigation.findOne({ where: { applicationName } });
  if (!navigation) throw new HttpError(404, "Navigation configuration not found");
  await navigation.destroy();
  return {
    application: null,
    navigation: {
      applicationName: navigation.applicationName,
      landingRoute: navigation.landingRoute,
      navbarItems: JSON.parse(navigation.navbarItems).length,
    },
    theme: null,
  };
}

async function getById(id) {
  const application = await Application.findByPk(id, { include: includeTheme });
  if (!application) throw new HttpError(404, "Application not found");
  return application;
}

async function assignTheme(applicationId, themeId) {
  const theme = await Theme.findByPk(themeId);
  if (!theme) throw new HttpError(400, "themeId does not exist");
  const assigned = await ApplicationTheme.findOne({ where: { themeId } });
  if (assigned && String(assigned.applicationId) !== String(applicationId)) {
    throw new HttpError(409, "Theme is already assigned to another application");
  }
  await ApplicationTheme.upsert({ applicationId, themeId });
}

async function create(values) {
  if (typeof values.applicationName !== "string" || !values.applicationName.trim()) {
    throw new HttpError(400, "applicationName is required");
  }
  if (values.themeId !== undefined && values.themeId !== null && !(await Theme.findByPk(values.themeId))) {
    throw new HttpError(400, "themeId does not exist");
  }
  const application = await Application.create({
    applicationName: values.applicationName.trim(),
    applicationIcon: optionalText(values.applicationIcon, "applicationIcon"),
    requiredPermission: optionalText(values.requiredPermission, "requiredPermission"),
  });
  if (values.themeId !== undefined && values.themeId !== null) await assignTheme(application.id, values.themeId);
  return getById(application.id);
}

async function update(id, values) {
  const application = await Application.findByPk(id);
  if (!application) throw new HttpError(404, "Application not found");
  if (values.applicationName !== undefined) {
    if (typeof values.applicationName !== "string" || !values.applicationName.trim()) {
      throw new HttpError(400, "applicationName must be a non-empty string");
    }
    application.applicationName = values.applicationName.trim();
  }
  if (values.applicationIcon !== undefined) {
    application.applicationIcon = optionalText(values.applicationIcon, "applicationIcon");
  }
  if (values.requiredPermission !== undefined) {
    application.requiredPermission = optionalText(values.requiredPermission, "requiredPermission");
  }
  if (values.themeId !== undefined && values.themeId !== null && !(await Theme.findByPk(values.themeId))) {
    throw new HttpError(400, "themeId does not exist");
  }
  await application.save();
  if (values.themeId !== undefined) {
    if (values.themeId === null) await ApplicationTheme.destroy({ where: { applicationId: id } });
    else await assignTheme(id, values.themeId);
  }
  return getById(id);
}

async function remove(id) {
  const application = await Application.findByPk(id, { include: includeTheme });
  if (!application) throw new HttpError(404, "Application not found");

  const navigation = await ApplicationNavigation.findOne({
    where: { applicationName: application.applicationName },
  });
  const themeLink = await ApplicationTheme.findOne({
    where: { applicationId: application.id },
    include: [{ model: Theme, as: "theme" }],
  });
  const transaction = await Application.sequelize.transaction();

  try {
    await ApplicationNavigation.destroy({
      where: { applicationName: application.applicationName },
      transaction,
    });
    await ApplicationTheme.destroy({
      where: { applicationId: application.id },
      transaction,
    });
    await application.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return {
    application: {
      id: String(application.id),
      applicationName: application.applicationName,
    },
    navigation: navigation
      ? {
          applicationName: navigation.applicationName,
          landingRoute: navigation.landingRoute,
          navbarItems: JSON.parse(navigation.navbarItems).length,
        }
      : null,
    theme: themeLink?.theme
      ? {
          id: String(themeLink.theme.id),
          name: themeLink.theme.name,
          definitionPreserved: true,
        }
      : null,
  };
}

module.exports = {
  list,
  listWorkspace,
  listNavigation,
  saveNavigation,
  removeNavigation,
  getById,
  create,
  update,
  remove,
};
