function createSecurityLog() {
  const events = [];

  function addEvent(event) {
    const normalizedEvent = {
      id: events.length + 1,
      timestamp: new Date().toISOString(),
      ...event
    };

    events.push(normalizedEvent);
    return normalizedEvent;
  }

  function listEvents() {
    return events.slice(-50);
  }

  return {
    addEvent,
    listEvents
  };
}

module.exports = {
  createSecurityLog
};
