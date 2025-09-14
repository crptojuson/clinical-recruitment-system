#!/bin/bash

# Git部署脚本 - 在服务器上执行
# 使用方法：./git-deploy.sh [GitHub仓库URL]

REPO_URL=${1:-"https://github.com/你的用户名/临床招募系统.git"}
PROJECT_DIR="/var/www/clinical-recruitment"

echo "🚀 开始Git部署临床招募系统..."
echo "📦 仓库地址: $REPO_URL"

# 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装Git（如果没有的话）
echo "📥 安装Git..."
sudo apt install git -y

# 安装 Node.js 18
echo "🟢 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 MySQL
echo "🗄️ 安装 MySQL..."
sudo apt install mysql-server -y

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安装 Nginx
echo "🌐 安装 Nginx..."
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 安装 PM2
echo "⚡ 安装 PM2..."
sudo npm install -g pm2

# 创建项目目录并克隆代码
echo "📁 克隆项目代码..."
sudo rm -rf $PROJECT_DIR
sudo mkdir -p /var/www
sudo git clone $REPO_URL $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# 进入项目目录
cd $PROJECT_DIR

# 安装前端依赖并构建
echo "📚 安装前端依赖..."
cd frontend
npm install
npm run build
cd ..

# 安装后端依赖
echo "📚 安装后端依赖..."
cd backend
npm install
cd ..

# 设置 MySQL 数据库
echo "🗄️ 设置数据库..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS clinical_recruitment;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'clinical_user'@'localhost' IDENTIFIED BY 'clinical_password123';"
sudo mysql -e "GRANT ALL PRIVILEGES ON clinical_recruitment.* TO 'clinical_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 创建环境变量文件
echo "⚙️ 创建环境配置..."
cd backend
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=clinical_user
DB_PASSWORD=clinical_password123
DB_NAME=clinical_recruitment
JWT_SECRET=your-secret-key-change-this-in-production-$(date +%s)
EOF

# 运行数据库迁移（如果存在）
echo "🔄 运行数据库迁移..."
if [ -f "src/scripts/updateDatabase.js" ]; then
    node src/scripts/updateDatabase.js
fi

# 配置 Nginx
echo "🌐 配置 Nginx..."
sudo tee /etc/nginx/sites-available/clinical-recruitment << EOF
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root $PROJECT_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 接口
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/clinical-recruitment /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 停止之前的应用（如果存在）
pm2 delete clinical-recruitment 2>/dev/null || true

# 启动应用
echo "🚀 启动应用..."
cd backend
pm2 start src/server.js --name "clinical-recruitment"
pm2 startup
pm2 save

# 设置防火墙
echo "🔥 配置防火墙..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Git部署完成！"
echo "🌐 访问地址: http://$(curl -s ifconfig.me)"
echo "📊 监控命令: pm2 monit"
echo "📝 查看日志: pm2 logs clinical-recruitment"
echo "🔄 更新代码: cd $PROJECT_DIR && git pull && pm2 restart clinical-recruitment" 