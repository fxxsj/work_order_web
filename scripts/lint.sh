#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if npm run | grep -q "lint:check"; then
    npm run lint:check
else
    npx eslint .
fi
