# Web 项目部署基础整理

## 1. Redis 基础

Redis 是一个基于内存的键值数据库，常被拿来做缓存、会话数据、验证码、计数器、排行榜等场景。它的特点是读写快、支持多种数据结构，适合放“高频访问、允许短期失效”的数据。

### 常见使用场景
- 缓存热点数据
- 存短信/邮箱验证码
- 存登录态辅助数据
- 计数器（阅读量、点赞数）
- 限流
- 分布式锁（后续进阶再学）

### 常见数据类型
- `String`：最常用，适合验证码、token、简单缓存
- `Hash`：适合存对象
- `List`：适合队列
- `Set`：适合去重
- `ZSet`：适合排行榜

### 常用命令
```bash
# 连接 Redis
redis-cli

# 设置值
SET user:1 "张三"

# 取值
GET user:1

# 设置过期时间（秒）
SET code:login:13800000000 123456 EX 300

# 查看是否存在
EXISTS code:login:13800000000

# 删除
DEL user:1

# 给已有 key 设置过期时间
EXPIRE user:1 600

# 查看剩余过期时间
TTL user:1
```

开发中最常见的理解

- MySQL 负责“持久化存储”
- Redis 负责“高频、临时、快速访问”
- 不是所有数据都该放 Redis
- 一般遵循：**先查 Redis，没有再查数据库，再回写 Redis**

------

## 2. 缓存

缓存的核心目的就是：**减少数据库压力，提高响应速度**。

### 常见缓存策略

#### 2.1 Cache Aside（旁路缓存）

最常见的业务写法：

1. 先查 Redis
2. Redis 没有，再查 MySQL
3. 查到后写回 Redis
4. 下次优先读 Redis

```text
请求 -> Redis
   -> 命中，直接返回
   -> 未命中，查 MySQL -> 回写 Redis -> 返回
```

#### 2.2 更新策略

更新数据库时，常见做法：

- 先更新 MySQL
- 再删除 Redis 对应缓存

这样比“先更新缓存再更新数据库”更常见，也更稳一些。

### 缓存常见问题

#### 缓存穿透

查询一个根本不存在的数据，Redis 没有，数据库也没有，大量请求直接打数据库。

解决思路：

- 对空值也做短时间缓存
- 参数校验
- 布隆过滤器（进阶）

#### 缓存击穿

某个热点 key 恰好过期，大量请求同时打到数据库。

解决思路：

- 热点 key 不立即过期
- 加锁
- 提前刷新

#### 缓存雪崩

大量 key 在同一时间过期，数据库瞬间压力暴增。

解决思路：

- 过期时间加随机值
- 多级缓存
- 限流降级

------

## 3. 验证码 / 登录态辅助

Redis 很适合存验证码和登录态辅助数据，因为这类数据：

- 时效短
- 访问频繁
- 不一定要长期持久化

### 3.1 验证码场景

例如短信验证码、邮箱验证码。

```bash
SET code:register:email:test@example.com 826451 EX 300
```

含义：

- key：`code:register:email:test@example.com`
- value：`826451`
- 300 秒后自动过期

校验流程：

1. 用户提交验证码
2. 从 Redis 取值
3. 比对是否一致
4. 验证成功后删除验证码

### 3.2 登录态辅助

现在很多系统登录使用 JWT，但 Redis 仍然常用于做辅助控制：

- 存 refresh token
- 存黑名单 token
- 存用户会话状态
- 做单端登录/踢下线
- 做登录频率限制

例如：

```bash
SET login:token:user:1001 eyJhbGciOi... EX 86400
```

也可以记录登录失败次数：

```bash
INCR login:fail:user:1001
EXPIRE login:fail:user:1001 600
```

这样可以做简单风控，比如 10 分钟内失败超过 5 次就限制登录。

------

## 4. Docker 基础

Docker 的核心思想是：**把应用和运行环境一起打包进镜像，再通过容器运行**。
Docker 官方文档把 Dockerfile 定义为构建镜像的指令文件；而 Compose 用一个 YAML 文件统一定义服务、网络、卷等多容器应用配置。 ([Docker Documentation](https://docs.docker.com/build/concepts/dockerfile/?utm_source=chatgpt.com))

### 4.1 基本概念

#### 镜像（Image）

相当于“应用模板”。

#### 容器（Container）

镜像运行后的实例。

#### 仓库（Registry）

存放镜像的地方，比如 Docker Hub。

### 4.2 常见命令

```bash
# 查看版本
docker -v

# 拉取镜像
docker pull nginx
docker pull redis

# 查看本地镜像
docker images

# 运行容器
docker run -d --name my-nginx -p 80:80 nginx

# 查看运行中的容器
docker ps

# 查看全部容器
docker ps -a

# 停止容器
docker stop my-nginx

# 启动容器
docker start my-nginx

# 删除容器
docker rm my-nginx

# 删除镜像
docker rmi nginx
```

### 4.3 端口映射

容器默认端口不会自动暴露给宿主机，通常要通过 `-p` 或 `--publish` 显式发布端口；格式常见为 `宿主机端口:容器端口`。 ([Docker Documentation](https://docs.docker.com/engine/containers/run/?utm_source=chatgpt.com))

```bash
docker run -d --name my-app -p 3000:3000 my-app-image
```

含义：

- 宿主机访问 `3000`
- 实际转发到容器内的 `3000`

------

## 5. Dockerfile

Dockerfile 是一个文本文件，用来定义“如何构建镜像”。常见指令包括 `FROM`、`WORKDIR`、`COPY`、`RUN`、`EXPOSE`、`CMD` 等。官方也建议优先选择更小、更精简的基础镜像，以减少镜像体积和潜在漏洞面。 ([Docker Documentation](https://docs.docker.com/build/concepts/dockerfile/?utm_source=chatgpt.com))

### 5.1 常见指令

- `FROM`：基础镜像
- `WORKDIR`：工作目录
- `COPY`：复制文件到镜像
- `RUN`：构建时执行命令
- `EXPOSE`：声明容器监听端口
- `CMD`：容器启动时默认执行命令

### 5.2 Node 项目示例

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

### 5.3 Python/FastAPI 项目示例

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

------

## 6. docker compose

现在更推荐使用 **`docker compose`** 命令，而不是老写法 `docker-compose`。Docker 官方说明：Compose v2 使用 `docker compose` 调用，并且会忽略旧的顶层 `version` 字段，按 Compose Specification 解析配置。 ([Docker Documentation](https://docs.docker.com/compose/intro/history/?utm_source=chatgpt.com))

Compose 的作用是：**把多个服务统一编排起来**，例如：

- 前端
- 后端
- MySQL
- Redis
- Nginx

### 6.1 常见配置项

- `services`：定义服务
- `ports`：端口映射
- `volumes`：数据卷
- `environment`：环境变量
- `depends_on`：依赖服务
- `networks`：网络

### 6.2 示例 compose.yaml

```yaml
services:
  nginx:
    image: nginx:latest
    container_name: my-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
      - backend

  frontend:
    image: my-frontend:latest
    container_name: my-frontend
    ports:
      - "8080:80"

  backend:
    image: my-backend:latest
    container_name: my-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - DB_HOST=mysql
    depends_on:
      - redis
      - mysql

  mysql:
    image: mysql:8
    container_name: my-mysql
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: mydb
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7
    container_name: my-redis
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

### 6.3 常见命令

```bash
# 启动
docker compose up -d

# 停止并删除容器
docker compose down

# 查看日志
docker compose logs -f

# 重新构建并启动
docker compose up -d --build

# 查看服务状态
docker compose ps
```

------

## 7. Nginx 反向代理

Nginx 很常用的一个能力就是 **反向代理**：客户端请求先到 Nginx，再由 Nginx 转发给后端服务。官方文档把 reverse proxy 描述为把请求转发到被代理服务器，并支持配置请求头、缓冲等行为。 ([docs.nginx.com](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/?utm_source=chatgpt.com))

### 7.1 为什么要用 Nginx

- 统一入口
- 转发前端/后端请求
- 支持静态资源服务
- 支持负载均衡
- 方便后续接 HTTPS
- 方便做跨域代理

### 7.2 常见场景

#### 前端静态资源

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

#### 反向代理后端接口

```nginx
server {
    listen 80;
    server_name localhost;

    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 7.3 常见理解

- 用户访问：`http://你的域名/api/users`
- Nginx 收到请求
- 转发给后端服务：`http://backend:3000/users`

也就是说，前端不直接暴露后端真实地址，而是通过 Nginx 做统一转发。

------

## 8. Linux 常用命令

部署时不需要一上来学很深，先会常用命令就够了。

### 8.1 目录和文件

```bash
# 查看当前目录
pwd

# 查看文件
ls
ls -al

# 进入目录
cd /home/project

# 新建目录
mkdir app

# 删除文件
rm file.txt

# 删除目录
rm -rf dist

# 复制
cp -r dist /var/www/html

# 移动/重命名
mv old.txt new.txt
```

### 8.2 文件查看

```bash
# 查看文件内容
cat .env

# 分页查看
less docker-compose.yml

# 查看前 100 行
head -n 100 logs/app.log

# 查看后 100 行
tail -n 100 logs/app.log

# 实时查看日志
tail -f logs/app.log
```

### 8.3 权限

```bash
# 修改权限
chmod 755 deploy.sh

# 修改所属用户
chown -R root:root /var/www/html
```

### 8.4 进程和端口

```bash
# 查看进程
ps -ef | grep nginx

# 查看端口占用
ss -lntp
netstat -lntp

# 杀进程
kill -9 12345
```

### 8.5 压缩与解压

```bash
# 打包
tar -czvf project.tar.gz project/

# 解压
tar -xzvf project.tar.gz
```

### 8.6 下载与网络

```bash
# 下载文件
wget https://example.com/file.tar.gz

# 测试接口
curl http://localhost:3000/api/health
```

------

## 9. 简单部署流程

下面是一套适合中小项目、个人项目、练手项目的简单部署思路。

### 9.1 准备服务器

先准备一台 Linux 服务器，比如 Ubuntu。

建议提前装好：

- Docker
- Docker Compose 插件
- Nginx（如果不用容器跑 Nginx，也可以宿主机安装）

Compose 官方文档说明，Docker Desktop 自带 Compose；在 Docker Engine 场景下也可以作为插件安装。 ([Docker Documentation](https://docs.docker.com/compose/install/?utm_source=chatgpt.com))

### 9.2 部署思路

#### 方案 A：全都用 Docker

- 前端：打包成静态文件，放进 Nginx 容器
- 后端：打包成 Node/Python 镜像
- MySQL：官方镜像
- Redis：官方镜像
- Nginx：官方镜像做统一入口

#### 方案 B：前端静态部署 + 后端 Docker

- 前端构建后直接放服务器目录
- Nginx 直接托管前端静态文件
- 后端、Redis、MySQL 用 Docker

个人练手更推荐 **方案 A**，环境一致，迁移方便。

### 9.3 示例部署步骤

#### 第一步：前端打包

```bash
npm run build
```

#### 第二步：后端构建镜像

```bash
docker build -t my-backend:latest .
```

#### 第三步：前端构建镜像

如果前端走 Nginx 容器托管，可以给前端也写一个 Dockerfile。

```dockerfile
FROM nginx:latest
COPY dist/ /usr/share/nginx/html/
COPY default.conf /etc/nginx/conf.d/default.conf
```

构建：

```bash
docker build -t my-frontend:latest .
```

#### 第四步：准备 compose.yaml

把前端、后端、MySQL、Redis、Nginx 配到一个 compose 文件里。

#### 第五步：启动服务

```bash
docker compose up -d
```

#### 第六步：检查服务

```bash
docker compose ps
docker compose logs -f
```

#### 第七步：域名或 IP 访问

- 前端：`http://你的服务器IP`
- 接口：`http://你的服务器IP/api`

### 9.4 常见排查思路

#### 页面打不开

- 看容器是否启动
- 看端口是否映射
- 看安全组/防火墙是否放行
- 看 Nginx 配置是否正确

#### 接口 502

- 一般先看后端容器是否挂了
- 看 Nginx 代理地址是否写对
- 看后端是否真的监听在 `0.0.0.0`

#### 数据库连不上

- 看环境变量
- 看容器网络
- 看 MySQL 是否初始化成功

#### Redis 连不上

- 看服务名是否写对
- 容器之间一般用服务名通信，不要乱写 localhost

------

## 10. 一套最小可用部署理解

你可以把整套部署理解成下面这样：

```text
用户浏览器
   ↓
Nginx
   ├── /        -> 前端静态页面
   └── /api     -> 后端服务
                     ├── MySQL
                     └── Redis
```

### 流程说明

1. 用户访问网站
2. 请求先到 Nginx
3. Nginx 返回前端页面
4. 前端调用 `/api`
5. Nginx 再把 `/api` 转发给后端
6. 后端访问 MySQL 和 Redis
7. 返回数据给前端

------

## 11. 学习建议

如果你现在是前端，建议按这个顺序掌握：

1. Docker 基础
2. Dockerfile
3. docker compose
4. Linux 常用命令
5. Nginx 反向代理
6. Redis 基础
7. 缓存设计
8. 简单部署流程

### 原因

- Docker 解决“怎么跑”
- Dockerfile 解决“怎么打包”
- Compose 解决“多个服务怎么一起跑”
- Linux 解决“服务器怎么操作”
- Nginx 解决“请求怎么转发”
- Redis 解决“性能和临时数据”
- 缓存解决“怎么抗压”
- 部署流程解决“怎么真正上线”

```
你要的话，我下一条可以继续帮你整理成一份 **更适合面试背诵的精简版 md**，或者直接给你一份 **“前端 + Node 项目部署实战模板”**。
::contentReference[oaicite:6]{index=6}
```