# WebSec SQL Injection

Учебный backend-проект по безопасности веб-приложений: небольшое приложение на **Node.js + Express + SQLite**, которое показывает SQL Injection и способы защиты от неё.

Проект содержит два варианта поиска пользователей:

- уязвимый endpoint, где SQL-запрос собирается через конкатенацию строк;
- защищённый endpoint, где используются параметризованные запросы, валидация входных данных и фильтрация ответа.

> Проект является учебным security lab и предназначен для портфолио. Это не production-ready приложение и не инструкция для атаки на реальные системы.

## Что демонстрирует проект

В проекте реализованы:

- REST API на Express;
- SQLite database in memory;
- разделение приложения на `app`, `server`, `routes`, `middleware`, `services`, `data`, `utils`;
- уязвимый поиск пользователей через string concatenation;
- демонстрация SQL Injection через `OR 1=1`;
- демонстрация UNION-based data exposure;
- защищённый поиск через parameterized query;
- allowlist-валидация `username`;
- фильтрация ответа: API не отдаёт поле `password` в защищённом endpoint;
- логирование подозрительных поисковых запросов;
- единый JSON-формат ошибок;
- OpenAPI-спецификация;
- Postman-коллекция;
- автотесты на встроенном `node:test`;
- GitHub Actions CI.

## Стек технологий

- Node.js
- Express
- SQLite
- JavaScript
- Node.js Test Runner
- OpenAPI
- Postman
- GitHub Actions

## Структура проекта

```text
websec-sql-injection-lab/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── data/
│   │   ├── database.js
│   │   └── security-log.js
│   ├── middleware/
│   │   └── errors.js
│   ├── routes/
│   │   ├── search.js
│   │   └── security-events.js
│   ├── services/
│   │   └── users.js
│   └── utils/
│       └── sql-signals.js
├── tests/
│   └── sql-injection.test.js
├── docs/
│   ├── manual-checks.md
│   ├── openapi.yaml
│   ├── security-model.md
│   └── test-plan.md
├── postman/
│   ├── websec-sql-injection-lab.postman_collection.json
│   └── websec-sql-injection-lab.local.postman_environment.json
├── .github/workflows/ci.yml
├── .env.example
├── .editorconfig
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

## Установка и запуск

### 1. Клонировать репозиторий

```bash
git clone https://github.com/kindarufy/websec-sql-injection-lab.git
cd websec-sql-injection-lab
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Запустить приложение

```bash
npm start
```

По умолчанию API будет доступно по адресу:

```text
http://localhost:3000
```

## Переменные окружения

Пример переменных находится в файле `.env.example`:

```env
PORT=3000
```

Если переменная окружения не задана, приложение использует порт `3000`.

## API endpoints

### Health check

```http
GET /health
```

Пример ответа:

```json
{
  "status": "ok",
  "service": "websec-sql-injection-lab"
}
```

### Уязвимый поиск пользователей

```http
GET /search/vulnerable?username=admin
```

Пример ответа:

```json
{
  "mode": "vulnerable",
  "warning": "This endpoint intentionally uses string concatenation and is vulnerable to SQL injection.",
  "executedSql": "SELECT id, username, email, is_admin AS isAdmin FROM users WHERE username = 'admin'",
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "isAdmin": 1
    }
  ]
}
```

### Защищённый поиск пользователей

```http
GET /search/secure?username=admin
```

Пример ответа:

```json
{
  "mode": "secure",
  "protection": "Parameterized query with input validation.",
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "isAdmin": 1
    }
  ]
}
```

### Журнал security events

```http
GET /security-events
```

Endpoint возвращает последние поисковые события, включая подозрительные и заблокированные запросы.

## Демонстрация SQL Injection

### Нормальный запрос

```bash
curl "http://localhost:3000/search/vulnerable?username=admin"
```

Ожидаемый результат: возвращается только пользователь `admin`.

### SQL Injection через OR 1=1

```bash
curl "http://localhost:3000/search/vulnerable?username=' OR 1=1 --"
```

Ожидаемый результат: уязвимый endpoint возвращает всех пользователей.

### UNION-based data exposure

```bash
curl "http://localhost:3000/search/vulnerable?username=' UNION SELECT id, username, password, is_admin FROM users --"
```

Ожидаемый результат: через уязвимый endpoint можно получить значения из колонки `password`.

## Защита

Защищённый endpoint использует два основных механизма:

| Проблема | Как исправлено |
|---|---|
| Конкатенация пользовательского ввода в SQL | Используется параметризованный запрос `WHERE username = ?` |
| SQL-like payload в query parameter | Добавлена allowlist-валидация `username` |
| Риск утечки чувствительных колонок | В ответ выбираются только публичные поля |
| Невидимость подозрительных запросов | Добавлено in-memory логирование security events |

Пример безопасного запроса:

```js
database.all(
  'SELECT id, username, email, is_admin AS isAdmin FROM users WHERE username = ?',
  [username]
);
```

Попытка повторить атаку на защищённый endpoint:

```bash
curl "http://localhost:3000/search/secure?username=' OR 1=1 --"
```

Пример ответа:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid username query parameter.",
    "details": [
      "username may contain only latin letters, numbers and underscore."
    ]
  }
}
```

Подробнее: [`docs/security-model.md`](docs/security-model.md)

## Ручная проверка

Все команды для ручной проверки находятся в файле:

```text
docs/manual-checks.md
```

## Автотесты

Запуск тестов:

```bash
npm test
```

Проверка синтаксиса основных файлов:

```bash
npm run check
```

В тестах проверяется:

- доступность `/health`;
- нормальный поиск в уязвимом endpoint;
- успешная SQL Injection через `OR 1=1` в уязвимом endpoint;
- успешная UNION-based data exposure в уязвимом endpoint;
- нормальный поиск в защищённом endpoint;
- отсутствие поля `password` в защищённом ответе;
- блокировка SQL Injection payload в защищённом endpoint;
- блокировка UNION payload в защищённом endpoint;
- логирование подозрительных запросов.

## OpenAPI

Спецификация API находится в файле:

```text
docs/openapi.yaml
```

Её можно открыть в Swagger Editor или использовать как документацию к API.

## Postman

Postman-коллекция и environment находятся в папке:

```text
postman/
```

Импортировать в Postman:

- `websec-sql-injection-lab.postman_collection.json`
- `websec-sql-injection-lab.local.postman_environment.json`

## CI

В проекте настроен GitHub Actions workflow:

```text
.github/workflows/ci.yml
```

CI устанавливает зависимости, проверяет синтаксис и запускает автотесты.

## Статус проекта

Проект выполнен как учебная работа по безопасности веб-приложений и оформлен как портфолио-проект. Он показывает понимание SQL Injection, параметризованных запросов, валидации входных данных и безопасной фильтрации ответов API.
