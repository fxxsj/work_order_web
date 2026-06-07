#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if npm run | grep -q "test:run"; then
    npm run test:run
else
    npm run test:unit
fi
