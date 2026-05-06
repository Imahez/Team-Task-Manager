# Team Task Manager

A full-stack project management and task tracking application built with React, Node.js, Express, and PostgreSQL.

## Features
- **Authentication**: JWT-based user login and registration.
- **Projects**: Create, manage, and assign projects to teams.
- **Tasks**: Kanban-style task management with statuses (To Do, In Progress, Done).
- **Dashboard**: Overview of project progress, recent activities, and team statistics.
- **Role-based Access**: Project managers and team members with varying permissions.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS (or plain CSS as configured)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (pg pool)
- **Deployment**: Railway (Nixpacks)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd team-task-manager
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up PostgreSQL Database**
   - Create a local PostgreSQL database.
   - Run the initial schema setup or allow the app to auto-migrate on startup.

4. **Environment Variables**
   - Copy `.env.example` to `.env` in the `server` directory and `client` directory (if applicable), or put a `.env` in the root depending on your local setup.
   - Example root `.env`:
     ```env
     PORT=5000
     DATABASE_URL=postgres://user:password@localhost:5432/task_manager
     JWT_SECRET=your_super_secret_jwt_key
     CLIENT_URL=http://localhost:5173
     NODE_ENV=development
     ```

5. **Start Development Servers**
   In two separate terminals:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

## Environment Variables

| Variable       | Description                                  | Default Value            |
|----------------|----------------------------------------------|--------------------------|
| `PORT`         | Port for the Express backend server          | `5000`                   |
| `DATABASE_URL` | PostgreSQL connection string                 | `postgres://...`         |
| `JWT_SECRET`   | Secret key for signing JSON Web Tokens       | `your_secret_key`        |
| `CLIENT_URL`   | URL of the frontend for CORS settings        | `http://localhost:5173`  |
| `NODE_ENV`     | Application environment (`development`/`production`) | `development`    |

## Railway Deployment Steps

This project is fully configured for zero-downtime deployment on [Railway](https://railway.app/).

1. **Push to GitHub**: Make sure all your latest changes are pushed to your main branch.
2. **New Railway Project**: Go to Railway dashboard → New Project → **Deploy from GitHub repo**.
3. **Add PostgreSQL Plugin**: In your new Railway project, click `+ New` → **Database** → **Add PostgreSQL**.
4. **Set Environment Variables**: In your application service, go to the Variables tab and add:
   - `JWT_SECRET`: your_secure_random_string
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-railway-app-url.up.railway.app`
5. **Database URL**: The `DATABASE_URL` is automatically injected by the Railway PostgreSQL plugin. The app will automatically run `migrate.js` to create the schema on first start.

## API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Users (`/api/users`)
- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current logged-in user

### Projects (`/api/projects`)
- `GET /api/projects` - Get all projects for user
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks (`/api/projects/:projectId/tasks`)
- `GET /api/projects/:projectId/tasks` - Get tasks for a project
- `POST /api/projects/:projectId/tasks` - Create a task
- `PUT /api/projects/:projectId/tasks/:taskId` - Update task status/details
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete a task

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard` - Get user-specific dashboard metrics

## Screenshots

*(Placeholder for UI screenshots - add later)*
- Dashboard View
- Kanban Board
- Project Details
