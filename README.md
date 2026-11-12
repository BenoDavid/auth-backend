# AuthGuard v2 Node.js

Express/Sequelize implementation of AuthGuard v2 backed by PostgreSQL. The service is mounted at `/v3/api/auth`. This project includes user registration and login, JWT token generation, user/role/permission management, the Application/Theme entities, SQL migrations, and database seeding.

## Requirements and setup

- Node.js 22 or newer
- Docker Desktop (for the independent PostgreSQL container)

```powershell
Copy-Item .env.example .env
npm install
docker compose up -d postgres
npm run db:setup
npm start
```

The default `npm run db:seed` creates only the super-admin authentication data. The application catalog and workspace navigation seeders are separate and must be run explicitly with `npm run db:seed:workspace`.

Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and optional SSL settings in `.env`. With `NODE_ENV=development`, login returns a development-only session marker containing the user ID, session version, and login time; protected API routes retain wildcard permissions while identifying that user for presence and command polling. No `JWT_SECRET` is needed. For any non-development environment, configure a random `JWT_SECRET` of at least 32 characters; JWTs are validated and expire after `JWT_EXPIRES_IN` (default `8h`). Never expose development mode outside local development. Migrations are explicit; the service does not call `sequelize.sync()` at startup.

The active Angular development environment in `cfadmin-frontend` must point `authv2ApiUrl` at the Node host (for example, `http://localhost:3026/v3` when running locally). The Node service then serves `/v3/api/auth/...`. The legacy v1 `authApiUrl` remains unchanged. Production still requires the existing auth host/reverse proxy to route API requests and WebSocket upgrades for `/v3/api/auth/admin/presence` to this Node service, forwarding the WebSocket `Upgrade` and `Connection` headers.

To enable administration after registering the first account:

```powershell
npm run bootstrap:admin -- <employeeCode>
```

This grants that account the `ADMIN` role and wildcard permission. Run it only for a trusted account.

## Project structure

The code is split into resource-specific files, following the Spring Boot controller/service/model organization:

- `src/controllers/`: Auth, users, roles, permissions, applications, themes
- `src/services/`: Auth, users, roles, permissions, applications, themes
- `src/models/`: one Sequelize model per entity plus association setup in `index.js`
- `src/routes/`: one router per API resource, combined by `index.js`

## API

The current Express mount is `/v3/api/auth`. Workspace applications expose the `applicationName`, optional Bootstrap `applicationIcon`, and optional `requiredPermission` catalog fields.

All paths are relative to `/v2/api/auth`. JSON bodies use the property names from the Java DTOs. Management endpoints require `Authorization: Bearer YOUR_JWT_HERE` and the corresponding enabled permission.

| Method | Path | Purpose |
|---|---|---|
| POST | `/users/register` | Register a user (automatically assigned the seeded `USER` role) |
| POST | `/users/login` | Authenticate and return user data plus a JWT |
| POST | `/users/generate-token` | Authenticate and return a token |
| POST | `/token/need-token` | Authenticated service-token response with validity metadata |
| GET | `/users/me` | Return the authenticated user and current roles/permissions |
| POST | `/users/me/activity` | Record authenticated user activity for presence monitoring |
| GET | `/users/me/commands?after={id}` | Poll for administrator commands for the signed-in user |
| WebSocket | `/admin/presence` | Stream user presence snapshots to authenticated `users:manage` administrators |
| GET, POST | `/users` | List/create users (`users:manage`) |
| PUT, PATCH, DELETE | `/users/:id` | Update user, toggle status with `?enable=true|false`, or delete (`users:manage`) |
| POST | `/users/:id/commands` | Send `refresh`, `logout`, `message`, or `navigate` to every open session (`users:manage`); navigation must target a configured application route |
| GET, POST | `/roles` | List/create roles (`roles:manage`) |
| PUT, PATCH, DELETE | `/roles/:id` | Update role, toggle status, or delete (`roles:manage`) |
| GET, POST | `/permissions` | List/create permissions (`permissions:manage`) |
| PUT, PATCH, DELETE | `/permissions/:id` | Update permission, toggle status, or delete (`permissions:manage`) |
| GET, POST | `/applications`, `/themes` | List/create applications and themes (`applications:manage`, `themes:manage`) |
| PUT, DELETE | `/applications/:id`, `/themes/:id` | Update/delete applications and themes (matching `:manage` permission) |
| GET | `/applications/workspace` | Return the application catalog and backend-managed `landingRoute`/`navbarItems` to authenticated users |
| GET | `/applications/navigation` | List navigation configurations (`applications:manage`) |
| PUT, DELETE | `/applications/navigation/:applicationName` | Create/update or remove an application's navigation configuration (`applications:manage`) |
| GET | `/version` | Return the current deployed frontend version; public and not cacheable |

`GET /v3/api/auth/applications/workspace` returns the same application array as `result`, plus a `navigation` array of `{ applicationName, landingRoute, navbarItems }` objects. Run `npm run db:migrate` before `npm run db:seed` to create the super-admin authentication data. The workspace catalog and navigation configuration are intentionally empty by default; populate them only with the explicit `npm run db:seed:workspace` command.

Navigation configuration writes accept `landingRoute` and a `navbarItems` array. Each item requires `icon`, `link`, `label`, and `permission`; landing and item routes must be absolute Angular paths beginning with one slash.

Set `APP_VERSION` in the AuthGuard backend deployment to the frontend release version (defaults to `1.0.0`). Keep it equal to the frontend `environment.appVersion`; increment both for each frontend deployment. The frontend polls this endpoint and prompts logged-in users to confirm twice before logging out and doing a cache-busted full reload.

User request examples:

```json
{
  "employeeCode": "E1001",
  "employeeName": "Example User",
  "authCode": "use-a-strong-secret"
}
```

Role bodies accept `name` and optional `permissionIds`; managed user bodies accept `employeeCode`, `employeeName`, `authCode`, and `roleIds`. Application bodies accept `applicationName` and optional `themeId`; theme bodies accept `name`, `primaryColor`, `secondaryColor`, and `textColor`.

Passwords/auth codes are bcrypt-hashed for new and updated users and never returned by the API. Existing plaintext credentials can authenticate once and are upgraded to bcrypt on successful login. Registration does not accept role assignment, preventing a new account from granting itself administrative permissions.

User presence is account-level: successful login records `lastLoginAt` and activity heartbeats update `lastActivityAt`. The Angular client sends a heartbeat every 30 seconds while the signed-in v2 user is actively interacting with the app. The admin user list receives an initial snapshot and live updates over an authenticated WebSocket; users are considered online for up to five minutes after their latest activity. Administrators can refresh, force logout, send a message, or navigate every open session to a configured workspace landing or navbar route; clients check for commands every five seconds. Navigation targets are checked against the selected application's current workspace navigation before being queued and again on the recipient before routing. Logout increments a per-user session version so all previously issued tokens are rejected, including sessions that miss the poll. Users without tracked activity are shown as never active. Apply pending migrations with `npm run db:migrate` before deploying this code.

The migrations use the legacy table names (`app_users`, `app_roles`, `app_permissions`, `app_user_roles`, `app_role_permissions`, `app_applications`, `app_themes`, and `application_themes`) and do not create ORM timestamp columns. In `app_user_roles`, the legacy `employee_code` column stores the numeric `app_users.id` foreign key, despite its name.

Run `npm run db:migrate` and then `npm run db:seed` to create only the super-admin authentication data. The workspace catalog and navigation seeders are separate and must be invoked explicitly with `npm run db:seed:workspace`.
# authguardv2-node
# authguardv2-node
# authguardv2-node
# authguardv2-node
# authguardv2-node
# authguardv2-node
# auth-backend
