# WebSec SQL Injection

**WebSec SQL Injection** — учебный backend security lab на **Node.js + Express + SQLite**, который показывает SQL Injection и безопасный вариант реализации того же API-сценария.

В проекте намеренно существуют два endpoint'а:

- **vulnerable** — SQL-запрос собирается конкатенацией строк;
- **secure** — используются parameterized query, allowlist-валидация и фильтрация ответа.

> Уязвимый endpoint существует исключительно для локального обучения и тестирования. Проект не является инструкцией по атаке реальных систем.

## Что демонстрирует проект

- SQL Injection через небезопасную string concatenation;
- сценарий `OR 1=1` в изолированном demo API;
- UNION-based data exposure в учебной базе;
- parameterized queries как основную защиту;
- allowlist-валидацию пользовательского ввода;
- исключение поля `password` из безопасного API-ответа;
- логирование подозрительных search events;
- единый JSON-формат ошибок;
- OpenAPI, Postman, automated tests и GitHub Actions CI.

## Стек

- Node.js
- Express
- SQLite
- JavaScript
- Node.js Test Runner
- OpenAPI
- Postman
- GitHub Actions

## Структура

```text
websec-sql-injection/
├── src/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── data/
│   └── utils/
├── tests/
├── docs/
├── postman/
├── .github/workflows/ci.yml
├── .env.example
├── package.json
└── README.md
```

## Локальный запуск

```bash
git clone https://github.com/nikamurkaa/websec-sql-injection.git
cd websec-sql-injection
npm install
npm start
```

API по умолчанию:

```text
http://localhost:3000
```

## Endpoint'ы

| Метод | Endpoint | Назначение |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/search/vulnerable?username=...` | Намеренно уязвимый поиск |
| `GET` | `/search/secure?username=...` | Защищённый поиск |
| `GET` | `/security-events` | Журнал поисковых/security events |

## Уязвимый и защищённый подход

Небезопасная идея:

```text
SELECT ... WHERE username = '<user input>'
```

когда `<user input>` добавляется в SQL через конкатенацию.

Защищённый endpoint использует параметризованный запрос и передаёт пользовательское значение отдельно от SQL-шаблона. Дополнительно применяется allowlist-валидация и response filtering.

| Риск | Защита secure endpoint |
| --- | --- |
| SQL Injection | parameterized query |
| Неконтролируемый ввод | allowlist username validation |
| Sensitive data exposure | поле password не возвращается |
| Подозрительная активность | security event logging |

Подробнее: [`docs/security-model.md`](docs/security-model.md).

## Локальная демонстрация

Обычный запрос к намеренно уязвимому endpoint:

```bash
curl "http://localhost:3000/search/vulnerable?username=admin"
```

Проверку security-сценариев рекомендуется выполнять только против этого локального учебного приложения. Полный набор примеров находится в [`docs/manual-checks.md`](docs/manual-checks.md).

## Проверка

```bash
npm test
npm run check
```

Тесты сравнивают поведение vulnerable/secure endpoint'ов и проверяют валидацию, response filtering и security logging.

OpenAPI: [`docs/openapi.yaml`](docs/openapi.yaml).  
Postman: [`postman/`](postman/).

## Статус

Проект завершён и используется как portfolio lab по **SQL Injection, secure query construction и API hardening**.

## Автор

[Николь Журбенко](https://github.com/nikamurkaa)
