# Manual checks

Run the API first:

```bash
npm start
```

Base URL:

```text
http://localhost:3000
```

> All examples are intended only for this local educational lab.

## 1. Health check

```bash
curl http://localhost:3000/health
```

Expected result: `200 OK`.

## 2. Normal vulnerable search

```bash
curl "http://localhost:3000/search/vulnerable?username=admin"
```

Expected result: one user with username `admin`.

## 3. SQL injection against vulnerable endpoint

```bash
curl "http://localhost:3000/search/vulnerable?username=' OR 1=1 --"
```

Expected result: the endpoint returns all demo users because the SQL condition is bypassed.

## 4. UNION-based data exposure against vulnerable endpoint

```bash
curl "http://localhost:3000/search/vulnerable?username=' UNION SELECT id, username, password, is_admin FROM users --"
```

Expected result: password values appear in the response where the public `email` field is expected.

## 5. Normal secure search

```bash
curl "http://localhost:3000/search/secure?username=admin"
```

Expected result: `200 OK`, one user, no password field.

## 6. Repeat SQL injection against secure endpoint

```bash
curl "http://localhost:3000/search/secure?username=' OR 1=1 --"
```

Expected result: `400 VALIDATION_ERROR`.

## 7. Repeat UNION attack against secure endpoint

```bash
curl "http://localhost:3000/search/secure?username=' UNION SELECT id, username, password, is_admin FROM users --"
```

Expected result: `400 VALIDATION_ERROR`.

## 8. Check logged security events

```bash
curl http://localhost:3000/security-events
```

Expected result: JSON list with suspicious and blocked attempts.
