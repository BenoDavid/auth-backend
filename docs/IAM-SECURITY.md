# IAM security and application control

Root v2 is presented as **IAM** in the product UI. The `/adminv2` URL is retained as a compatibility alias so existing bookmarks and customer integrations do not break.

## Security boundaries

- The browser is only a presentation layer. Every user, role, permission, navigation, and vendor operation is authorized again by AuthGuard v2.
- Application workspaces and navigation entries are filtered by the authenticated server-side permissions before they are returned to clients.
- Production JWTs are signed with HS256 and validated with issuer `platform-iam`, audience `platform-applications`, expiry, and the database-backed `sessionVersion`. A changed session version invalidates existing tokens.
- Production must use a unique secret of at least 32 characters. Never use the example secret.
- Development wildcard bypass is disabled by default and is restricted to loopback when explicitly enabled with `ALLOW_DEV_AUTH_BYPASS=true`.
- API responses include anti-clickjacking, MIME-sniffing, referrer, permissions, CSP, and production HSTS headers.
- Login/token endpoints are throttled per source address and employee code.
- MMMS validates the same JWT issuer and audience and applies the permission/data-scope boundary server-side.

## Selling applications

Each sellable application should have a unique application permission (for example `MMMS-APP`). Assigning that permission is the server-side entitlement gate; navigation visibility is only a convenience. Customer organization/factory boundaries should be assigned separately through access scopes, never encoded as a client-side flag.

For production deployment, use an external rate-limit store, TLS termination, a secrets manager, database backups, audit logging, and a separate IAM database per environment. No application can make itself an administrator by editing browser storage or sending a forged permission list; only permissions loaded from the signed token and database-backed roles are trusted.
