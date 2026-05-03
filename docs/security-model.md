# Security model

This project is an educational SQL injection lab. It contains one intentionally vulnerable endpoint and one protected endpoint for comparison.

## Demonstrated vulnerability

### SQL Injection

The vulnerable endpoint builds an SQL query by concatenating user input into the query string:

```js
const sql = `SELECT ... FROM users WHERE username = '${username}'`;
```

This allows a crafted value of `username` to change the SQL query logic.

Demonstrated impact:

- authentication/search condition bypass with `OR 1=1`;
- extraction of additional data with `UNION SELECT`;
- exposure of sensitive columns that should not be returned by a public search endpoint.

## Protection mechanisms

### 1. Parameterized queries

The secure endpoint uses a placeholder and passes user input as a separate parameter:

```js
database.all('SELECT ... FROM users WHERE username = ?', [username]);
```

This prevents user input from being interpreted as SQL code.

### 2. Input validation

The secure endpoint accepts only simple demo usernames:

- latin letters;
- numbers;
- underscore;
- maximum length of 30 characters.

Suspicious SQL-like payloads are rejected with `400 VALIDATION_ERROR`.

### 3. Response filtering

The public response includes only safe fields:

- `id`;
- `username`;
- `email`;
- `isAdmin`.

The `password` column is intentionally present in the database to demonstrate the risk, but it is not selected by the secure endpoint.

### 4. Security event logging

Search attempts are logged in memory and can be checked through:

```http
GET /security-events
```

The log marks suspicious inputs and blocked secure-endpoint attempts.

## Demo limitations

This is not a production-ready application. It intentionally uses an in-memory SQLite database and exposes an educational vulnerable endpoint.

For production, additionally use:

- real persistent storage;
- centralized audit logging;
- authentication and authorization;
- rate limiting;
- structured input validation;
- monitoring and alerting for suspicious queries.
