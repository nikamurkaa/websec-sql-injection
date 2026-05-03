const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { createApp } = require('../src/app');

let app;
let server;
let baseUrl;

function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
}

function searchParams(value) {
  return new URLSearchParams({ username: value }).toString();
}

before(async () => {
  app = createApp();
  server = app.listen(0);

  await new Promise(resolve => server.once('listening', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  app.locals.database.close();
});

test('health endpoint returns service status', async () => {
  const response = await request('/health');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
});

test('vulnerable search returns one user for normal username', async () => {
  const response = await request(`/search/vulnerable?${searchParams('admin')}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.mode, 'vulnerable');
  assert.equal(body.users.length, 1);
  assert.equal(body.users[0].username, 'admin');
});

test('vulnerable search can be bypassed with OR 1=1 injection', async () => {
  const payload = "' OR 1=1 --";
  const response = await request(`/search/vulnerable?${searchParams(payload)}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.users.length, 3);
});

test('vulnerable search allows UNION-based sensitive data exposure', async () => {
  const payload = "' UNION SELECT id, username, password, is_admin FROM users --";
  const response = await request(`/search/vulnerable?${searchParams(payload)}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.users.some(user => user.email === 'AdminPass123!'), true);
});

test('secure search returns public user data for normal username', async () => {
  const response = await request(`/search/secure?${searchParams('admin')}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.mode, 'secure');
  assert.equal(body.users.length, 1);
  assert.equal(body.users[0].username, 'admin');
  assert.equal('password' in body.users[0], false);
});

test('secure search rejects OR 1=1 injection payload', async () => {
  const payload = "' OR 1=1 --";
  const response = await request(`/search/secure?${searchParams(payload)}`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('secure search rejects UNION injection payload', async () => {
  const payload = "' UNION SELECT id, username, password, is_admin FROM users --";
  const response = await request(`/search/secure?${searchParams(payload)}`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('security events endpoint stores suspicious search attempts', async () => {
  const response = await request('/security-events');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(body), true);
  assert.equal(body.some(event => event.suspicious === true), true);
  assert.equal(body.some(event => event.blocked === true), true);
});
