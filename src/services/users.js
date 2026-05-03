const { isSuspiciousInput } = require('../utils/sql-signals');

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const PUBLIC_USER_COLUMNS = 'id, username, email, is_admin AS isAdmin';

function createUserSearchService(database, securityLog) {
  function validateUsername(username) {
    const errors = [];

    if (typeof username !== 'string' || username.trim().length === 0) {
      errors.push('username query parameter is required.');
      return errors;
    }

    if (username.length > 30) {
      errors.push('username must contain no more than 30 characters.');
    }

    if (!USERNAME_PATTERN.test(username)) {
      errors.push('username may contain only latin letters, numbers and underscore.');
    }

    return errors;
  }

  function searchVulnerable(username) {
    const sql = `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE username = '${username}'`;
    const suspicious = isSuspiciousInput(username);

    securityLog.addEvent({
      route: '/search/vulnerable',
      username,
      suspicious,
      blocked: false,
      reason: suspicious ? 'Suspicious SQL-like input was executed by the vulnerable endpoint.' : null
    });

    const rows = database.all(sql);

    return {
      mode: 'vulnerable',
      warning: 'This endpoint intentionally uses string concatenation and is vulnerable to SQL injection.',
      executedSql: sql,
      users: rows
    };
  }

  function searchSecure(username) {
    const trimmedUsername = typeof username === 'string' ? username.trim() : username;
    const suspicious = isSuspiciousInput(trimmedUsername);
    const validationErrors = validateUsername(trimmedUsername);

    if (validationErrors.length > 0) {
      securityLog.addEvent({
        route: '/search/secure',
        username: trimmedUsername || '',
        suspicious,
        blocked: true,
        reason: validationErrors.join(' ')
      });

      return {
        ok: false,
        errors: validationErrors
      };
    }

    securityLog.addEvent({
      route: '/search/secure',
      username: trimmedUsername,
      suspicious,
      blocked: false,
      reason: null
    });

    const rows = database.all(
      `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE username = ?`,
      [trimmedUsername]
    );

    return {
      ok: true,
      result: {
        mode: 'secure',
        protection: 'Parameterized query with input validation.',
        users: rows
      }
    };
  }

  return {
    searchVulnerable,
    searchSecure,
    validateUsername
  };
}

module.exports = {
  createUserSearchService
};
