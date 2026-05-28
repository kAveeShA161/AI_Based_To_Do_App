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
+-- eslint.config.js
+-- package.json
+-- vite.config.js
```

## Environment Variables

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:5001
```

`VITE_BACKEND_URL` must match the backend server origin. The frontend sends credentialed requests to the API, so the backend `FRONTEND_URL` value must also match the frontend origin.

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
- Static images are stored in both `public/` and `src/assets/`; use `public/` for files referenced by URL and `src/assets/` for files imported by React modules.
