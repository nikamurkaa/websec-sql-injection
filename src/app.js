const express = require('express');
const { createDatabase } = require('./data/database');
const { createSecurityLog } = require('./data/security-log');
const { notFoundHandler, errorHandler } = require('./middleware/errors');
const { createSearchRouter } = require('./routes/search');
const { createSecurityEventsRouter } = require('./routes/security-events');
const { createUserSearchService } = require('./services/users');

function createApp(options = {}) {
  const app = express();
  const database = options.database || createDatabase();
  const securityLog = options.securityLog || createSecurityLog();

  database.initialize();

  const userSearchService = createUserSearchService(database, securityLog);

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.locals.database = database;

  app.get('/health', (req, res) => {
    return res.json({ status: 'ok', service: 'websec-sql-injection-lab' });
  });

  app.use('/search', createSearchRouter(userSearchService));
  app.use('/security-events', createSecurityEventsRouter(securityLog));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
