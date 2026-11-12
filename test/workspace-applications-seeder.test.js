const test = require("node:test");
const assert = require("node:assert/strict");
const seeder = require("../seeders/20261007000100-seed-workspace-applications");

test("workspace application seeder adds all entries from the application workspace", async () => {
  let inserted;
  const updated = [];
  await seeder.up(
    {
      sequelize: {
        query: async () => [
          { id: 1, application_name: "wms" },
          { id: 2, application_name: "Other app", application_icon: "bi-grid", required_permission: "other:open" },
        ],
      },
      bulkUpdate: async (table, values, where) => updated.push({ table, values, where }),
      bulkInsert: async (table, rows) => {
        assert.equal(table, "app_applications");
        inserted = rows;
      },
    },
    { QueryTypes: { SELECT: "SELECT" } },
  );

  assert.equal(inserted.length, 20);
  assert.equal(inserted.some((row) => row.application_name === "WMS"), false);
  assert.equal(inserted.some((row) => row.application_name === "Courier Management System"), true);
  assert.equal(inserted[0].application_icon, "bi-app-indicator");
  assert.equal(inserted[0].required_permission, "fpt");
  assert.equal(updated.length, 1);
  assert.equal(updated[0].where.id, 1);
  assert.equal(updated[0].values.application_icon, "bi-sign-railroad-fill");
});

test("workspace application seeder is safe to rerun when entries already exist", async () => {
  let insertCalled = false;
  await seeder.up(
    {
      sequelize: {
        query: async () =>
          [
            "WMS",
            "Troubleshoot",
            "TechTicket",
            "cuttingQC",
            "WorkVault",
            "NPT",
            "Audit-PRO",
            "Fit Track",
            "Sample Tracking",
            "Courier Tracker",
            "Visitor Management",
            "Security Audit",
            "Fabric Relaxation",
            "CTQ Audit",
            "Stock Verify",
            "Fabric Tracker",
            "MD Scan",
            "Automation Tracker",
            "WMS-BIA-V2",
            "Process Audit",
            "Courier Management System",
          ].map((application_name) => ({
            application_name,
            application_icon: "bi-app-indicator",
            required_permission: "already:configured",
          })),
      },
      bulkUpdate: async () => {
        insertCalled = true;
      },
      bulkInsert: async () => {
        insertCalled = true;
      },
    },
    { QueryTypes: { SELECT: "SELECT" } },
  );

  assert.equal(insertCalled, false);
});
