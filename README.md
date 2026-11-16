# TechFlow

**Report It. Track It. Fix It.** TechFlow is a Next.js application for reporting and resolving public infrastructure issues. Citizens submit map based reports; department administrators review and assign them; field workers upload evidence; citizens verify the outcome.

## Architecture

| Layer | Implementation |
| --- | --- |
| Presentation | Next.js App Router, React, TypeScript, Tailwind CSS, shadcn style UI components, Lucide, Leaflet, Recharts |
| Application | Route Handlers, Auth.js credentials sessions, Zod validation, role checks |
| Business logic | `src/services` for complaints, notifications, analytics |
| Data | PostgreSQL, Prisma, relational migrations, transactions |
| External | Cloudinary direct signed image uploads, OpenStreetMap tiles, Resend email, Vercel Cron |

The initial migration creates a PostgreSQL ticket sequence, an active assignment partial unique index, and checks for coordinates, ratings, and SLA hours. Complaint and assignment history are retained when a citizen withdraws a submitted report.

## Versions

Versions are pinned in `package.json` and `package-lock.json`. Key versions: Next.js 15.5.29, React 19.2.0, TypeScript 5.9.3, Prisma 6.19.3, next-auth 4.24.15, Tailwind CSS 3.4.18, Zod 3.25.76. Run `npm ci` to install the lockfile exactly.

## Local setup

1. Install Node.js 20 or newer and PostgreSQL 15 or newer.
2. Copy `.env.example` to `.env.local`. Set `DATABASE_URL`, `NEXTAUTH_SECRET` (random 32+ bytes), `NEXTAUTH_URL`, and `APP_URL`.
3. For image uploads, set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Without these, complaints can still be submitted without photos. Cloudinary uploads allow JPG, PNG, and WebP up to 5 MB.
4. For password reset email, set `RESEND_API_KEY` and a verified `EMAIL_FROM`. Reset requests always return the same message regardless of account existence.
5. Run:

```bash
npm ci
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

`prisma migrate deploy` applies the checked in SQL migration. To create a new migration after editing the schema, use `npm run db:dev`. Do not use `prisma db push` for production.

For demonstration accounts, set a unique `SEED_DEMO_PASSWORD` of at least 12 characters before running the seed. The four optional accounts are `citizen@techflow.example`, `superadmin@techflow.example`, `roadsadmin@techflow.example`, and `worker@techflow.example`. They share only the password supplied through that environment variable. Remove these accounts or change their passwords before a public deployment. Seeded departments, categories, and sample SLA policies are identified as demonstration configuration; no complaint metrics are seeded.

## Main workflows

| Role | Portal | Workflow |
| --- | --- | --- |
| Citizen | `/citizen/dashboard` | Register, submit a report, track it, support a nearby report, inspect evidence, verify or reject resolution, leave feedback |
| Super admin | `/admin/dashboard` | View all reports, manage departments, staff and sample SLA policies, inspect analytics and audit logs |
| Department admin | `/admin/dashboard` | Review only their department's reports, set priority, assign eligible workers, approve or reject completion evidence |
| Field worker | `/worker/dashboard` | Accept assigned tasks, upload progress and completion evidence, submit resolution |

Status changes, notifications, and audit entries are recorded in database transactions. A completion image is required before worker resolution. Department approval is required before citizen verification. Public ticket lookup intentionally omits citizen identity, exact address, photos, and remarks.

## REST API

Responses use `{ "data": ... }` for success and `{ "error": ... }` for failures. Auth.js handles sign in and sign out under `/api/auth/[...nextauth]`. Other routes include registration, password reset, profile, complaints, assignment, status, evidence, verification, feedback, departments, workers, notifications, analytics, signed uploads, and a scheduled SLA check. An API collection is in `postman/TechFlow.postman_collection.json`.

## Testing

```bash
npm run typecheck
npm test
npm run build
npx playwright test
```

Unit tests cover lifecycle permissions, geographic distance, and request validation. Playwright has public page smoke tests. Set `TECHFLOW_E2E_PASSWORD` to the seeded demo password to enable the authenticated workflow test against a migrated test database. Full resolution, Cloudinary, and email delivery still need configured services and manual verification. A successful build alone does not validate those external integrations.

## Deploying to Vercel and Supabase

1. Push this repository to GitHub and connect it to a Vercel project.
2. Create a Supabase PostgreSQL project. Set `DATABASE_URL` to its connection string in Vercel, with SSL parameters required by Supabase.
3. Set the auth, Cloudinary, Resend, and `CRON_SECRET` environment variables in Vercel. Set `NEXTAUTH_URL` and `APP_URL` to the deployed HTTPS origin.
4. Apply migrations against the production database with `npx prisma migrate deploy`. Seed only when intended; the demo password is optional and should not be present in ordinary production configuration.
5. Deploy. `vercel.json` schedules the SLA endpoint hourly. Vercel sends `Authorization: Bearer <CRON_SECRET>` to the cron route.
6. Verify registration, login, one complaint, assignment, evidence upload, department approval, citizen verification, and notification delivery with separate accounts.

Do not commit `.env` files. Store secrets in the hosting environment. Cloudinary files are stored outside PostgreSQL; only their public IDs and URLs are relational records.

## Team development

Suggested ownership: citizen UI; service and REST logic; database and auth; maps, uploads, analytics, testing, and deployment. Use focused Git branches and review migration changes together because all roles share the relational workflow.

## Current verification limits

This workspace did not have a PostgreSQL connection, Supabase project, Cloudinary account, or Resend credentials during development. Prisma schema validation, TypeScript checks, unit tests, and the production compilation can run locally. Database migrations and all service backed workflows must be exercised after credentials are configured.
