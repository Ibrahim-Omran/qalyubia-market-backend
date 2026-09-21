# Qalyubia Market — Deployment Guide

## Architecture

- API: Render Web Service
- Database: Neon PostgreSQL
- Redis: Upstash Redis REST
- Realtime: Socket.IO on the same Render Web Service
- Payments: Paymob webhook

## Render

Build command:
```bash
npm install && npm run build
```
Start command:
```bash
npm run db:deploy && npm start
```
Health check: `/health`

The server binds to `0.0.0.0` and uses Render's `PORT`.

## Neon

Create a PostgreSQL database and copy its connection string into `DATABASE_URL`.

This starter repository has no Prisma migration history, so the first deployment uses `prisma db push`. For a larger production rollout, switch to versioned migrations and `prisma migrate deploy`.

## Upstash

Create a Redis database and set:
```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

The `/health` endpoint verifies Redis when configured.

## Flutter base URL

After Render deploys:
```text
https://YOUR-SERVICE.onrender.com/api
```

Swagger:
```text
https://YOUR-SERVICE.onrender.com/api/docs
```

OpenAPI JSON:
```text
https://YOUR-SERVICE.onrender.com/api/openapi.json
```

Health:
```text
https://YOUR-SERVICE.onrender.com/health
```

## Socket.IO

Use the Render origin, without `/api`:
```text
https://YOUR-SERVICE.onrender.com
```

Send the JWT in the Socket.IO auth payload.

## Environment variables

Required:
```text
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
CLIENT_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Paymob can be configured when the payment account is ready:
```text
PAYMOB_API_KEY
PAYMOB_INTEGRATION_ID
PAYMOB_IFRAME_ID
PAYMOB_HMAC_SECRET
```

## Production notes

- Never commit `.env` or secrets.
- Use HTTPS in `CLIENT_URL`.
- Verify Paymob HMAC/signature before marking a payment successful.
- Never trust a Flutter-side payment success flag or amount.
- Render free services can sleep when idle; the first request may be slower.
- Socket.IO clients should support reconnects.
- If scaling to multiple API instances, add a Socket.IO Redis adapter.
- Upstash is currently used for Redis connectivity/health; it is not yet required by the chat implementation.
