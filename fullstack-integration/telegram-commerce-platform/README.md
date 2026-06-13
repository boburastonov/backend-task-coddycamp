# Telegram Commerce Platform

Full Stack + Telegram Bot technical task implementation.

## Stack

- Frontend: React + Vite + Tailwind CSS + Zustand
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- Telegram Bot: Telegraf.js
- Deploy target: Netlify frontend + Render/Railway backend + MongoDB Atlas

## Features

- JWT register/login
- Password hashing with bcrypt
- Protected routes and token header handling
- Role-based admin dashboard
- Product CRUD
- Order CRUD
- User profile editing
- Telegram bot commands: `/start`, `/help`, `/info`, `/products`, `/items`, `/admin`, `/stats`, `/broadcast`, `/users`
- Telegram reply keyboard, inline keyboard and broadcast wizard scene
- Telegram notifications for new user registrations and new orders
- Admin stats and broadcast API
- Multi-admin role management from the admin dashboard
- Dark mode
- Polling-based dashboard refresh
- Helmet, rate limiting, CORS and JSON parser

## Project Structure

```text
telegram-commerce-platform/
  backend/
    src/
      bot/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
  frontend/
    src/
      components/
      lib/
      pages/
      store/
  docs/
```

## Local Setup

Install dependencies:

```powershell
cd telegram-commerce-platform
npm install
```

Create environment files:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Start MongoDB locally, then run backend:

```powershell
cd backend
npm run dev
```

Run frontend in another terminal:

```powershell
cd frontend
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

## Admin Access

The first registered web user automatically becomes `admin`. Later users become `user`.

Telegram bot admins are controlled by:

```env
TELEGRAM_ADMIN_IDS=123456789,987654321
```

## Telegram Bot

Development mode uses polling:

```env
TELEGRAM_MODE=polling
TELEGRAM_BOT_TOKEN=your_token
```

Production mode uses webhook:

```env
TELEGRAM_MODE=webhook
PUBLIC_URL=https://your-backend.onrender.com
TELEGRAM_WEBHOOK_PATH=/api/telegram/webhook
```

## Deploy Notes

- Frontend can be deployed to Netlify from `frontend/`.
- Backend can be deployed to Render or Railway from `backend/`.
- Use MongoDB Atlas for `MONGODB_URI`.
- Set `CLIENT_URL` to the deployed Netlify domain.
- Set `VITE_API_URL` to the deployed backend `/api` URL.
- Set Telegram webhook env values on the backend hosting platform.

## Documentation

- API docs: `docs/api.md`
- Deploy guide: `docs/deploy.md`
- Postman collection: `docs/postman_collection.json`
