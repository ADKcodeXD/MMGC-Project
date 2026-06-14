# AI Agent 部署指南

本文给自动化 agent 使用，目标是在不泄露密钥、不破坏现有服务的前提下，把 MMGC 活动网站解决方案部署到线上。遇到账号、密钥、DNS、CDN 控制台操作时，agent 只能整理清单和生成配置，不能凭空创建资源。

## Agent 需要先确认

部署前向人类索取或确认这些信息：

| 类型 | 必填 | 说明 |
| --- | --- | --- |
| 源站服务器 | 是 | 公网 IP、SSH 用户、部署路径、Docker/Compose 是否可用 |
| 主站域名 | 是 | 例如 `mirai-mad.com`，需要 DNS 管理权限 |
| API 路径 | 是 | 默认 `/mmgcApi`，必须和后端 `MMGC_PREFIX` 一致 |
| Admin 入口 | 是 | 推荐先用 `https://mirai-mad.com/admin/`；独立子域名需要重新确认 Admin base path |
| CDN/对象存储 | 是 | 至少需要一个资源域名，例如 `assets.mirai-mad.com` |
| CDN 凭证 | 是 | 当前代码支持 qiniu 兼容配置；统一变量为 `CDN_*`，旧变量 `QINIU_*` 仍可用 |
| 数据库与缓存 | 是 | MongoDB、Redis 可用地址、账号、密码 |
| SSL 证书 | 是 | 主站和 Admin 入口证书；CDN 域名证书在 CDN 控制台配置 |
| 邮件服务 | 视业务需要 | 用于通知、验证邮件 |
| 海外节点 | 否 | `global.mirai-mad.com` 与 `assets-global.mirai-mad.com` 可后续再启用 |

## Agent 能做到什么

- 生成或更新 `env/backend.env.production`、`env/frontend.env.production` 的模板内容。
- 生成 Nginx 站点配置，并标注人类需要替换的域名、证书路径和源站地址。
- 执行本地或服务器上的构建、类型检查、Docker Compose 启停、日志检查。
- 检查端口、容器状态、Nginx 配置语法和 HTTP 健康状态。
- 整理 DNS、CDN、证书、对象存储操作清单，指导人类在控制台完成。

## Agent 不应该做什么

- 不要把 Access Key、Secret Key、JWT 密钥、数据库密码写入 README、Git 或聊天记录中的可公开位置。
- 不要在没有确认的情况下修改 DNS 解析、删除 CDN 域名、删除对象存储 bucket 或清空数据库。
- 不要默认启用海外节点。海外节点需要额外服务器、Cloudflare、跨区域回源策略和成本确认。
- 不要宣称任意 CDN 已经可直接切换。当前后端 SDK 实现是 qiniu 兼容链路，`CDN_*` 是统一配置入口，其他 provider 需要新增 adapter。
- 不要用 `git push -o ci.skip` 作为 GitHub Actions 的跳过方式；这是 GitLab 常见写法。

## 不触发 Workflow 的 Push

当前 `.github/workflows/deploy.yml` 只监听 `master` 分支的 push。Agent 在需要提交文档、配置示例、TODO 等不应部署的变更时，按优先级选择：

1. 推到非 `master` 分支，不触发当前部署 workflow：

```powershell
git switch -c docs/update-deployment-guide
git push origin docs/update-deployment-guide
```

2. 如果人类明确要求直接推 `master`，提交信息必须带 GitHub Actions 跳过标记：

```powershell
git commit -m "docs: update deployment guide [skip ci]"
git push origin master
```

GitHub Actions 支持这些提交信息标记：`[skip ci]`、`[ci skip]`、`[no ci]`、`[skip actions]`、`[actions skip]`。如果本地 commit 已经生成但还没 push，可以先改提交信息：

```powershell
git commit --amend -m "docs: update deployment guide [skip ci]"
git push origin master
```

如果 commit 已经推到远端，workflow 可能已经触发；这时不要为了跳过 workflow 去改写共享分支历史，除非人类明确要求。

如果仓库启用了 required checks，被跳过的检查可能保持 Pending，PR 可能因此无法合并。Agent 不应把这种 Pending 当成 CI 失败修复；正确处理是让人类确认后再推一个不带跳过标记的新提交。

## 推荐部署路径

1. 检查仓库状态：

```powershell
git -c safe.directory=D:/WorkSpace/MMGC-Project status --short
```

2. 准备生产环境文件：

```powershell
Copy-Item env/backend.env.production.example env/backend.env.production
Copy-Item env/frontend.env.production.example env/frontend.env.production
```

3. 后端生产环境最小配置：

```env
APP_PORT=8055
HOST_NAME=0.0.0.0
MMGC_PREFIX=/mmgcApi

MONGO_PATH=mongodb://mongodb:27017
MONGO_COLLECTION=mmgc
MONGO_USERNAME=replace-me
MONGO_PASSWORD=replace-me

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=replace-me

JWT_SECRET=replace-me
AES_PASSWORD=replace-me
AES_SALT=replace-me
AES_IV=replace-me

CDN_ADAPTER=qiniu
CDN_ACCESS_KEY=replace-me
CDN_SECRET_KEY=replace-me
CDN_BUCKET=replace-me
CDN_LINK=https://assets.mirai-mad.com
CDN_GLOBAL_LINK=https://assets-global.mirai-mad.com
CDN_FRONTEND_DOMAIN=https://mirai-mad.com
```

4. 前端生产环境最小配置：

```env
NUXT_PUBLIC_API_BASE=https://mirai-mad.com
NUXT_PUBLIC_API_PREFIX=/mmgcApi
NUXT_PUBLIC_API_LOCAL=http://backend:8055
```

5. 启动服务：

```powershell
docker compose up -d
docker compose ps
docker compose logs -f backend
```

6. 安装 Nginx 配置：

- 使用 `env/nginx.mmgc.conf.example` 作为模板。
- 替换域名、证书路径和 upstream。
- 执行 `nginx -t`，通过后 reload。

7. 验证：

```powershell
corepack pnpm --filter mmgc_backend run build
corepack pnpm --filter mirai-offcial-website run build
docker compose ps
```

线上检查：

```text
https://mirai-mad.com/
https://mirai-mad.com/mmgcApi/config/getConfig
https://mirai-mad.com/admin/
https://assets.mirai-mad.com/<known-object-key>
```

## CDN 与域名配置规则

资源域名建议和主站分离：

| 域名 | 必填 | 建议指向 | 说明 |
| --- | --- | --- | --- |
| `mirai-mad.com` | 是 | 主站 CDN 或源站 Nginx | 页面入口 |
| `assets.mirai-mad.com` | 是 | CDN CNAME | 视频、图片、静态资源 |
| `global.mirai-mad.com` | 否 | Cloudflare 或海外源站 | 海外主站，可后续启用 |
| `assets-global.mirai-mad.com` | 否 | Cloudflare -> CDN | 海外资源，可后续启用 |

Agent 需要提醒人类在 CDN 控制台完成：

- 创建对象存储 bucket。
- 创建 CDN 加速域名。
- 将 CDN 源站设置为对象存储或指定源站。
- 给 CDN 域名绑定 HTTPS 证书。
- 在 DNS 中把资源域名 CNAME 到 CDN 提供的目标域名。
- 等待 DNS 生效后再填入 `CDN_LINK` / `CDN_GLOBAL_LINK`。

## 海外节点可选方案

海外节点不是首发部署必需项。启用时按以下顺序处理：

1. 准备海外前端源站，例如雅加达节点。
2. 部署同版本 frontend，确认能访问同一个 API 源站。
3. 配置 `global.mirai-mad.com` 到 Cloudflare。
4. Cloudflare 缓存未命中时回源到七牛云或海外前端源站。
5. 配置 `assets-global.mirai-mad.com` 到 Cloudflare，未命中再回七牛云 CDN/对象存储。
6. 在主站源站或 CDN 边缘增加海外 IP 判断，海外用户切换到 `global.mirai-mad.com`。

没有海外节点时，`CDN_GLOBAL_LINK` 可以先和 `CDN_LINK` 保持一致，或者留空让后端按 `assets.` 推导 `assets-global.`。上线前应确认该推导域名真实存在，否则海外用户可能拿到不可访问的资源地址。
