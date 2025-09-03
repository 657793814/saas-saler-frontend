# 方案1 直接构建服务镜像
FROM node:21 AS builder
COPY ./ /app
WORKDIR /app
RUN npm install && npm run build

FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf

# 方案2 构建一个基础的node+nginx镜像 配合 docker-compose使用。 docker build -t node-web-base . 。
#FROM node:21 AS node-nginx-base
#RUN apt-get update && apt-get install -y nginx
#RUN mkdir -p /app
#WORKDIR /app
#COPY nginx.conf /etc/nginx/nginx.conf
#CMD ["nginx", "-g", "daemon off;"]
