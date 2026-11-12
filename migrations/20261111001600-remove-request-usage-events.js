"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkDelete("app_telemetry_events", { event_type: "usage" });
  },
  async down() {
    // Request-level usage events are intentionally not restored.
  },
};
