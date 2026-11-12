function userHasPermission(user, permissionName) {
  if (!user || !Array.isArray(user.roles)) return false;
  return user.roles.some(
    (role) =>
      role.enabled &&
      Array.isArray(role.permissions) &&
      role.permissions.some((permission) => permission.enabled && (permission.name === "*" || permission.name === permissionName)),
  );
}

module.exports = { userHasPermission };
