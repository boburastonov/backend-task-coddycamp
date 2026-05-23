# React + Express + MongoDB task app

This folder documents the separate full-stack task created from `Texnik Topshiriq.docx`.

## Stack

- Frontend: React + Vite + Tailwind CSS + Zustand
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt

## Structure

- `frontend/` - React application
- `backend/` - Express API
- `backend/src/models/` - `User`, `Project`, `Task`
- `backend/src/routes/` - auth, project and task routes
- `backend/src/middleware/` - auth, logger, error handlers
- `backend/src/controllers/` - business logic

## Run locally

1. Install dependencies
   - `cd backend && npm install`
   - `cd frontend && npm install`
2. Create env files
   - copy `backend/.env.example` to `backend/.env`
   - copy `frontend/.env.example` to `frontend/.env`
3. Start MongoDB locally
4. Run backend
   - `cd backend && npm run dev`
5. Run frontend
   - `cd frontend && npm run dev`

## Required endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Notes

- Resource GET routes are also protected so each user only sees their own data.
- Deleting a project also removes its related tasks.
- The sample domain is project and task management because the document did not define a specific business subject.
