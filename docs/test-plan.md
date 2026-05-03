# Test plan

## Goal

Verify that the project demonstrates SQL injection in a vulnerable endpoint and blocks the same payloads in a secure endpoint.

## Scope

The test scope includes:

- health endpoint;
- normal search behavior;
- SQL injection with `OR 1=1`;
- UNION-based data exposure;
- parameterized secure search;
- input validation;
- response filtering;
- security event logging;
- consistent JSON error responses.

## Out of scope

The following areas are intentionally out of scope for this educational lab:

- real authentication;
- production database persistence;
- frontend UI;
- deployment;
- full WAF/IDS implementation.

## Test levels

- Manual API checks with cURL, PowerShell or Postman.
- Automated integration checks with Node.js built-in test runner.

## Test data

Default demo users:

| Username | Email | Admin |
|---|---|---|
| `admin` | `admin@example.com` | yes |
| `user1` | `user1@example.com` | no |
| `moderator` | `moderator@example.com` | no |

The database also contains password values to demonstrate how SQL injection can expose sensitive columns through the vulnerable endpoint.
