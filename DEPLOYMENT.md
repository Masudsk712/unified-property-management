# 🚀 Deployment Guide — Unified Property Management

This guide covers deploying the **Unified Property Management** application to production using **Vercel** (hosting), **MongoDB Atlas** (database), and **Cloudinary** (image hosting).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Cloudinary Setup (Image Hosting)](#cloudinary-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Environment Variables](#environment-variables)
6. [Production Checklist](#production-checklist)
7. [Health Monitoring](#health-monitoring)
8. [Common Deployment Fixes](#common-deployment-fixes)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Architecture Overview](#architecture-overview)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] **Node.js 18+** installed locally
- [ ] **npm** installed
- [ ] **GitHub account** with repository pushed
- [ ] **Vercel account** (free tier works) — [sign up](https://vercel.com/signup)
- [ ] **MongoDB Atlas account** (free tier works) — [sign up](https://www.mongodb.com/atlas/database)
- [ ] **Cloudinary account** (free tier works) — [sign up](https://cloudinary.com/users/register_free)

---

## MongoDB Atlas Setup

### Step 1: Create a Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and sign in.
2. Click **"Build a Cluster"** or **"Create"**.
3. Choose the **FREE** tier (M0 Sandbox) — sufficient for starter projects.
4. Select a cloud provider and region closest to your users:
   - For India: **Mumbai (ap-south-1)** on AWS
   - For US: **Oregon (us-west-2)** or **Virginia (us-east-1)** on AWS
   - For Europe: **Frankfurt (eu-central-1)** on AWS
5. Name your cluster (e.g., `unified-property-mgmt`) and click **"Create Cluster"**.
6. Wait 1-3 minutes for the cluster to provision.

### Step 2: Configure Database Access

1. In the left sidebar, go to **Database Access** under SECURITY.
2. Click **"Add New Database User"**.
3. Choose **Password** authentication method.
4. Fill in:
   - **Username**: `propertypro-admin` (or your choice)
   - **Password**: Generate a strong password (use a password manager)
   - **Database User Privileges**: Select **"Atlas admin"** (or at minimum "Read and write to any database")
5. Click **"Add User"**.
6. **IMPORTANT**: Save the username and password — you'll need them for the connection string.

### Step 3: Configure Network Access

1. In the left sidebar, go to **Network Access** under SECURITY.
2. Click **"Add IP Address"**.
3. For initial setup, click **"Allow Access from Anywhere"** (0.0.0.0/0).
   > ⚠️ For production, restrict this to Vercel's IP ranges. Vercel's IP ranges are dynamic, but you can restrict to your office IP for admin access.
4. Click **"Confirm"**.

### Step 4: Get Connection String

1. Go to **Database** → **Clusters** in the left sidebar.
2. Click **"Connect"** on your cluster.
3. Choose **"Connect your application"** → **"Drivers"**.
4. Driver: **Node.js** | Version: **5.5 or later**.
5. Copy the connection string. It looks like:

   ```
   mongodb+srv://propertypro-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. Replace `<password>` with your actual password.
7. Add the database name after `mongodb.net/`:

   ```
   mongodb+srv://propertypro-admin:<password>@cluster0.xxxxx.mongodb.net/unified-property-management?retryWrites=true&w=majority
   ```

   > 🔑 The database name `unified-property-management` will be auto-created by Prisma on first push.

### Step 5: Test Connection Locally

```bash
# Paste your connection string in .env
DATABASE_URL="mongodb+srv://propertypro-admin:<password>@cluster0.xxxxx.mongodb.net/unified-property-management?retryWrites=true&w=majority"

# Generate Prisma client and push schema
npm run prisma:generate
npm run prisma:push

# Test the database
node -e "import('./src/lib/prisma.js').then(m => m.testDatabaseConnection().then(console.log))"
```

Expected output: `true`

### MongoDB Atlas Best Practices

| Practice | Description |
|---|---|
| **Use M10+ for production** | M0 has limited connections (500) and storage (512 MB) |
| **Enable backups** | Atlas → Backup → Enable continuous backups |
| **Set alerts** | Atlas → Alerts → Configure CPU/Memory/Disk alerts |
| **Use connection pooling** | Already configured in `src/lib/prisma.ts` |
| **Monitor performance** | Atlas → Metrics → View slow queries |

---

## Cloudinary Setup (Image Hosting)

### Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com) and sign up (free tier: 25 GB storage, 25 GB bandwidth/month).
2. After signup, you'll land on the **Dashboard**.

### Step 2: Get API Credentials

1. On the Dashboard, find your:
   - **Cloud Name**: e.g., `dxxxxxx`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `aBcDeFgHiJkLmNoPqRsTuVwXyZ` (hidden by default, click reveal)

### Step 3: Configure Environment Variables

Add these to your `.env` (local) and Vercel environment variables:

```env
CLOUDINARY_CLOUD_NAME="dxxxxxx"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="aBcDeFgHiJkLmNoPqRsTuVwXyZ"
```

### Step 4: Create Upload Presets (Recommended)

1. In Cloudinary Dashboard → **Settings** → **Upload**.
2. Scroll to **Upload presets** → **Add upload preset**.
3. Configure:
   - **Preset name**: `propertypro_upload`
   - **Signing Mode**: `Signed` (recommended for security)
   - **Folder**: `propertypro/`
   - **Access mode**: `Public`
   - **Transformation**: Optional auto-quality, auto-format
4. Click **Save**.
5. Add the preset name to your environment:

```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="propertypro_upload"
```

### Step 5: Configure CORS (if uploading from frontend)

1. Cloudinary → **Settings** → **Security**.
2. Under **Allowed CORS origins**, add your domains:
   - `http://localhost:3000`
   - `https://your-app.vercel.app`
   - `https://your-custom-domain.com`

### Cloudinary Best Practices

| Practice | Description |
|---|---|
| **Use transformations** | Auto-resize images: `w_800,c_limit,q_auto` |
| **Enable lazy loading** | Already configured via `next/image` |
| **Use folders** | Organize: `propertypro/properties/`, `propertypro/avatars/` |
| **Monitor usage** | Cloudinary Dashboard → Usage |
| **Set storage limits** | Settings → Upload → Storage quota |

---

## Vercel Deployment

### Option 1: Deploy via Git (Recommended)

#### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### Step 2: Import Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`unified-property-management`).
4. Click **"Import"**.

#### Step 3: Configure Project

1. **Framework Preset**: Should auto-detect as **Next.js**.
2. **Root Directory**: `./` (default).
3. **Build Command**: `npm run build` (auto-detected).
4. **Output Directory**: `.next` (auto-detected).
5. **Install Command**: `npm install` (auto-detected).

#### Step 4: Set Environment Variables

In the Vercel project settings, add ALL environment variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your MongoDB Atlas connection string |
| `AUTH_SECRET` | Generate with `openssl rand -hex 32` |
| `AUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `AUTH_GOOGLE_ID` | (optional) Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | (optional) Google OAuth client secret |
| `AUTH_GITHUB_ID` | (optional) GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | (optional) GitHub OAuth client secret |

#### Step 5: Deploy

1. Click **"Deploy"**.
2. Wait for the build to complete (usually 2-5 minutes).
3. Once deployed, Vercel provides a URL like `https://unified-property-management.vercel.app`.

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy to production
vercel --prod
```

### Option 3: Deploy via Script

**On macOS/Linux (Git Bash also works on Windows):**
```bash
bash scripts/deploy.sh production
```

**On Windows PowerShell:**
```powershell
.\scripts\deploy.ps1 -Environment production
```

### Post-Deployment: Push Database Schema

```bash
# Ensure DATABASE_URL is set to your Atlas connection
npm run prisma:generate
npm run prisma:push

# Optional: Seed the database
npm run prisma:seed
```

### Configure Custom Domain (Optional)

1. Vercel Dashboard → Your Project → **Settings** → **Domains**.
2. Add your custom domain (e.g., `app.yourdomain.com`).
3. Follow the DNS configuration instructions.
4. After DNS propagates (can take up to 48 hours), SSL is auto-provisioned.

---

## Environment Variables

### Complete Reference

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | ✅ Yes | MongoDB Atlas connection string | `mongodb+srv://...` |
| `AUTH_SECRET` | ✅ Yes | NextAuth secret (64-char hex) | Generate with `openssl rand -hex 32` |
| `AUTH_URL` | ✅ Yes | Your app's production URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Public-facing app URL | `https://your-app.vercel.app` |
| `NODE_ENV` | ✅ Yes | Environment mode | `production` |
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes | Cloudinary cloud name | `dxxxxxx` |
| `CLOUDINARY_API_KEY` | ✅ Yes | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Cloudinary API secret | `aBcDeF...` |
| `AUTH_GOOGLE_ID` | ❌ No | Google OAuth client ID | From Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | ❌ No | Google OAuth client secret | From Google Cloud Console |
| `AUTH_GITHUB_ID` | ❌ No | GitHub OAuth client ID | From GitHub Developer Settings |
| `AUTH_GITHUB_SECRET` | ❌ No | GitHub OAuth client secret | From GitHub Developer Settings |
| `LOG_LEVEL` | ❌ No | Logging level (debug/info/warn/error) | `info` (default in prod) |
| `PORT` | ❌ No | Server port | `3000` (default) |
| `VERCEL_GIT_COMMIT_SHA` | Auto | Set by Vercel automatically | N/A |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ❌ No | Upload preset name | `propertypro_upload` |

### Generating AUTH_SECRET

**On macOS/Linux:**
```bash
openssl rand -hex 32
```

**On Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

**Online**: Use [randomkeygen.com](https://randomkeygen.com/) → CodeIgniter Encryption Keys.

---

## Production Checklist

### Pre-Deployment

- [ ] All environment variables are set in Vercel
- [ ] `.env.example` is up to date with all required variables
- [ ] `AUTH_SECRET` is a strong random string (NOT from `.env`)
- [ ] MongoDB Atlas IP whitelist configured (0.0.0.0/0 for initial setup)
- [ ] Cloudinary API credentials are valid
- [ ] Database schema is pushed: `npm run prisma:push`
- [ ] All code is committed and pushed to GitHub

### Build Verification

- [ ] Vercel build completes without errors
- [ ] `npm run build` passes locally with production env vars
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Prisma client generated successfully
- [ ] No `.env` file with secrets committed to git

### Post-Deployment

- [ ] Health check endpoint returns 200: `GET /api/health`
- [ ] Homepage loads without errors
- [ ] Login/Register functionality works
- [ ] Image uploads work (Cloudinary)
- [ ] Database reads/writes work
- [ ] SSL/HTTPS is working
- [ ] Custom domain configured (if applicable)
- [ ] Security headers present (check with browser DevTools)
- [ ] CSP doesn't block any legitimate resources

### Security

- [ ] `X-Powered-By` header is removed
- [ ] CSP header is present and restrictive
- [ ] `Strict-Transport-Security` header is set
- [ ] `X-Frame-Options: DENY` is set
- [ ] All API routes have proper authentication
- [ ] Rate limiting is active on auth endpoints
- [ ] MongoDB user has minimum required privileges
- [ ] Cloudinary upload presets are signed (not unsigned)

### Monitoring

- [ ] Health check endpoint is monitored (Vercel Cron pings every 5 minutes)
- [ ] Error tracking/logging is configured
- [ ] MongoDB Atlas alerts are set up
- [ ] Know how to view Vercel logs: `vercel logs`
- [ ] Know how to view MongoDB Atlas logs

---

## Health Monitoring

### Health Check Endpoint

```
GET /api/health
```

**Response (200 — Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "a8288043",
  "services": {
    "database": {
      "status": "connected",
      "latency": 12
    },
    "memory": {
      "used": "128 MB",
      "total": "256 MB",
      "percent": 50
    }
  }
}
```

**Response (503 — Unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 100,
  "environment": "production",
  "version": "a8288043",
  "services": {
    "database": {
      "status": "disconnected"
    },
    "memory": {
      "used": "N/A",
      "total": "N/A",
      "percent": 0
    }
  }
}
```

### Automated Health Checks

The `vercel.json` is configured to ping `/api/health` every 5 minutes via Vercel Cron Jobs. This keeps the serverless functions warm and provides uptime data.

### External Monitoring (Recommended)

| Service | Free Tier | Features |
|---|---|---|
| [UptimeRobot](https://uptimerobot.com) | 50 monitors, 5-min intervals | Status page, alerts |
| [Better Stack](https://betterstack.com) | 10 monitors, 3-min intervals | Beautiful dashboards |
| [Checkly](https://www.checklyhq.com) | 50k checks/month | API + browser checks |

---

## Common Deployment Fixes

### Issue: Build fails with "Cannot find module '@prisma/client'"

**Cause:** Prisma client not generated before or during build.

**Fix:**
```bash
# Ensure postinstall script runs
npm run postinstall

# Or manually
npm run prisma:generate

# Verify it's in package.json:
# "postinstall": "prisma generate"
```

### Issue: "MongoServerSelectionError" / Cannot connect to database

**Cause:** MongoDB Atlas connection string is wrong, IP not whitelisted, or network issue.

**Fix:**
1. Verify the connection string format:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
2. Check Network Access in Atlas → Add `0.0.0.0/0` temporarily.
3. Verify username/password in Database Access.
4. Check if cluster is running (Atlas Dashboard → Clusters).
5. Test connection locally first:
   ```bash
   mongosh "mongodb+srv://<username>:<password>@<cluster>.mongodb.net"
   ```

### Issue: "INVALID_AUTH_SECRET" / NextAuth error

**Cause:** AUTH_SECRET not set or too short.

**Fix:**
1. Generate a proper 64-character hex string:
   ```bash
   openssl rand -hex 32
   ```
2. Set it in Vercel environment variables.
3. Redeploy.

### Issue: Images not loading / Cloudinary errors

**Cause:** Missing or incorrect Cloudinary credentials.

**Fix:**
1. Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
2. Check Cloudinary Dashboard → your env vars match.
3. If using upload presets, verify the preset name.
4. Check CORS settings in Cloudinary → Settings → Security.

### Issue: 504 Gateway Timeout on API routes

**Cause:** Serverless function timeout (default is 10s on free tier, 30s configured in vercel.json).

**Fix:**
1. Check if the route is making slow database queries.
2. Optimize the query (add indexes, reduce returned fields).
3. Increase timeout in `vercel.json` (max 60s on Pro):
   ```json
   "functions": {
     "src/app/api/**/*.ts": {
       "maxDuration": 60
     }
   }
   ```
4. For long-running tasks, use a background job pattern.

### Issue: Prisma "Too many connections"

**Cause:** Connection pooling not working correctly in serverless environment.

**Fix (already configured in `src/lib/prisma.ts`):**
- The Prisma client is a singleton (cached on `globalThis`).
- Connection pooling is enabled.
- If issues persist, reduce `connection_limit` in the connection string:
  ```
  ?retryWrites=true&w=majority&maxPoolSize=10
  ```

### Issue: CSP blocking scripts/styles

**Cause:** Content Security Policy is too restrictive.

**Fix:**
1. Check browser console for CSP violation errors.
2. Update CSP in `src/middleware.ts` to allow the required sources.
3. Common additions:
   - Add CDN domains for scripts/styles
   - Add Cloudinary domains for images: `img-src ... https://res.cloudinary.com`
   - Add third-party API domains for `connect-src`

### Issue: Environment variable changes not taking effect

**Cause:** Vercel caches env vars at build time. Next.js `NEXT_PUBLIC_*` vars are inlined at build.

**Fix:**
1. After changing env vars in Vercel, **redeploy** (not just restart).
2. `NEXT_PUBLIC_*` variables are baked into the client bundle at build time — they require a full redeploy.
3. Server-side variables (non-`NEXT_PUBLIC_*`) take effect on next cold start.

### Issue: Socket.IO not working in production

**Cause:** Vercel doesn't support WebSocket connections natively on serverless functions.

**Solutions:**
1. **Option A (Free):** Use a separate Socket.IO server (e.g., Railway, Render, Fly.io) for real-time features.
2. **Option B (Paid):** Vercel Pro supports WebSocket on Edge Functions.
3. **Option C:** Use Vercel's built-in real-time features or switch to polling for critical real-time data.
4. The `server.ts` file is provided for self-hosted deployments where you need WebSocket support.

---

## CI/CD Pipeline

### GitHub + Vercel Auto-Deploy (Default)

Every push to `main` branch automatically triggers a Vercel deployment. This is the default behavior after connecting your GitHub repo to Vercel.

**Branch Mapping:**
| Git Branch | Vercel Environment | URL |
|---|---|---|
| `main` | Production | `https://your-app.vercel.app` |
| `staging` | Preview | `https://staging.your-app.vercel.app` |
| `feature/*` | Preview | Unique per-branch URL |

### Pull Request Previews

Every PR automatically gets a preview deployment. This is enabled by default in Vercel.

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Preview deploy
vercel

# Production deploy
vercel --prod
```

### GitHub Actions (Alternative)

For teams needing more control, use GitHub Actions instead of Vercel's auto-deploy:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Client Browser                        │
│              https://your-app.vercel.app                  │
└──────────────────┬───────────────────────────────────────┘
                   │ HTTPS
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   Vercel (Edge + Serverless)              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Next.js App (src/app)                               │ │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │ │
│  │  │  Pages   │  │ API Routes│  │  Middleware (Auth, │ │ │
│  │  │  (SSR)   │  │  (REST)   │  │  Security Headers) │ │ │
│  │  └──────────┘  └──────────┘  └────────────────────┘ │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────┐  ┌────────────────────────────┐ │
│  │  NextAuth/Auth.js   │  │  Prisma ORM               │ │
│  │  (Authentication)   │  │  (Database Access)         │ │
│  └─────────────────────┘  └───────────┬────────────────┘ │
└───────────────────────────────────────┼───────────────────┘
                                        │ TLS
                 ┌──────────────────────┼──────────────────┐
                 │                      ▼                  │
                 │     MongoDB Atlas (Database)             │
                 │     • Collections: users, properties,    │
                 │       tenants, maintenance, bookings     │
                 │     • Free M0: 512 MB, shared RAM        │
                 └─────────────────────────────────────────┘

                 ┌─────────────────────────────────────────┐
                 │     Cloudinary (Image CDN)               │
                 │     • Property images, avatars           │
                 │     • Auto-resize, auto-format           │
                 │     • Free: 25 GB storage, 25 GB BW/mo  │
                 └─────────────────────────────────────────┘
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **NextAuth/Auth.js Docs**: https://authjs.dev
- **Prisma Docs**: https://www.prisma.io/docs

---

*Last updated: 2026-05-27*  
*Project: Unified Property Management v1.0.0*