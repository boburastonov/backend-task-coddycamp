# API Documentation

Base URL:

```text
http://localhost:5000/api
```

Use JWT protected endpoints with:

```text
Authorization: Bearer <token>
```

## Auth

### POST `/auth/register`

Request:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "123456",
  "phone": "+998901234567",
  "telegramId": "123456789"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

## Profile

### GET `/users/me`

Protected.

### PUT `/users/me`

Protected.

Request:

```json
{
  "name": "Updated Name",
  "phone": "+998901234567",
  "telegramId": "123456789"
}
```

## Products

### GET `/products?page=1&limit=10`

Public.

### GET `/products/:id`

Public.

### POST `/products`

Admin only.

Request:

```json
{
  "title": "Premium Keyboard",
  "description": "Wireless keyboard",
  "price": 79.99,
  "stock": 12,
  "category": "Accessories",
  "isActive": true
}
```

### PUT `/products/:id`

Admin only.

### DELETE `/products/:id`

Admin only.

## Orders

### GET `/orders?page=1&limit=10`

Protected. Admin sees all orders, users see their own orders.

### GET `/orders/:id`

Protected.

### POST `/orders`

Protected.

Request:

```json
{
  "items": [
    {
      "product": "product-id",
      "quantity": 2
    }
  ],
  "deliveryAddress": "Tashkent",
  "note": "Call before delivery"
}
```

### PUT `/orders/:id`

Protected. Admin can update status. Users can update address and note.

Request:

```json
{
  "status": "accepted"
}
```

### DELETE `/orders/:id`

Protected.

## Admin

### GET `/admin/stats`

Admin only.

### GET `/admin/users`

Admin only.

### PATCH `/admin/users/:id/role`

Admin only. Promotes or demotes a web user.

Request:

```json
{
  "role": "admin"
}
```

### POST `/admin/broadcast`

Admin only. Sends message to Telegram bot subscribers.

Request:

```json
{
  "message": "New product launch today"
}
```

## Telegram Webhook

### POST `/telegram/webhook`

Used by Telegram in production webhook mode. The exact path is controlled by `TELEGRAM_WEBHOOK_PATH`.
