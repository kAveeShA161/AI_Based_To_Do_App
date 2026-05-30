# TaskFlow Backend

Express API server for the AI Based To Do App. It handles authentication, user profile data, task CRUD operations, dashboard metrics, mood history, and AI-generated planning.

## Tech Stack

- Node.js with ES modules.
- Express 5 for HTTP routing.
- MongoDB with Mongoose 9 for persistence.
- JSON Web Tokens stored in HTTP-only cookies.
- bcryptjs for password hashing.
- Nodemailer using Brevo SMTP relay for account and OTP emails.
- Google Generative AI SDK for task-plan generation.

## Project Structure

```text
Backend/
+-- config/
|   +-- mongodb.js
|   +-- nodemailer.js
+-- controllers/
|   +-- aiController.js
|   +-- authController.js
|   +-- dashboardController.js
|   +-- taskController.js
|   +-- userController.js
+-- middleware/
|   +-- userAuth.js
+-- models/
|   +-- taskModel.js
|   +-- userModel.js
+-- Routes/
|   +-- aiRoutes.js
|   +-- authRoutes.js
|   +-- dashboardRoutes.js
|   +-- taskRoutes.js
|   +-- userRoutes.js
+-- .dockerignore
+-- Dockerfile
+-- package.json
+-- server.js
```

## Environment Variables

Create `Backend/.env`:

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

Important details:

- `MONGODB_URI` is combined with `/AI_Based_To_Do_App` in `config/mongodb.js`.
- `FRONTEND_URL` is used by CORS and must exactly match the frontend origin.
- `JWT_SECRET` signs the auth token stored in the `token` cookie.
- `NODE_ENV=production` enables secure cross-site cookies for HTTPS deployments.
- `GEMINI_MODEL` is optional; the default is `gemini-2.5-flash`.
- Docker Compose reads this file through `env_file`, so comments must start with `#`, not `//`.

## Setup

Install dependencies:

```bash
npm install
```

Start in development with nodemon:

```bash
npm run server
```

Start in production mode:

```bash
npm start
```

By default the server listens on `http://localhost:5001`.

## Docker

Build the backend image from the repository root:

```bash
docker build -t taskflow-backend ./Backend
```

Run the backend container directly:

```bash
docker run --rm -p 5001:5001 --env-file Backend/.env taskflow-backend
```

The recommended full-app workflow is Docker Compose from the repository root:

```bash
docker compose up --build
```

Compose builds this backend image, loads `Backend/.env`, exposes the API on `http://localhost:5001`, and connects the frontend container to it through Docker's internal service name `backend`.

Stop the Compose stack:

```bash
docker compose down
```

## API Routes

### Health Check

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Confirms the server is running |

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Creates a user, hashes password, sets auth cookie, sends welcome email |
| `POST` | `/api/auth/login` | No | Validates credentials and sets auth cookie |
| `POST` | `/api/auth/logout` | No | Clears auth cookie |
| `POST` | `/api/auth/send-verify-otp` | Yes | Sends email verification OTP |
| `POST` | `/api/auth/verify-email` | Yes | Verifies account email using OTP |
| `POST` | `/api/auth/is-auth` | Yes | Confirms current session is authenticated |
| `POST` | `/api/auth/send-reset-otp` | No | Sends password reset OTP |
| `POST` | `/api/auth/reset-password` | No | Resets password after OTP validation |

### User

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/user/getUserData` | Yes | Returns authenticated user data |

### Tasks

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/task/create` | Yes | Creates a task |
| `GET` | `/api/task/all` | Yes | Lists tasks for the current user |
| `PUT` | `/api/task/update/:id` | Yes | Updates task fields or completion state |
| `DELETE` | `/api/task/delete/:id` | Yes | Deletes a task owned by the current user |
| `POST` | `/api/task/bulk-create` | Yes | Creates multiple tasks, used by AI planner output |

### Dashboard

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard` | Yes | Returns streaks, completion metrics, today's tasks, and mood |
| `GET` | `/api/dashboard/calendar-history` | Yes | Returns all tasks and mood history for calendar views |
| `POST` | `/api/dashboard/mood` | Yes | Saves or updates today's mood |

### AI Planner

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/ai/generate` | Yes | Uses Gemini to convert a goal into up to six short task steps |

## Data Models

### User

Stores identity, authentication support fields, email verification OTP, password reset OTP, focus streak counters, daily mood history, and today's mood.

### Task

Stores title, description, due date, priority, category, tags, completion status, completion date, owner reference, and timestamps. Indexes are defined for user/date and user/completion queries.

## Security Notes

- Passwords are hashed with bcrypt before storage.
- JWTs are stored in an HTTP-only cookie named `token`.
- Protected routes use `middleware/userAuth.js` to validate the token and attach the authenticated user ID to the request.
- CORS is configured for credentialed requests from `FRONTEND_URL`.
- In production, deploy the backend over HTTPS so secure cookies work correctly.
