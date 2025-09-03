#!/bin/bash
# 设置脚本执行权限
chmod +x /app/start.sh

echo '开始安装依赖... ==========================>'
npm install

echo '开始构建项目... ==========================>'
npm run build

echo '构建完成，检查 dist 目录... ==========================>'
ls -la dist/

echo '复制文件到 nginx 目录... ==========================>'
chmod -R 755 dist/*
chown -R www-data:www-data dist/*

echo '检查复制结果... ==========================>'
ls -la dist/*

echo '启动 nginx... ==========================>'
nginx -g 'daemon off;'