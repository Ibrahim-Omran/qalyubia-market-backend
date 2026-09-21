# API quick reference

Base URL: http://localhost:4000/api

POST /auth/register
POST /auth/login
POST /auth/refresh
GET /auth/me [Bearer]
PUT /auth/profile [Bearer]

GET /categories

GET /ads
GET /ads/:id
POST /ads [Bearer]
GET /ads/my [Bearer]
PUT /ads/:id [Bearer]
DELETE /ads/:id [Bearer]
PATCH /ads/:id/sold [Bearer]

POST /favorites/:adId [Bearer]
DELETE /favorites/:adId [Bearer]
GET /favorites [Bearer]

GET /conversations [Bearer]
POST /conversations [Bearer]
GET /conversations/:id/messages [Bearer]

GET /notifications [Bearer]
PATCH /notifications/:id/read [Bearer]
PATCH /notifications/read-all [Bearer]

POST /payments/create [Bearer]
GET /payments/:id [Bearer]
POST /payments/webhook/paymob [Provider]

GET /admin/stats [Admin]
GET /admin/users [Admin]
GET /admin/ads [Admin]
PATCH /admin/ads/:id/approve [Admin]
PATCH /admin/ads/:id/reject [Admin]
