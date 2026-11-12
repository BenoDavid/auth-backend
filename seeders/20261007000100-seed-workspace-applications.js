"use strict";

const applications = [
  { applicationName: "WMS", applicationIcon: "bi-sign-railroad-fill", requiredPermission: "wms" },
  { applicationName: "Troubleshoot", applicationIcon: "bi-app-indicator", requiredPermission: "fpt" },
  { applicationName: "TechTicket", applicationIcon: "bi-bug", requiredPermission: "TT-CREATE" },
  { applicationName: "cuttingQC", applicationIcon: "bi-gear", requiredPermission: "CQC" },
  { applicationName: "WorkVault", applicationIcon: "bi-building", requiredPermission: "PMS-APP" },
  { applicationName: "NPT", applicationIcon: "bi-app-indicator", requiredPermission: "NPT-APP" },
  { applicationName: "Audit-PRO", applicationIcon: "bi-search", requiredPermission: "Audit-PRO-APP" },
  { applicationName: "Fit Track", applicationIcon: "bi-person-walking", requiredPermission: "FITTRACK-APP" },
  { applicationName: "Sample Tracking", applicationIcon: "bi-app-indicator", requiredPermission: "SAMPLE-TRACKING-APP" },
  { applicationName: "Courier Tracker", applicationIcon: "bi-app-indicator", requiredPermission: "COURIER-TRACKER-APP" },
  { applicationName: "Visitor Management", applicationIcon: "bi-people-fill", requiredPermission: "VISITOR-MANAGEMENT-APP" },
  { applicationName: "Security Audit", applicationIcon: "bi-shield-lock-fill", requiredPermission: "SECURITY-AUDIT-APP" },
  { applicationName: "Fabric Relaxation", applicationIcon: "bi-layers-fill", requiredPermission: "FABRIC-RELAXATION-APP" },
  { applicationName: "CTQ Audit", applicationIcon: "bi-journal-check", requiredPermission: "CTQ-AUDIT-APP" },
  { applicationName: "Stock Verify", applicationIcon: "bi-journal-check", requiredPermission: "STOCK-VERIFY-APP" },
  { applicationName: "Fabric Tracker", applicationIcon: "bi-layers", requiredPermission: "FABRIC-TRACKER-APP" },
  { applicationName: "MD Scan", applicationIcon: "bi-qr-code-scan", requiredPermission: "MD-SCAN-APP" },
  { applicationName: "Automation Tracker", applicationIcon: "bi-robot", requiredPermission: "AUTOMATION-TRACKER-APP" },
  { applicationName: "WMS-BIA-V2", applicationIcon: "bi-app-indicator", requiredPermission: "INVENTORY-AUDIT-APP" },
  { applicationName: "Process Audit", applicationIcon: "bi-layers", requiredPermission: "PROCESS-AUDIT-APP" },
  { applicationName: "Courier Management System", applicationIcon: "bi-truck", requiredPermission: "COURIER-MANAGEMENT-SYSTEM-APP" },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT id, application_name, application_icon, required_permission FROM app_applications",
      { type: Sequelize.QueryTypes.SELECT },
    );
    const existingByName = new Map(
      existing.map((application) => [application.application_name.toLocaleLowerCase(), application]),
    );
    const missing = [];

    for (const application of applications) {
      const current = existingByName.get(application.applicationName.toLocaleLowerCase());
      if (!current) {
        missing.push({
          application_name: application.applicationName,
          application_icon: application.applicationIcon,
          required_permission: application.requiredPermission,
        });
      } else if (!current.application_icon || !current.required_permission) {
        await queryInterface.bulkUpdate(
          "app_applications",
          {
            application_icon: current.application_icon || application.applicationIcon,
            required_permission: current.required_permission || application.requiredPermission,
          },
          { id: current.id },
        );
      }
    }

    if (missing.length > 0) {
      await queryInterface.bulkInsert("app_applications", missing);
    }
  },

  async down() {
    // Keep application catalog entries so existing permissions and themes remain valid.
  },
};
