# Setup Instructions for the Sample App

Make sure you are in the **root directory** of the **expense-tracker** project before following these steps.

---

## Manual Setup

### 1. Database Setup

**1. Verify PostgreSQL**  
Ensure PostgreSQL is installed and running on its default port (`5432`). Also confirm that a `postgres` user with superuser privileges is available.

```bash
lsof -i :5432 # Check if PostgreSQL is listening
psql -U postgres -d postgres -c "\du" # Check if 'postgres' user exists and is a superuser
```

**2. Initialize the Database**  
Create a database namend `expense_tracker`:

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS expense_tracker;"
psql -U postgres -c "CREATE DATABASE expense_tracker;"
```

Navigate to the [db](db) folder and run the initialization script (this requires the previous step!):

```bash
cd db
psql -U postgres --dbname=expense_tracker \
  -v AUTH_USER=auth_user \
  -v APP_USER=app_user \
  -v AUTH_USER_PASSWORD="'secure-auth-password'" \
  -v APP_USER_PASSWORD="'secure-app-password'" \
  -f 01-init.sql
```

Apply Row-Level Security (RLS) policies:

```bash
psql -U postgres -d expense_tracker \
  -v AUTH_USER=auth_user \
  -v APP_USER=app_user \
  -f 02-rls.sql
```

Seed the database with test data:

```bash
psql -U postgres -d expense_tracker -f 03-seed.sql
```

**3. Connect and Test**

Connect to the `expense_tracker` database:

```bash
  psql -U postgres -d expense_tracker
```

Run SQL queries, for example:

```sql
  SELECT * FROM expenses;
```

Exit the `psql` shell:

```bash
\q
```

**4. Check Access Restrictions**

This application uses **Row-Level Security (RLS)** to restrict data access on a per-user basis — a core principle in multi-user systems where sensitive data (like expenses) must not be exposed to others.

- The `auth_user` role is used during login/signup. It has **very limited access**:

  - Can only `SELECT` and `INSERT` into the `users` table.
  - Cannot see passwords or other users' personal data.
  - This allows checking if an email is already registered during signup, without exposing anything else.

- The `app_user` role is used once the user is authenticated (i.e. in the actual app session).
  - It can only see **its own row** in the `users` table, limited to selected columns (`id`, `email`, `created_at`).
    This is enough to show basic account info, while keeping sensitive fields (like password hashes) inaccessible by design.
  - It can also only access **its own expenses** — and no one else's.
  - This isolation is enforced using **RLS policies** defined in `02-rls.sql`.

Using `auth_user` (should only be able to interact with the `users` table):

```bash
psql -U auth_user -d expense_tracker
```

Using `app_user` (access is restricted via RLS):

```bash
psql -U app_user -d expense_tracker
```

Manually set the current user context (required by the RLS policy):

```bash
SET app.current_user_id = '<some-id-from-users-table>';
```

After setting this context, `app_user` can:

- `SELECT` only their own row in the users table
- `SELECT`, `INSERT`, `UPDATE`, and `DELETE` only their own expenses

This structure protects user data from unauthorized access and simulates per-user data isolation without requiring separate schemas or databases.

In production, additional roles such as `admin` are typically introduced to allow full access for user management, moderation, or reporting tasks. The backend is already configured to assign roles and set the correct user context at runtime, so you don't need to worry about implementation details here.

---

## 2. Backend Setup

The backend is built with **FastAPI**, a modern Python framework with built-in support for interactive API docs via Swagger UI.

**1. Create a Python environment and install dependencies**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate # bash/zsh
# cmd.exe: .venv\Scripts\activate.bat
# PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**2. Run the development server**

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

- The FastAPI app will redirect from `"/"` to `"/api"`.
- Swagger UI is available at [http://0.0.0.0:5000/api/docs](http://0.0.0.0:5000/api/docs).

**3. Test login and authorization**  
Use the `POST /api/auth/login` endpoint with one of the following test users:

- pennywise@example.com → `c3nt5`
- buckaroo@example.com → `m0n3y`
- centsible@example.com → `d0ll4r`
  After logging in:
- Copy the **access_token** from the login response
- Click the Authorize button (top right in Swagger UI) and paste only the token value — no prefix.
- When making manual API requests (e.g. `GET /api/expenses`), include the token like this:
  ```
  authorization: Bearer <token>
  ```

---

## 3. Frontend Setup

**1. Check Node.js version**  
Ensure that **Node.js v23.x** is installed:

```bash
     node --version
```

**2. Install dependencies and start the development server**  
Navigate to the [`frontend`](/frontend/) folder, install dependencies, run the app:

```bash
     cd frontend
     npm install
     npm run dev
```

The frontend will be accessible at [http://localhost:5173/auth](http://localhost:5173/auth).

---

# 4. Full-Stack Docker Setup

To run the entire stack (PostgreSQL, backend, and frontend) using Docker, make sure you're in the **project root directory** and run:

```bash
docker compose up --build
```

That's it! You now have the full sample app running — either manually (via local setup) or through Docker for a one-command launch.
