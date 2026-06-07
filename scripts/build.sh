#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# 优先使用已有的 start.sh build 命令（功能更全）
if [ -f "start.sh" ]; then
    bash start.sh build "$@"
    exit $?
fi

# Fallback
npm run build
