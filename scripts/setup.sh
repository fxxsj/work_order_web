#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Web 前端初始化安装${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js: $(node -v)${NC}"
echo -e "${GREEN}npm: $(npm -v)${NC}"
echo ""

# 安装依赖
echo -e "${BLUE}安装依赖...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
    echo -e "${RED}✗ 依赖安装失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Web 安装完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "开发: bash scripts/dev.sh"
echo "测试: bash scripts/test.sh"
