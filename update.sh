#!/bin/bash

# 快速更新脚本 - 在服务器上执行
# 用于更新已部署的应用

PROJECT_DIR="/var/www/clinical-recruitment"

echo "🔄 开始更新临床招募系统..."

# 进入项目目录
cd $PROJECT_DIR

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin master

# 更新前端
echo "🎨 更新前端..."
cd frontend
npm install
npm run build
cd ..

# 更新后端
echo "⚙️ 更新后端..."
cd backend
npm install

# 运行数据库迁移（如果有新的）
echo "🔄 运行数据库迁移..."
if [ -f "src/scripts/updateDatabase.js" ]; then
    node src/scripts/updateDatabase.js
fi

# 重启应用
echo "🚀 重启应用..."
pm2 restart clinical-recruitment

# 重载Nginx（以防配置有变化）
sudo nginx -t && sudo systemctl reload nginx

echo "✅ 更新完成！"
echo "📊 查看状态: pm2 status"
echo "📝 查看日志: pm2 logs clinical-recruitment" 