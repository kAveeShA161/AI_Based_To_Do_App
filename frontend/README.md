# TaskFlow Frontend

React client for the AI Based To Do App. It provides the browser UI for authentication, task management, dashboard analytics, calendar history, mood tracking, and AI-assisted task planning.

## Tech Stack

- React 19 with functional components and hooks.
- Vite 7 for development server and production builds.
- React Router 7 for client-side routing.
- Tailwind CSS 4 through the Vite plugin.
- Axios for API calls with cookie-based authentication.
- React Toastify for user feedback.
- ESLint 9 with React Hooks and React Refresh rules.

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing/home page |
| `/login` | User login |
| `/register` | User registration |
| `/email-verify` | Email OTP verification |
| `/password-reset` | Password reset flow |
| `/create-task` | Create a new task |
| `/my-tasks` | View, update, complete, and delete tasks |
| `/dashboard` | Productivity dashboard, today's tasks, mood, and calendar history |
| `/ai-planner` | Generate actionable tasks from a goal |

## Project Structure

```text
frontend/
+-- public/
|   +-- logo.png
|   +-- vite.svg
+-- src/
|   +-- assets/
|   +-- components/
|   +-- context/
|   |   +-- AppContext.jsx
|   +-- pages/
|   +-- App.jsx
|   +-- index.css
|   +-- main.jsx
+-- .dockerignore
+-- Dockerfile
+-- eslint.config.js
+-- nginx.conf
+-- package.json
+-- vite.config.js
```

## Environment Variables

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:5001
```

`VITE_BACKEND_URL` must match the backend server origin. The frontend sends credentialed requests to the API, so the backend `FRONTEND_URL` value must also match the frontend origin.

For Docker Compose, the frontend is served by Nginx and `/api` is proxied to the backend container. In that setup, `VITE_BACKEND_URL` can be empty so Axios calls use same-origin `/api` routes.

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Docker

Build the frontend image from the repository root:

```bash
docker build -t taskflow-frontend ./frontend
```

Run the frontend container directly:

```bash
docker run --rm -p 3000:80 taskflow-frontend
```

Open the frontend at:

```text
http://localhost:3000
```

For the complete app, use Docker Compose from the repository root:

```bash
docker compose up --build
```

Compose starts the frontend on `http://localhost:3000` and the backend on `http://localhost:5001`. The Nginx config in `nginx.conf` serves the Vite production build and proxies `/api` requests to the backend service.

Stop the Compose stack:

```bash
docker compose down
```

## API Integration

The app reads the backend URL from `import.meta.env.VITE_BACKEND_URL` in `src/context/AppContext.jsx`. Authentication state and user data are exposed through `AppContext`.

Main API areas used by the frontend:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/user/getUserData`
- `POST /api/task/create`
- `GET /api/task/all`
- `PUT /api/task/update/:id`
- `DELETE /api/task/delete/:id`
- `POST /api/task/bulk-create`
- `GET /api/dashboard`
- `GET /api/dashboard/calendar-history`
- `POST /api/dashboard/mood`
- `POST /api/ai/generate`

## Development Notes

- Keep API calls using `withCredentials: true` when authentication cookies are required.
- Vite is configured with a development proxy for `/api` to `http://localhost:5001`, but the application code currently uses `VITE_BACKEND_URL` directly.
- The Docker image uses Nginx instead of the Vite development server.
- Static images are stored in both `public/` and `src/assets/`; use `public/` for files referenced by URL and `src/assets/` for files imported by React modules.
