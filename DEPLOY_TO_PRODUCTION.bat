@echo off
chcp 65001 >nul
echo ==========================================
echo 🚀 强制部署到 Production 脚本
echo ==========================================
echo.

cd /d "%~dp0agent-portal"

echo ⚠️  注意：Cloudflare Pages 的 Production 部署需要 Git 集成
echo.
echo 选项 1：打开 Cloudflare Dashboard 手动设置
echo   https://dash.cloudflare.com/dfbee5c2a5706a81bc04675499c933d4/pages/view/easylink-agent-portal
echo.
echo 选项 2：创建 GitHub 仓库并推送（推荐）
echo.
echo 按任意键打开 Cloudflare Dashboard...
pause >nul

start https://dash.cloudflare.com/dfbee5c2a5706a81bc04675499c933d4/pages/view/easylink-agent-portal
