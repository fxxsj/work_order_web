#!/bin/bash

# 印刷施工单跟踪系统 - Web 前端启动脚本
# Vue 3 + Vite + Element Plus

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}  印刷施工单跟踪系统 - Web 前端${NC}"
echo -e "${BLUE}====================================${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    echo "请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}错误: Node.js 版本过低 (当前: $(node -v))${NC}"
    echo "请升级至 Node.js 18+"
    exit 1
fi

echo -e "${GREEN}Node.js: $(node -v)${NC}"
echo -e "${GREEN}npm: $(npm -v)${NC}"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}正在安装依赖...${NC}"
    npm install
fi

# 解析参数
MODE="${1:-dev}"

 case "$MODE" in
    dev|serve|start)
        echo -e "${BLUE}启动开发服务器...${NC}"
        npm run dev
        ;;
    build)
        echo -e "${BLUE}构建生产环境...${NC}"
        npm run build
        echo -e "${GREEN}构建完成！输出目录: dist/${NC}"
        ;;
    preview)
        echo -e "${BLUE}预览生产构建...${NC}"
        npm run preview
        ;;
    lint)
        echo -e "${BLUE}运行代码检查...${NC}"
        npm run lint
        ;;
    test)
        echo -e "${BLUE}运行单元测试...${NC}"
        npm run test:unit
        ;;
    clean)
        echo -e "${YELLOW}清理构建缓存...${NC}"
        rm -rf dist node_modules/.vite
        echo -e "${GREEN}清理完成${NC}"
        ;;
    *)
        echo "用法: $0 [dev|build|preview|lint|test|clean]"
        echo ""
        echo "命令:"
        echo "  dev      启动开发服务器 (默认)"
        echo "  build    构建生产环境"
        echo "  preview  预览生产构建"
        echo "  lint     运行 ESLint 代码检查"
        echo "  test     运行单元测试"
        echo "  clean    清理构建缓存"
        exit 1
        ;;
esac
