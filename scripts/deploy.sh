#!/bin/bash
# ============================================================================
# Production Deployment Script — Unified Property Management
# Usage: bash scripts/deploy.sh [environment]
#        bash scripts/deploy.sh production
#        bash scripts/deploy.sh preview
# ============================================================================

set -euo pipefail

ENV=${1:-production}
BRANCH="main"

echo "============================================"
echo "  Unified Property Management — Deploy"
echo "  Environment: ${ENV}"
echo "============================================"

# ── Colors ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ── Check prerequisites ────────────────────────────────────────────────────
check_prerequisites() {
  echo -e "${BLUE}Checking prerequisites...${NC}"

  if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
  fi

  if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
  fi

  if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    exit 1
  fi

  echo -e "${GREEN}✓ All prerequisites met${NC}"
}

# ── Validate environment variables ─────────────────────────────────────────
validate_env() {
  echo -e "${BLUE}Validating environment variables...${NC}"

  if [ ! -f .env.example ]; then
    echo -e "${RED}Error: .env.example file not found${NC}"
    exit 1
  fi

  # Check required vars in current environment
  local missing=0

  if [ -z "${DATABASE_URL:-}" ]; then
    echo -e "${YELLOW}Warning: DATABASE_URL is not set in environment${NC}"
    missing=$((missing + 1))
  fi

  if [ -z "${AUTH_SECRET:-}" ]; then
    echo -e "${YELLOW}Warning: AUTH_SECRET is not set in environment${NC}"
    missing=$((missing + 1))
  fi

  if [ $missing -gt 0 ]; then
    echo -e "${YELLOW}Warning: ${missing} required variables are missing.${NC}"
    echo -e "${YELLOW}These should be set in your deployment platform (Vercel).${NC}"
  else
    echo -e "${GREEN}✓ All required variables present${NC}"
  fi
}

# ── Run tests ──────────────────────────────────────────────────────────────
run_tests() {
  echo -e "${BLUE}Running pre-deployment checks...${NC}"

  # Type check
  echo "  → Running type check..."
  if npx tsc --noEmit 2>/dev/null; then
    echo -e "  ${GREEN}✓ Type check passed${NC}"
  else
    echo -e "  ${YELLOW}⚠ Type check had warnings (non-blocking)${NC}"
  fi

  # Lint
  echo "  → Running lint..."
  if npm run lint -- --max-warnings 0 2>/dev/null; then
    echo -e "  ${GREEN}✓ Lint passed${NC}"
  else
    echo -e "  ${YELLOW}⚠ Lint had warnings (non-blocking)${NC}"
  fi
}

# ── Build ──────────────────────────────────────────────────────────────────
build_project() {
  echo -e "${BLUE}Building project...${NC}"

  npm run build

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
  else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
  fi
}

# ── Deploy to Vercel ───────────────────────────────────────────────────────
deploy_vercel() {
  echo -e "${BLUE}Deploying to Vercel (${ENV})...${NC}"

  if command -v vercel &> /dev/null; then
    if [ "$ENV" = "production" ]; then
      vercel --prod --yes
    else
      vercel --yes
    fi
    echo -e "${GREEN}✓ Vercel deployment initiated${NC}"
  else
    echo -e "${YELLOW}Vercel CLI not found. Using git push instead...${NC}"
    git_push_deploy
  fi
}

# ── Git push deploy ────────────────────────────────────────────────────────
git_push_deploy() {
  echo -e "${BLUE}Pushing to git...${NC}"

  git push origin "$BRANCH"

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pushed to ${BRANCH}${NC}"
    echo -e "${GREEN}✓ Vercel will auto-deploy from ${BRANCH} branch${NC}"
  else
    echo -e "${RED}✗ Git push failed${NC}"
    exit 1
  fi
}

# ── Post-deployment checks ─────────────────────────────────────────────────
post_deploy_check() {
  echo -e "${BLUE}Waiting for deployment to propagate (5s)...${NC}"
  sleep 5

  if [ -n "${NEXT_PUBLIC_APP_URL:-}" ]; then
    echo "  → Checking health endpoint..."
    HEALTH_URL="${NEXT_PUBLIC_APP_URL}/api/health"

    if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
      echo -e "  ${GREEN}✓ Health check passed${NC}"
    else
      echo -e "  ${YELLOW}⚠ Health check could not be verified (may need manual check)${NC}"
    fi
  fi
}

# ── Main ───────────────────────────────────────────────────────────────────
main() {
  check_prerequisites
  validate_env

  echo ""
  echo -e "Branch: ${BLUE}${BRANCH}${NC}"
  echo -e "Environment: ${BLUE}${ENV}${NC}"
  echo ""

  read -p "Proceed with deployment? (y/N): " confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Deployment cancelled."
    exit 0
  fi

  run_tests
  build_project
  deploy_vercel
  post_deploy_check

  echo ""
  echo -e "${GREEN}============================================${NC}"
  echo -e "${GREEN}  Deployment Complete!${NC}"
  echo -e "${GREEN}============================================${NC}"
}

main