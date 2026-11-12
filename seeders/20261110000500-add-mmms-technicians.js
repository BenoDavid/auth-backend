'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [permission] = await queryInterface.sequelize.query(
      "SELECT id FROM app_permissions WHERE name = 'MMMS-TECHNICIANS' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT },
    );
    let permissionId = permission?.id;
    if (!permissionId) {
      const inserted = await queryInterface.bulkInsert('app_permissions', [{ name: 'MMMS-TECHNICIANS', appname: 'MMMS', enabled: true }], { returning: true });
      permissionId = inserted?.[0]?.id;
    }

    const [role] = await queryInterface.sequelize.query(
      "SELECT id FROM app_roles WHERE name = 'ADMIN' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (role?.id && permissionId) {
      const [link] = await queryInterface.sequelize.query(
        'SELECT 1 FROM app_role_permissions WHERE role_id = :roleId AND permission_id = :permissionId LIMIT 1',
        { replacements: { roleId: role.id, permissionId }, type: Sequelize.QueryTypes.SELECT },
      );
      if (!link) await queryInterface.bulkInsert('app_role_permissions', [{ role_id: role.id, permission_id: permissionId }]);
    }

    const [navigation] = await queryInterface.sequelize.query(
      "SELECT navbar_items FROM app_application_navigation WHERE LOWER(application_name) = 'mmms' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT },
    );
    if (navigation) {
      const items = typeof navigation.navbar_items === 'string' ? JSON.parse(navigation.navbar_items) : (navigation.navbar_items || []);
      if (!items.some((item) => item.permission === 'MMMS-TECHNICIANS')) {
        items.splice(2, 0, { icon: 'bi-people', link: '/mmms/technicians', label: 'Technicians', permission: 'MMMS-TECHNICIANS' });
        await queryInterface.sequelize.query(
          'UPDATE app_application_navigation SET navbar_items = :items WHERE LOWER(application_name) = \'mmms\'',
          { replacements: { items: JSON.stringify(items) } },
        );
      }
    }
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query("DELETE FROM app_role_permissions WHERE permission_id IN (SELECT id FROM app_permissions WHERE name = 'MMMS-TECHNICIANS')");
    await queryInterface.sequelize.query("DELETE FROM app_permissions WHERE name = 'MMMS-TECHNICIANS'");
  },
};
