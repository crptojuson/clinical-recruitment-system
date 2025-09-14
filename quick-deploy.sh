#!/bin/bash

# 如果你的代码在GitHub上，这是最快的方式
echo "🚀 GitHub快速部署..."

# 克隆代码
git clone https://github.com/你的用户名/临床招募系统.git /var/www/clinical-recruitment

# 执行部署脚本
cd /var/www/clinical-recruitment
chmod +x deploy.sh
./deploy.sh

echo "✅ GitHub部署完成！" 