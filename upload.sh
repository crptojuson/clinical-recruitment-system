#!/bin/bash

# 服务器配置
SERVER_IP="你的服务器IP"
SERVER_USER="root"  # 或者你的用户名

echo "📤 上传文件到服务器..."

# 上传代码包
scp clinical-recruitment.tar.gz $SERVER_USER@$SERVER_IP:~/

# 上传部署脚本
scp deploy.sh $SERVER_USER@$SERVER_IP:~/

# 给部署脚本执行权限
ssh $SERVER_USER@$SERVER_IP "chmod +x ~/deploy.sh"

echo "✅ 文件上传完成！"
echo "🚀 现在登录服务器执行: ./deploy.sh" 