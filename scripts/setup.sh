#!/bin/bash

# scripts/setup.sh

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}Twaire Setup Script${NC}"

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}[!] $2 not found ($1)${NC}"
        return 1
    fi
    echo -e "${GREEN}[v] $2 found${NC}"
    return 0
}

all_checks_passed=true

# Check Node.js
if ! check_command "node" "Node.js"; then
    echo "    Please install Node.js (v18+ recommended)"
    all_checks_passed=false
else
    echo "    Version: $(node -v)"
fi

# Check pnpm
if ! check_command "pnpm" "pnpm"; then
    echo "    Please install pnpm: npm install -g pnpm"
    all_checks_passed=false
fi

# Check MongoDB
if ! check_command "mongod" "MongoDB"; then
    echo "    Please install MongoDB."
    all_checks_passed=false
fi

if [ "$all_checks_passed" = false ]; then
    echo -e "\n${YELLOW}[!] Some environment checks failed. Please resolve them before proceeding.${NC}"
    exit 1
fi

echo -e "\n${CYAN}[i] Environment checks passed. Installing dependencies...${NC}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Backend
echo -e "\n${CYAN}[i] Installing Backend dependencies...${NC}"
cd "$SCRIPT_DIR/../twaire-backend" || exit
pnpm install

# Frontend
echo -e "\n${CYAN}[i] Installing Frontend dependencies...${NC}"
cd "$SCRIPT_DIR/../twaire-frontend" || exit
pnpm install

echo -e "\n${GREEN}[v] Setup completed successfully!${NC}"
cd "$SCRIPT_DIR/.."
