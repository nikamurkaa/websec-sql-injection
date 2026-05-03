const { DatabaseSync } = require('node:sqlite');

function createDatabase() {
  const db = new DatabaseSync(':memory:');

  function initialize() {
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        is_admin INTEGER NOT NULL DEFAULT 0
      )
    `);

    const insertUser = db.prepare(
      'INSERT INTO users (username, password, email, is_admin) VALUES (?, ?, ?, ?)'
    );

    insertUser.run('admin', 'AdminPass123!', 'admin@example.com', 1);
    insertUser.run('user1', 'UserPass123!', 'user1@example.com', 0);
    insertUser.run('moderator', 'ModPass123!', 'moderator@example.com', 0);
  }

  function all(sql, params = []) {
    return db.prepare(sql).all(...params);
  }

  function close() {
    db.close();
  }

  return {
    initialize,
    all,
    close
  };
}

module.exports = {
  createDatabase
};
