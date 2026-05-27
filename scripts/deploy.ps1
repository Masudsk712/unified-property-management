# ============================================================================
# Production Deployment Script (Windows PowerShell) — Unified Property Management
# Usage: .\scripts\deploy.ps1 -Environment production
# ============================================================================

param(
    [string]$Environment = "production",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$envDisplay = $Environment.ToUpper()

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Unified Property Management — Deploy" -ForegroundColor Cyan
Write-Host "  Environment: $envDisplay" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Check prerequisites ────────────────────────────────────────────────────
Write-Host "Checking prerequisites..." -ForegroundColor Blue

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not installed" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: git is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "  OK All prerequisites met" -ForegroundColor Green

# ── Validate environment ───────────────────────────────────────────────────
Write-Host "Validating environment variables..." -ForegroundColor Blue

if (-not (Test-Path .env.example)) {
    Write-Host "Error: .env.example file not found" -ForegroundColor Red
    exit 1
}

Write-Host "  Check Required variables should be set in Vercel dashboard." -ForegroundColor Yellow

# ── Install dependencies ───────────────────────────────────────────────────
Write-Host "Installing dependencies..." -ForegroundColor Blue
npm ci --production=false
Write-Host "  OK Dependencies installed" -ForegroundColor Green

# ── Generate Prisma client ─────────────────────────────────────────────────
Write-Host "Generating Prisma client..." -ForegroundColor Blue
npm run prisma:generate
Write-Host "  OK Prisma client generated" -ForegroundColor Green

# ── Run lint (non-blocking) ────────────────────────────────────────────────
Write-Host "Running linter..." -ForegroundColor Blue
try {
    npm run lint 2>$null
    Write-Host "  OK Lint passed" -ForegroundColor Green
} catch {
    Write-Host "  WARN Lint had warnings (non-blocking)" -ForegroundColor Yellow
}

# ── Build ──────────────────────────────────────────────────────────────────
Write-Host "Building project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK Build successful" -ForegroundColor Green
} else {
    Write-Host "  FAIL Build failed" -ForegroundColor Red
    exit 1
}

# ── Deploy ─────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Branch: $Branch" -ForegroundColor Blue
Write-Host "Environment: $envDisplay" -ForegroundColor Blue
Write-Host ""

$confirm = Read-Host "Proceed with deployment? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Write-Host "Deploying to Vercel ($Environment)..." -ForegroundColor Blue
    if ($Environment -eq "production") {
        vercel --prod --yes
    } else {
        vercel --yes
    }
    Write-Host "  OK Vercel deployment initiated" -ForegroundColor Green
} else {
    Write-Host "Vercel CLI not found. Using git push instead..." -ForegroundColor Yellow
    Write-Host "Pushing to git ($Branch)..." -ForegroundColor Blue
    git push origin $Branch

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK Pushed to $Branch" -ForegroundColor Green
        Write-Host "  Vercel will auto-deploy from $Branch branch" -ForegroundColor Green
    } else {
        Write-Host "  FAIL Git push failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify deployment: curl <your-domain>/api/health"
Write-Host "  2. Check Vercel dashboard: https://vercel.com/dashboard"
Write-Host "  3. Monitor logs: vercel logs"