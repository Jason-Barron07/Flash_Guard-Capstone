# FlashGuard Student Handoff Guide

This repository contains the student system under test:

- Web application
- Mobile application (Expo for Android/iOS)
- API service
- SQL Server schema and seed scripts

## 1) Prerequisites

- Node.js 18+
- Docker Desktop (Compose enabled)
- SQL Server running on the host machine (default: localhost:1433)

## 2) First-Time Setup

1. Copy the environment template.

```bash
cp .env.example .env
```

2. Ensure SQL credentials in `.env` are valid for your local SQL Server.

3. Start everything (containers + DB seed + Expo interactive mobile runner).

```bash
npm run stack:up
```

The Expo terminal will prompt you to choose how to open the mobile app (Android emulator, web, etc.).

## 3) Service Endpoints

- Web app: http://localhost:3000
- Mobile-facing container UI: http://localhost:3001
- API base URL: http://localhost:4000
- API health check: http://localhost:4000/health

Notes:

- The Expo mobile app uses Android host mapping `10.0.2.2:4000` when running in an emulator.
- API and web/mobile containers are started via Docker Compose.

Container notes:

- Containers expose services on their internal container ports (the web and mobile images serve on port `80` inside the container).
- Docker Compose maps those container ports to host ports using the `WEB_PORT`, `MOBILE_PORT`, and `API_PORT` variables in `.env` (defaults: `WEB_PORT=3000`, `MOBILE_PORT=3001`, `API_PORT=4000`).
- When the stack starts you may see services listening on the container port (e.g. `:80`) in container logs; access them from your host using the mapped host ports above (for example `http://localhost:3000` for the web UI).
- Android emulators access the host machine via `10.0.2.2`, so mobile/emulator tests should target `http://10.0.2.2:${API_PORT}` or `http://10.0.2.2:${MOBILE_PORT}`.

## 4) Common Commands

- Start full stack and Expo prompt:

```bash
npm run stack:up
```

- Start containers and seed only (no Expo prompt):

```bash
npm run stack:up:containers
```

- Reset seed data:

```bash
npm run db:reset-seed
```

- View logs:

```bash
npm run stack:logs
```

- Stop and remove containers/volumes:

```bash
npm run stack:down
```

- API health check:

```bash
npm run api:health
```

## 5) API Endpoints (Core Student Flows)

- POST /auth/login
- POST /auth/register
- POST /auth/logout
- GET /accounts
- GET /accounts/:id/balance
- GET /transactions/history
- GET /transactions/pending
- POST /transactions/transfer
- POST /transactions/transfer/:id/authorize
- GET /alerts
- GET /health

## 6) Documentation Index

Project documentation lives in the `docs` folder:

- docs/Student-Quickstart.md
- docs/Offline-Runbook.md
- docs/Test-Strategy.md
- docs/RTM.md
- docs/Coverage-Analysis.md
- docs/Submission-Checklist.md

## 7) Troubleshooting

- SQL login failure: verify `DB_USER` and `DB_PASSWORD` in `.env` match a real SQL login on your host SQL Server.
- API unavailable: run `npm run stack:logs` and check the `api` service output.
- Android emulator cannot reach API: use `http://10.0.2.2:4000` from the app/emulator context.
