# 🚀 Caremesh Platform — Local Run Guide

## Prerequisites

- **Node.js** v18+
- **pnpm** (required — do not use npm or yarn)
  ```bash
  npm install -g pnpm
  ```
  > [!TIP]
  > **Windows Users:** If you get an error that `pnpm` is not recognized, or if script execution is disabled on your system, you can use `npx pnpm` as a drop-in replacement (e.g., `npx pnpm run dev`), or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in PowerShell.

---

## 1. Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Key variables to configure in `.env.local`:

| Variable              | Description                          | Default                    |
|-----------------------|--------------------------------------|----------------------------|
| `PORT`                | API server port                      | `5000`                     |
| `DATABASE_URL`        | NeonDB PostgreSQL connection string  | *(set your own)*           |
| `JWT_SECRET`          | JWT signing secret                   | *(generate with openssl)*  |
| `JWT_REFRESH_SECRET`  | JWT refresh signing secret           | *(generate with openssl)*  |
| `CORS_ORIGIN`         | Allowed frontend origins             | `http://localhost:5173`    |
| `VITE_API_URL`        | API base URL for the frontend        | `http://localhost:5000`    |

Generate secrets:
```bash
openssl rand -base64 64
```

---

## 2. Install Dependencies

From the project root:

```bash
pnpm install
```

---

## 3. Run the Backend (API Server)

```bash
cd artifacts/api-server
pnpm run dev
```

This command will:
1. Set `NODE_ENV=development`
2. Generate Prisma client
3. Build the server
4. Start the API on **http://localhost:5000**

### Other Useful Backend Commands

| Command                   | Description                          |
|---------------------------|--------------------------------------|
| `pnpm run build`          | Build the server only                |
| `pnpm run start`          | Start the built server               |
| `pnpm run prisma:generate`| Regenerate Prisma client             |
| `pnpm run prisma:push`    | Push schema changes to the database  |
| `pnpm run prisma:migrate` | Run Prisma migrations                |
| `pnpm run prisma:studio`  | Open Prisma Studio (DB browser)      |

---

## 4. Run the Frontend (Web)

Open a **new terminal** and run:

```bash
cd artifacts/web
pnpm run dev
```

The frontend (Vite + React) will start at **http://localhost:5173**

### Other Useful Frontend Commands

| Command           | Description                        |
|-------------------|------------------------------------|
| `pnpm run build`  | Build for production               |
| `pnpm run serve`  | Preview the production build       |

---

## 5. Run Both Together (from project root)

You can run both services in parallel using two terminal tabs, or use a tool like `concurrently`:

**Terminal 1 — Backend:**
```bash
cd artifacts/api-server && pnpm run dev
```

**Terminal 2 — Frontend:**
```bash
cd artifacts/web && pnpm run dev
```

---

## 6. Default Admin Credentials

| Field    | Value                   |
|----------|-------------------------|
| Email    | `admin@northgate.nhs.uk`|
| Password | `Admin1234!`            |

---

## 7. Import Real Mumbai Area & Clinic Data

The file `MUMBAI_SEED.sql` contains **160 Areas** and **707 Clinics** extracted from `MUMBAI.xlsx`.

### Option A — MySQL / phpMyAdmin (pms2 database)
```bash
mysql -u root -p pms2 < MUMBAI_SEED.sql
```
Or import via phpMyAdmin → `pms2` → **Import** → select `MUMBAI_SEED.sql`.

### Option B — PostgreSQL / Prisma (production database)
```bash
cd scripts
npx ts-node seed-mumbai.ts
```
> Requires `TENANT_ID` in `seed-mumbai.ts` to match the real tenant `id` in your database.

---

## 8. Ports at a Glance

| Service    | URL                      |
|------------|--------------------------|
| Backend    | http://localhost:5000    |
| Frontend   | http://localhost:5173    |
| Prisma Studio | http://localhost:5555 |
