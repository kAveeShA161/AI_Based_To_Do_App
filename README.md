# AI Based To Do App

A full-stack MERN task management application with authentication, task planning, dashboard analytics, mood tracking, calendar history, and AI-assisted plan generation.

The project is split into two independently runnable applications:

- `frontend/` - React 19 + Vite client application.
- `Backend/` - Express 5 + MongoDB API server.

## Live Application

The application is deployed and available at:

[`https://ai-based-to-do-app.vercel.app/`](https://ai-based-to-do-app.vercel.app/)

Current production setup:

- Frontend: deployed on Vercel.
- Backend: deployed on AWS Lambda.
- Database: hosted on MongoDB Atlas.

## Features

- User registration, login, logout, email verification, and password reset flows.
- JWT authentication stored in an HTTP-only cookie.
- Task creation, listing, updating, completion tracking, deletion, and bulk task creation.
- Dashboard metrics for focus streaks, completion rate, total tasks, completed tasks, and today's tasks.
- Daily mood tracking with calendar history.
- AI planner that converts a user goal into up to six actionable tasks using Google Gemini.
- Responsive client UI built with React Router, Axios, Tailwind CSS, and React Toastify.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Tailwind CSS 4, Axios |
| Backend | Node.js, Express 5, Mongoose 9, JWT, bcryptjs, cookie-parser, CORS |
| Database | MongoDB Atlas |
| Email | Nodemailer with Brevo SMTP relay |
| AI | Google Generative AI SDK |
| Deployment | Vercel, AWS Lambda |
| Containers | Docker, Docker Compose, Nginx |

## Repository Structure

```text
.
+-- Backend/
|   +-- config/
|   +-- controllers/
|   +-- middleware/
|   +-- models/
|   +-- Routes/
|   +-- Dockerfile
|   +-- package.json
|   +-- server.js
+-- frontend/
|   +-- public/
|   +-- src/
|   |   +-- assets/
|   |   +-- components/
|   |   +-- context/
|   |   +-- pages/
|   +-- Dockerfile
|   +-- nginx.conf
|   +-- package.json
|   +-- vite.config.js
+-- docs/
|   +-- screenshots/
+-- docker-compose.yml
+-- README.md
```

## Prerequisites

- Node.js 20 or newer is recommended.
- npm.
- MongoDB connection string, either local MongoDB or MongoDB Atlas.
- Brevo SMTP credentials for email delivery.
- Google Gemini API key for AI planning.
- Docker Desktop if you want to run the containerized application.

## Screenshots

| Page | Screenshot |
| --- | --- |
| Login | <img width="1917" height="856" alt="image" src="https://github.com/user-attachments/assets/c020bf40-3470-4aef-a3d4-b122554218d4" /> |
| Dashboard | <img width="1858" height="850" alt="image" src="https://github.com/user-attachments/assets/29d2f6d5-f737-4b06-bd5c-b772b6861c9a" /> |
| Task Planner | <img width="1898" height="847" alt="image" src="https://github.com/user-attachments/assets/0cbe0403-31c5-4a5d-86be-d6509b1c90c8" /> |
| History Calendar | <img width="1898" height="838" alt="image" src="https://github.com/user-attachments/assets/c8d26946-d964-47e2-b16b-e796a69f2196" /> |
| Monthly Stats | <img width="1898" height="840" alt="image" src="https://github.com/user-attachments/assets/c4b09fcd-2f3c-4899-9c42-789b110d3fa6" /> |
| AI Task Planner | <img width="1898" height="848" alt="image" src="https://github.com/user-attachments/assets/9b4573ec-fa7d-4c6f-97ff-f89aa6efbd15" /> |


Example Markdown after adding an image:

```md
![Dashboard](docs/screenshots/dashboard.png)
```

## Environment Variables

Create separate `.env` files inside `Backend/` and `frontend/`.

Backend:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
SMTP_USER=your_brevo_smtp_user
SMTP_PASSWORD=your_brevo_smtp_password
SENDER_EMAIL=no-reply@example.com
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Frontend:

```env
VITE_BACKEND_URL=http://localhost:5001
```

The backend appends `/AI_Based_To_Do_App` to `MONGODB_URI`, so the URI should point to the MongoDB server or cluster base path.

For Docker Compose, the frontend container is served by Nginx and proxies `/api` to the backend container. You can leave `VITE_BACKEND_URL` empty for the Docker build so requests use the same origin.

## Local Development

Install and run the backend:

```bash
cd Backend
npm install
npm run server
```

Install and run the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`

## Docker

The easiest way to run the full application in containers is Docker Compose from the repository root:

```bash
docker compose up --build
```

Open the app at:

```text
http://localhost:3000
```

Compose starts:

- Frontend: Nginx container on `http://localhost:3000`
- Backend API: Node/Express container on `http://localhost:5001`

Stop the containers:

```bash
docker compose down
```

Rebuild after Dockerfile or dependency changes:

```bash
docker compose build --no-cache
docker compose up
```

You can also build each image separately:

```bash
docker build -t taskflow-backend ./Backend
docker build -t taskflow-frontend ./frontend
```

The backend service reads `Backend/.env` through `env_file`, so that file must use standard `.env` syntax. Use `#` for comments, not `//`.

## Production Notes

- The live frontend is hosted on Vercel at `https://ai-based-to-do-app.vercel.app/`.
- The production backend is hosted on AWS Lambda.
- Production data is stored in MongoDB Atlas.
- Set `NODE_ENV=production` on the backend when deployed behind HTTPS. Authentication cookies will then use `secure: true` and `sameSite: none`.
- Set `FRONTEND_URL` to the deployed frontend origin so CORS accepts credentialed requests.
- Set `VITE_BACKEND_URL` to the deployed backend API origin before building the frontend.
- Use a strong `JWT_SECRET` and never commit real `.env` files.

## Documentation

- Frontend details: [`frontend/README.md`](frontend/README.md)
- Backend details: [`Backend/README.md`](Backend/README.md)
- Deployment guide: [`DEPLOYMENT.md`](DEPLOYMENT.md)
