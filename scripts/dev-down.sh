#!/usr/bin/env bash
set -euo pipefail

if pgrep -f "vite" > /dev/null 2>&1; then
    pkill -f "vite"
    echo "Vite dev server 已终止"
else
    echo "Vite dev server 未运行"
fi
