# Deploy Guide

## MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Add your backend host IP or allow access from your hosting provider.
4. Use the Atlas URI as `MONGODB_URI`.

Example:

```env
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/telegram_commerce_platform
```

## Backend on Render or Railway

Set these environment variables:

```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-netlify-site.netlify.app
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/telegram_commerce_platform
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_ADMIN_IDS=123456789,987654321
TELEGRAM_MODE=webhook
PUBLIC_URL=https://your-backend.onrender.com
TELEGRAM_WEBHOOK_PATH=/api/telegram/webhook
```

Build command:

```text
npm install
```

Start command:

```text
npm start
```

## Frontend on Netlify

Set these environment variables:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_TELEGRAM_BOT_URL=https://t.me/your_bot_username
```

Build settings:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

## Telegram Webhook

When `TELEGRAM_MODE=webhook`, the backend sets webhook automatically on startup:

```text
https://your-backend.onrender.com/api/telegram/webhook
```

If you change the backend URL, restart the backend service so the webhook is updated.
