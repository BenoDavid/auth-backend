# IAM telemetry

AuthGuard v2 owns WebUtil and Error Logs. WebUtil stores one daily usage row per authenticated user and application, including first login/usage time and last seen time. Handled Express errors remain event records in `app_telemetry_events`.

## Endpoints

All endpoints require an AuthGuard bearer token.

- `GET /v3/api/auth/telemetry/usage` — paginated daily user/application usage; requires `admin-user`, `usage:read`, or `*`.
- `GET /v3/api/auth/telemetry/errors` — paginated errors; requires `admin-logs` or `*`.
- `GET /v3/api/auth/telemetry/summary` — usage totals, unique users, applications, error rate, and average latency; requires `admin-user`, `usage:read`, or `*`.

Supported query filters are `from`, `to`, `search`, `applicationName`, `employeeCode`, `organizationId`, `factoryId`, `vendorId`, `ipAddress`, `severity`, `page`, and `pageSize`.

## Context from applications

Applications may send the following optional headers to label daily usage and error telemetry. They are reporting labels only; authorization and data access remain controlled by AuthGuard access scopes.

`x-application-name`, `x-organization-id`, `x-organization-name`, `x-factory-id`, `x-factory-name`, `x-vendor-id`, and `x-vendor-name`.

User identity is taken from the authenticated AuthGuard user, and the client IP is taken from Express request metadata. Authorization headers, tokens, credentials, and request bodies are never stored in telemetry. Stack traces are omitted when `NODE_ENV=production`.

## Operations

Run the migration and permission seeder from `authguardv2-node`:

```powershell
npm run db:migrate
npm run db:seed:auth
```

The Angular `/adminv2/webutil` and `/adminv2/error/logs` screens call these endpoints directly through the existing AuthGuard API interceptor. No legacy WebUtil service is needed for these screens.
