#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$ROOT_DIR/twaire-backend"
FRONTEND_DIR="$ROOT_DIR/twaire-frontend"

if [ -t 1 ]; then
  BOLD=$'\033[1m'; CYAN=$'\033[36m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'; RESET=$'\033[0m'
else
  BOLD=""; CYAN=""; GREEN=""; YELLOW=""; RED=""; RESET=""
fi

info() { printf '\n%s[setup]%s %s%s\n' "${CYAN}${BOLD}" "$RESET" "${GREEN}$*${RESET}" ""; }
warn() { printf '\n%s[setup]%s %s%s\n' "${YELLOW}${BOLD}" "$RESET" "$*" ""; }
fail() { printf '\n%s[setup]%s %s%s\n' "${RED}${BOLD}" "$RESET" "$*" "" >&2; exit 1; }

version_ge() { printf '%s\n%s\n' "$1" "$2" | sort -V -C; }
require_cmd() { command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"; }

ensure_node() {
  require_cmd node
  local current minimum="20.19.0"
  current="$(node -p "process.versions.node")"
  version_ge "$minimum" "$current" || fail "Node.js $current is installed, but $minimum or newer is required."
  info "Node.js $current detected"
}

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then info "pnpm detected: $(pnpm -v)"; return; fi
  if command -v corepack >/dev/null 2>&1; then info "pnpm not found, enabling it through corepack"; corepack enable; corepack prepare pnpm@latest --activate
  else info "pnpm not found, installing globally with npm"; npm install -g pnpm; fi
  require_cmd pnpm; info "pnpm detected: $(pnpm -v)"
}

ensure_mongodb() {
  if command -v mongod >/dev/null 2>&1; then info "mongod detected: $(mongod --version | head -n 1)"; return; fi
  if command -v brew >/dev/null 2>&1; then warn "mongod is not installed. Install MongoDB with: brew install mongodb-community@8.0"; return; fi
  if command -v apt-get >/dev/null 2>&1; then warn "mongod is not installed. Install MongoDB using your distribution's MongoDB packages."; return; fi
  warn "mongod is not installed. Install MongoDB Server and ensure mongod is on PATH."
}

install_dependencies() {
  info "Installing backend dependencies"; (cd "$BACKEND_DIR" && pnpm install)
  info "Installing frontend dependencies"; (cd "$FRONTEND_DIR" && pnpm install)
}

print_next_steps() {
  printf '\n%sSetup checks completed.%s\n\n' "${GREEN}${BOLD}" "$RESET"
  printf '%sNext:%s\n' "${CYAN}${BOLD}" "$RESET"
  printf '  - Start MongoDB if it is not already running\n'
  printf '  - Run backend:  cd twaire-backend && pnpm run dev\n'
  printf '  - Run frontend: cd twaire-frontend && pnpm run dev\n'
}

ensure_node
ensure_pnpm
ensure_mongodb
install_dependencies
print_next_steps
