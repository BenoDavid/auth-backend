const { EventEmitter } = require("node:events");

const presenceEvents = new EventEmitter();

function notifyPresenceChanged() {
  presenceEvents.emit("changed");
}

module.exports = { presenceEvents, notifyPresenceChanged };
