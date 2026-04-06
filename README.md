# STEM

## Auth

The app now uses email/password accounts stored in Convex.

Set these values in `.env.local`:

```bash
AUTH_SECRET=a-long-random-secret
```

When the `users` table is empty, the login page switches into first-account setup mode.

Passwords are stored as an HMAC hash derived from `AUTH_SECRET`, and each user gets a stable `internalId`.

In local development only, `AUTH_SECRET` falls back to:

```bash
AUTH_SECRET=stem-dev-secret-change-me
```

Routes under `/papers`, `/preview`, `/profile`, `/api/export-pdf`, and the `/` entrypoint are protected by the auth cookie.
