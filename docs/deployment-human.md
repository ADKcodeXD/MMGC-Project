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
| `global.mirai-mad.com` | 可选 | 海外主站 |
| `assets-global.mirai-mad.com` | 可选 | 海外资源 |

建议主站和资源分离。资源域名绑定 CDN，主站域名可以直接到源站 Nginx，也可以先接 CDN 再回源。

### 3. CDN 与对象存储

当前项目默认按七牛云链路运行，但配置命名已经可以向通用 CDN adapter 过渡：

| 配置 | 说明 |
| --- | --- |
| `CDN_ADAPTER` | 当前填 `qiniu` |
| `CDN_ACCESS_KEY` | CDN/对象存储 Access Key |
| `CDN_SECRET_KEY` | CDN/对象存储 Secret Key |
| `CDN_BUCKET` | 对象存储 bucket |
| `CDN_LINK` | 国内资源访问域名，例如 `https://assets.mirai-mad.com` |
| `CDN_GLOBAL_LINK` | 海外资源访问域名，例如 `https://assets-global.mirai-mad.com` |
| `CDN_FRONTEND_DOMAIN` | 主站域名，例如 `https://mirai-mad.com` |

如果继续使用旧配置，也可以填写：

```env
QINIU_ACCESS_KEY=
QINIU_SECRET_KEY=
QINIU_BUCKET=
QINIU_CDN_LINK=https://assets.mirai-mad.com
QINIU_GLOBAL_CDN_LINK=https://assets-global.mirai-mad.com
QINIU_FRONTEND_DOMAIN=https://mirai-mad.com
```

当前后端仍使用 qiniu SDK。换成其他 CDN 时，需要开发新的 adapter，不只是改环境变量。

### 4. 证书

需要准备：

- `mirai-mad.com` 的 HTTPS 证书。
- 如果 Admin 使用独立域名，也要准备 Admin 域名证书。
- `assets.mirai-mad.com` 和 `assets-global.mirai-mad.com` 的证书通常在 CDN 控制台里配置。

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

1. 创建对象存储 bucket。
2. 创建 CDN 加速域名 `assets.mirai-mad.com`。
3. 将 CDN 源站设置为对象存储 bucket 或对象存储源站域名。
4. 给 CDN 域名开启 HTTPS。
5. 在 DNS 里把 `assets.mirai-mad.com` CNAME 到 CDN 提供的地址。
6. 等待 DNS 生效。

海外资源是可选项。需要海外资源时，再创建 `assets-global.mirai-mad.com`，链路可以是 Cloudflare -> 七牛云 CDN -> 对象存储。

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

CDN_ADAPTER=qiniu
CDN_ACCESS_KEY=your-access-key
CDN_SECRET_KEY=your-secret-key
CDN_BUCKET=your-bucket
CDN_LINK=https://assets.mirai-mad.com
CDN_GLOBAL_LINK=https://assets-global.mirai-mad.com
CDN_FRONTEND_DOMAIN=https://mirai-mad.com
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
- 后续按需启用 `global.mirai-mad.com` 与 `assets-global.mirai-mad.com`，优化海外访问。

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

- `CDN_LINK` 是否是完整 HTTPS 地址。
- CDN 域名是否已经 CNAME 到 provider。
- CDN 源站是否绑定到正确 bucket。
- bucket 内对象 key 是否和返回 URL 一致。

## 海外节点怎么启用

海外节点是可选增强，不影响国内首发上线。

启用前需要准备：

- 海外前端源站，例如雅加达服务器。
- `global.mirai-mad.com`。
- Cloudflare 账号和域名接入权限。
- `assets-global.mirai-mad.com`。

推荐链路：

```text
海外用户
  -> global.mirai-mad.com
  -> Cloudflare
  -> 七牛云或海外前端源站
  -> 雅加达前端

海外资源
  -> assets-global.mirai-mad.com
  -> Cloudflare
  -> 七牛云 CDN
  -> 对象存储源站
```

API 不建议复制多套。默认所有前台、海外前台和 Admin 都直接访问同一个 API 源站。
