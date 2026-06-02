#!/bin/bash

# 印刷生产管理系统 - Web 前端启动脚本
# Vue 3 + Vite + Element Plus

set -euo pipefail

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认值
MODE="dev"
PORT=""
ENV_MODE="dev"

# 帮助信息
show_help() {
    echo "用法: ./start.sh [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  dev, serve, start  启动开发服务器 (默认)"
    echo "  build              构建生产环境"
    echo "  preview            预览生产构建"
    echo "  lint               运行 ESLint 代码检查"
    echo "  test               运行单元测试"
    echo "  clean              清理构建缓存"
    echo ""
    echo "选项:"
    echo "  --env ENV      指定环境: dev|staging|prod (默认 dev)"
    echo "  --port PORT    指定开发服务器端口"
    echo "  -h, --help     显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./start.sh                  # 启动开发服务器"
    echo "  ./start.sh build            # 构建生产环境"
    echo "  ./start.sh dev --port 3000  # 使用 3000 端口"
    echo "  ./start.sh build --env prod # 生产环境构建"
}

echo -e "${BLUE}====================================${NC}"
echo -e "${BLUE}  印刷生产管理系统 - Web 前端${NC}"
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

# 解析参数
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --env)
            ENV_MODE="${2:?--env 需要环境参数}"
            shift
            ;;
        --port)
            PORT="${2:?--port 需要端口号参数}"
            shift
            ;;
        *)
            POSITIONAL_ARGS+=("$1")
            ;;
    esac
    shift
done

# 恢复位置参数
set -- "${POSITIONAL_ARGS[@]+${POSITIONAL_ARGS[@]}}"

# 命令（取第一个位置参数）
MODE="${1:-dev}"

# 检查 node_modules（支持依赖变更检测）
if [ ! -d "node_modules" ] || { [ -f "package-lock.json" ] && [ "package-lock.json" -nt "node_modules" ]; }; then
    echo -e "${YELLOW}正在安装依赖...${NC}"
    npm install
fi

# 检查运行时配置
if [ ! -f "public/env.js" ]; then
    if [ -f "public/env.js.example" ]; then
        echo -e "${YELLOW}从 env.js.example 生成 env.js...${NC}"
        cp public/env.js.example public/env.js
        echo -e "${GREEN}已生成 public/env.js，可按需修改${NC}"
    else
        echo -e "${RED}警告: public/env.js 和 public/env.js.example 均不存在${NC}"
    fi
fi

# 构建端口参数
PORT_ARGS=()
if [ -n "$PORT" ]; then
    PORT_ARGS=(--port "$PORT")
fi

# 构建环境变量
export VITE_ENV_MODE="$ENV_MODE"

case "$MODE" in
    dev|serve|start)
        echo -e "${BLUE}启动开发服务器 (环境: $ENV_MODE)...${NC}"
        if [ ${#PORT_ARGS[@]} -gt 0 ]; then
            npm run dev -- "${PORT_ARGS[@]}"
        else
            npm run dev
        fi
        ;;
    build)
        echo -e "${BLUE}构建生产环境 (环境: $ENV_MODE)...${NC}"
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
        show_help
        exit 1
        ;;
esac
