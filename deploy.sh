#!/bin/bash

echo "🚀 开始部署临床招募系统..."

# 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

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

# 创建项目目录
echo "📁 创建项目目录..."
sudo mkdir -p /var/www/clinical-recruitment
sudo chown -R $USER:$USER /var/www/clinical-recruitment

# 解压项目文件
echo "📦 解压项目文件..."
cd /var/www/clinical-recruitment
tar -xzf ~/clinical-recruitment.tar.gz

# 安装依赖
echo "📚 安装前端依赖..."
cd frontend && npm install && npm run build
cd ..

echo "📚 安装后端依赖..."
cd backend && npm install
cd ..

# 设置 MySQL 数据库
echo "🗄️ 设置数据库..."
sudo mysql -e "CREATE DATABASE clinical_recruitment;"
sudo mysql -e "CREATE USER 'clinical_user'@'localhost' IDENTIFIED BY 'clinical_password123';"
sudo mysql -e "GRANT ALL PRIVILEGES ON clinical_recruitment.* TO 'clinical_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 导入数据库结构
cd backend
mysql -u clinical_user -pclinical_password123 clinical_recruitment < database.sql 2>/dev/null || echo "数据库文件不存在，跳过导入"

# 创建环境变量文件
echo "⚙️ 创建环境配置..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=clinical_user
DB_PASSWORD=clinical_password123
DB_NAME=clinical_recruitment
JWT_SECRET=your-secret-key-change-this-in-production
EOF

# 配置 Nginx
echo "🌐 配置 Nginx..."
sudo tee /etc/nginx/sites-available/clinical-recruitment << EOF
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /var/www/clinical-recruitment/frontend/dist;
        try_files \$uri \$uri/ /index.html;
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

# 启动应用
echo "🚀 启动应用..."
pm2 start app.js --name "clinical-recruitment"
pm2 startup
pm2 save

# 设置防火墙
echo "🔥 配置防火墙..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ 部署完成！"
echo "🌐 访问地址: http://你的服务器IP"
echo "📊 监控命令: pm2 monit"
echo "📝 查看日志: pm2 logs" 