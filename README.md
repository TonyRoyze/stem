# STEM

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Convex](https://img.shields.io/badge/Convex-3ECF8E?style=flat&logo=convex&logoColor=white)](https://convex.dev)
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=flat&logo=github&logoColor=white)](https://github.com/TonyRoyze/stem)

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
