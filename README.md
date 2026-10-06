# To-do app with login

A full-stack to-do list. Each user registers with a username and password and sees only their own tasks. They can add, complete and delete tasks.

**Stack:** Next.js (front end + API routes), SQLite via `@libsql/client`, bcrypt password hashing, signed httpOnly session cookie, Vitest tests.

## The three layers

1. **Front end** (`app/page.js`): a React page that shows a login/register form or the task list, and calls the API with `fetch`.
2. **API routes** (`app/api/...`):
   - `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/me`
   - `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`

   Each task route reads the user from the session cookie. It never trusts a user ID sent by the browser.
3. **Database** (`lib/db.js`):
   - `users(id, username UNIQUE, password_hash, created_at)`
   - `tasks(id, user_id → users.id, title, done, created_at)`

**How a request travels:** clicking Delete sends `DELETE /api/tasks/5` with the session cookie. The route verifies the cookie to get the user ID, then runs `DELETE FROM tasks WHERE id = 5 AND user_id = <you>`. If the task belongs to someone else, no row matches, and the API returns 404.

## Security notes

- Passwords are hashed with bcrypt. Plain passwords are never stored.
- `.env*` files and `*.db` files are in `.gitignore`.
- Empty or whitespace-only tasks are rejected.

## Run locally

```bash
npm install
npm test        # 11 tests: login + task list
npm run dev     # http://localhost:3000
```

Locally the app uses a file called `local.db`, which is created automatically.

## Deploy

On Vercel, set these environment variables: `SESSION_SECRET`, `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

## Production note

SQLite is fine for this demo. A plain SQLite file does not survive on Vercel's serverless platform, though, because its filesystem is temporary and not shared between instances. This deployment therefore uses Turso, which is hosted SQLite. A real production app would need a properly hosted, backed-up database such as Turso, Supabase/Postgres or Neon, plus extras like rate-limiting login attempts.
