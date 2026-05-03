const express = require('express');

function createSecurityEventsRouter(securityLog) {
  const router = express.Router();

  router.get('/', (req, res) => {
    return res.json(securityLog.listEvents());
  });

  return router;
}

module.exports = {
  createSecurityEventsRouter
};
