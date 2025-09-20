#!/bin/bash

echo "部署域名配置..."

# 复制Nginx配置到服务器
scp -i ~/.ssh/id_rsa nginx.conf admin@47.101.192.3:/etc/nginx/sites-available/clinical-recruitment

# 在服务器上执行配置
ssh -i ~/.ssh/id_rsa admin@47.101.192.3 << 'EOF'
    # 启用站点配置
    sudo ln -sf /etc/nginx/sites-available/clinical-recruitment /etc/nginx/sites-enabled/
    
    # 测试Nginx配置
    sudo nginx -t
    
    # 重启Nginx
    sudo systemctl reload nginx
    
    echo "域名配置部署完成！"
    echo "您现在可以通过以下地址访问："
    echo "http://shiyaotong.cn"
    echo "http://www.shiyaotong.cn"
EOF

echo "部署完成！请等待DNS解析生效（5-10分钟）" 