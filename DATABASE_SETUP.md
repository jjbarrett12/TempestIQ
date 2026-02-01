# Database setup

The seed and sign-in need a running PostgreSQL database. Your `.env` must have `DATABASE_URL` pointing at it.

## Option A: Supabase (hosted, no local install)

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In the dashboard: **Settings → Database**.
3. Under **Connection string**, choose **URI** and copy it. It looks like:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with the database password you set for the project.
5. Put it in your `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```
6. Apply the schema (first time only):
   ```bash
   npx prisma db push
   ```
   Or, if you use migrations:
   ```bash
   npx prisma migrate deploy
   ```
7. Run the seed:
   ```bash
   npm run db:seed
   ```

## Option B: PostgreSQL on your machine

### Using Docker

```bash
docker run -d --name tempestiq-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=roofalert postgres:15
```

Then in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/roofalert"
```

### Using a local PostgreSQL install (Windows)

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/) and remember the password you set for the `postgres` user.
2. Create a database (e.g. in pgAdmin or `psql`):
   ```sql
   CREATE DATABASE roofalert;
   ```
3. In `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/roofalert"
   ```

### Then run Prisma + seed

```bash
npx prisma db push
npm run db:seed
```

---

**Error: "Can't reach database server at localhost:5432"**

- Your `DATABASE_URL` is pointing at `localhost:5432`, but nothing is listening there.
- **Fix:** Either start PostgreSQL locally (Docker or installed server) **or** switch to a hosted DB (e.g. Supabase) and set `DATABASE_URL` to that connection string.
