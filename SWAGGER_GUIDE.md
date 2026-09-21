# Qalyubia Market — Swagger/OpenAPI Guide

## Swagger UI

```text
http://localhost:4000/api/docs
```

## Raw OpenAPI

```text
http://localhost:4000/api/openapi.json
```

## Authentication

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

Get a token from:

```http
POST /api/auth/login
```

or:

```http
POST /api/auth/register
```

### Standard response envelope

Success:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error description"
}
```

## API groups

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### Categories

- `GET /api/categories`

### Ads

- `GET /api/ads`
- `GET /api/ads/:id`
- `POST /api/ads`
- `GET /api/ads/my`
- `PUT /api/ads/:id`
- `DELETE /api/ads/:id`
- `PATCH /api/ads/:id/sold`

### Favorites

- `GET /api/favorites`
- `POST /api/favorites/:adId`
- `DELETE /api/favorites/:adId`

### Chat

- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:id/messages`

### Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

### Payments

- `POST /api/payments/create`
- `GET /api/payments/:id`
- `POST /api/payments/webhook/paymob`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/ads`
- `PATCH /api/admin/ads/:id/approve`
- `PATCH /api/admin/ads/:id/reject`

## Flutter integration example

```dart
final response = await dio.get(
  '/api/ads',
  queryParameters: {
    'search': search,
    'categoryId': categoryId,
    'minPrice': minPrice,
    'maxPrice': maxPrice,
    'sort': 'latest',
    'page': 1,
    'limit': 20,
  },
);
```

For protected requests:

```dart
dio.options.headers['Authorization'] = 'Bearer $accessToken';
```

## Payment security

The publishing fee is controlled by the backend:

```text
PUBLISHING_FEE_EGP=50
```

Do not send an amount from Flutter and do not accept a Flutter-side success flag.

Only the verified provider webhook may transition:

```text
Payment: PENDING -> SUCCESS
Ad: PENDING_PAYMENT -> ACTIVE
```

## Production checklist

- Replace `https://api.example.com` in OpenAPI with the real API domain.
- Use HTTPS.
- Rotate JWT secrets.
- Configure real Paymob credentials.
- Implement and verify Paymob HMAC/signature.
- Configure real image storage.
- Configure CORS for the Flutter/web clients.
- Add monitoring and database backups.
- Use Redis when scaling Socket.IO across multiple instances.
