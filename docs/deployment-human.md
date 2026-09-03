# 人类部署指南

这份指南面向项目负责人、运维和拥有云控制台权限的人。它说明上线前要准备什么、每个配置有什么用，以及上线后你能做什么。

## 你需要准备什么

### 1. 一台源站服务器

最低需要：

- Linux 服务器，建议 2C4G 起步。
- 公网 IP。
- Docker 和 Docker Compose。
- 80、443 对外开放。
- 8055、3000、8080 只建议内网或本机访问，由 Nginx 反代出去。

源站会运行：

- 前台网站：Nuxt SSR，默认端口 `3000`。
- 后端 API：Koa2，默认端口 `8055`，路径 `/mmgcApi`。
- 旧 Admin：默认端口 `8080`。
- MongoDB、Redis。

### 2. 域名

首发上线至少准备：

| 域名 | 是否必需 | 用途 |
| --- | --- | --- |
| `mirai-mad.com` | 必需 | 主站入口 |
| `assets.mirai-mad.com` | 必需 | 视频、图片、上传资源 |
| `assets-cn.mirai-mad.com` | 可选 | 中国大陆资源加速，仅在系统开关开启时使用 |

建议主站和资源分离。资源域名绑定 CDN，主站域名可以直接到源站 Nginx，也可以先接 CDN 再回源。

### 3. CDN 与对象存储

当前项目通过后端使用 S3 兼容协议上传到 Cloudflare R2：

| 配置 | 说明 |
| --- | --- |
| `R2_ENDPOINT` | R2 S3 API endpoint，不含或包含 bucket 路径均可 |
| `R2_ACCESS_KEY_ID` | R2 Access Key ID，只放服务器环境变量 |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Access Key，只放服务器环境变量 |
| `R2_BUCKET` | R2 bucket，例如 `miraimad` |
| `R2_PUBLIC_URL` | 默认资源域名，例如 `https://assets.mirai-mad.com` |
| `R2_CN_PUBLIC_URL` | 可选的中国大陆加速域名，例如 `https://assets-cn.mirai-mad.com` |

```env
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=miraimad
R2_PUBLIC_URL=https://assets.mirai-mad.com
R2_CN_PUBLIC_URL=https://assets-cn.mirai-mad.com
```

浏览器只把文件上传到后端 API，不应配置或获取 R2 Secret。

### 4. 证书

需要准备：

- `mirai-mad.com` 的 HTTPS 证书。
- 如果 Admin 使用独立域名，也要准备 Admin 域名证书。
- `assets.mirai-mad.com` 和 `assets-cn.mirai-mad.com` 的证书通常在 Cloudflare 或加速服务控制台里配置。

### 5. 邮件、数据库、密钥

需要准备：

- MongoDB 用户名和密码。
- Redis 密码。
- `JWT_SECRET`。
- `AES_PASSWORD`、`AES_SALT`、`AES_IV`。
- 邮件 SMTP 账号和授权码。
- OpenAI 兼容接口配置，如果启用 AI 翻译。

这些内容不要提交到 Git。

## 你需要在控制台做什么

### 创建对象存储和 CDN

1. 创建 Cloudflare R2 bucket。
2. 将 `assets.mirai-mad.com` 作为 R2 Custom Domain 并开启 HTTPS。
3. 如需中国大陆加速，将 `assets-cn.mirai-mad.com` 配置到相应加速服务并回源 R2。
4. 等待 DNS 生效，再在后台开启“中国大陆资源加速”。

### 配置主站域名

主站有两种方式：

| 方式 | 链路 | 适合场景 |
| --- | --- | --- |
| 直接回源 | `mirai-mad.com` A 记录到源站 IP | 简单上线、低流量 |
| 主站 CDN | `mirai-mad.com` CNAME 到 CDN，CDN 回源源站 IP | 需要页面缓存和抗压 |

无论哪种方式，源站都需要 Nginx。可以从 `env/nginx.mmgc.conf.example` 复制一份到服务器 Nginx 站点目录，然后替换域名、证书路径和源站地址。

## 服务器部署步骤

1. 准备环境文件：

```bash
cp env/backend.env.production.example env/backend.env.production
cp env/frontend.env.production.example env/frontend.env.production
```

2. 修改 `env/backend.env.production`：

```env
APP_PORT=8055
HOST_NAME=0.0.0.0
MMGC_PREFIX=/mmgcApi

MONGO_PATH=mongodb://mongodb:27017
MONGO_COLLECTION=mmgc
MONGO_USERNAME=your-mongo-user
MONGO_PASSWORD=your-mongo-password

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

JWT_SECRET=replace-with-long-random-string
AES_PASSWORD=replace-with-secret
AES_SALT=replace-with-secret
AES_IV=replace-with-secret

R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET=miraimad
R2_PUBLIC_URL=https://assets.mirai-mad.com
R2_CN_PUBLIC_URL=https://assets-cn.mirai-mad.com
```

3. 修改 `env/frontend.env.production`：

```env
NUXT_PUBLIC_API_BASE=https://mirai-mad.com
NUXT_PUBLIC_API_PREFIX=/mmgcApi
NUXT_PUBLIC_API_LOCAL=http://backend:8055
```

4. 启动：

```bash
docker compose up -d
docker compose ps
```

5. 配置 Nginx：

```bash
cp env/nginx.mmgc.conf.example /etc/nginx/conf.d/mmgc.conf
nginx -t
systemctl reload nginx
```

复制前需要把示例中的域名、证书路径、端口改成实际值。

## 上线后你能做什么

- 访问 `https://mirai-mad.com` 查看活动主站。
- 访问 `https://mirai-mad.com/admin/` 进入旧 Admin。
- 在 Admin 中管理活动、作品、投稿表单、赞助商、成员和数据看板。
- 上传视频或图片到对象存储，并通过 `assets.mirai-mad.com` 分发。
- 确认中国大陆加速域名可用后，可在系统配置中开启“中国大陆资源加速”。

## 不触发 Workflow 的 Push

当前部署 workflow 只监听 `master` 分支 push。只是同步文档、TODO、说明文件时，可以用下面两种方式避免触发部署。

推荐方式是推到非 `master` 分支：

```bash
git switch -c docs/update-deployment-guide
git push origin docs/update-deployment-guide
```

如果必须直接推 `master`，在提交信息里加跳过标记：

```bash
git commit -m "docs: update deployment guide [skip ci]"
git push origin master
```

GitHub Actions 支持的标记包括 `[skip ci]`、`[ci skip]`、`[no ci]`、`[skip actions]`、`[actions skip]`。不要使用 `git push -o ci.skip`，那不是 GitHub Actions 的可靠跳过方式。

如果仓库启用了 required checks，被跳过的检查可能保持 Pending，PR 可能因此无法合并。需要恢复时，推一个不带跳过标记的新提交即可重新触发检查。

## 验证清单

上线后逐项检查：

```text
https://mirai-mad.com/
https://mirai-mad.com/mmgcApi/config/getConfig
https://mirai-mad.com/admin/
https://assets.mirai-mad.com/<已知对象 key>
```

服务器检查：

```bash
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
nginx -t
```

如果接口 404，优先检查：

- `MMGC_PREFIX=/mmgcApi` 是否有多余空格。
- Nginx `/mmgcApi/` 是否保留原始路径转发。
- `NUXT_PUBLIC_API_PREFIX` 是否和后端一致。

如果资源上传成功但无法访问，优先检查：

- `R2_PUBLIC_URL` 是否是完整 HTTPS 地址。
- R2 Custom Domain 是否处于 Active 状态。
- Custom Domain 是否绑定到正确 bucket。
- bucket 内对象 key 是否和返回 URL 一致。

## 中国大陆资源加速怎么启用

CN 加速是可选增强，关闭时所有地区都使用 `assets.mirai-mad.com`。

启用前需要准备：

- `assets-cn.mirai-mad.com` 已接入可用的中国大陆加速服务。
- 加速服务能回源 `assets.mirai-mad.com` 或 R2。
- 主站请求经过 Cloudflare，后端能收到可信的 `CF-IPCountry` 请求头。

启用后的资源域名选择：

```text
CN IP + 开关开启 -> assets-cn.mirai-mad.com
其他所有请求      -> assets.mirai-mad.com
```
