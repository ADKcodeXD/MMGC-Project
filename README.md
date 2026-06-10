<div align="center">

<img src=".github/assets/banner.png" alt="MMGC Banner" width="100%" />

# 🎬 MMGC — Mirai Mad Global Community

**未来 MAD 全球社区 · 活動管理 & 影像展示平台**

[![Build & Deploy](https://github.com/ADKcodeXD/MMGC-Project/actions/workflows/deploy.yml/badge.svg)](https://github.com/ADKcodeXD/MMGC-Project/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

[**🌐 线上地址**](https://mirai-mad.com) · [**📖 文档**](#-快速开始) · [**🐛 提交 Issue**](https://github.com/ADKcodeXD/MMGC-Project/issues)

</div>

---

## 📋 目录

- [✨ 项目简介](#-项目简介)
- [🏗️ 系统架构](#️-系统架构)
- [🛠️ 技术栈](#️-技术栈)
- [📂 项目结构](#-项目结构)
- [🚀 快速开始](#-快速开始)
- [🐳 Docker 部署](#-docker-部署)
- [⚙️ CI/CD 流水线](#️-cicd-流水线)
- [🤝 贡献指南](#-贡献指南)
- [📄 开源协议](#-开源协议)

---

## ✨ 项目简介

**MMGC (Mirai Mad Global Community)** 是未来 MAD 团队的官方活动管理 & 影像展示平台。平台支持多语言（中/英/日），提供从活动创建、作品投稿、成员管理到数据统计的完整生态。

### 🎯 核心功能

| 模块               | 说明                                                      |
| ------------------ | --------------------------------------------------------- |
| 🎉 **活动管理**    | 创建/管理 MAD 活动（MMGC 赛事），设置赛程、轮次、工作人员 |
| 🎬 **作品展示**    | 影像作品管理，支持视频播放、Bilibili 数据同步             |
| 👥 **成员系统**    | 社区成员注册、登录、个人主页、头像管理                    |
| 💬 **评论互动**    | 活动/作品评论系统                                         |
| 🏆 **赞助商管理**  | 活动赞助商展示与管理                                      |
| 📊 **数据统计**    | 活动数据大屏、播放量/投稿统计                             |
| 📱 **移动端适配**  | 完整的移动端页面体验                                      |
| 🌍 **i18n 多语言** | 中文 / English / 日本語                                   |
| 📧 **邮件服务**    | 活动通知、验证邮件                                        |
| 🤖 **AI 翻译**     | 基于 OpenAI 兼容接口的内容自动翻译                        |

---

## 🏗️ 系统架构

```
                         ┌─────────────────────────────────┐
                         │          Nginx (服务器)           │
                         │       反向代理 & SSL 终止         │
                         └────┬──────────┬──────────┬───────┘
                              │          │          │
                         :3000│     :8055│     :8080│
                              ▼          ▼          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Docker Compose                               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Frontend   │  │   Backend    │  │    Admin     │              │
│  │   Nuxt 3     │  │  Koa2 + TS   │  │  Vue 3 SPA  │              │
│  │   SSR/SSG    │  │   REST API   │  │  Ant Design  │              │
│  │   :3000      │  │   :8055      │  │  Nginx :80   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘              │
│         │                 │                                         │
│         │     ┌───────────┼───────────┐                            │
│         │     ▼           ▼           ▼                            │
│         │  ┌──────┐  ┌────────┐  ┌────────────┐                   │
│         │  │Redis │  │MongoDB │  │  七牛云 CDN  │                   │
│         │  │  7   │  │   6    │  │  对象存储    │                   │
│         │  └──────┘  └────────┘  └────────────┘                   │
│         │                                                          │
│         └── SSR 请求通过 Docker 内部网络 → backend:8055             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 技术栈

### Frontend — `apps/frontend`

| 技术                                      | 说明                     |
| ----------------------------------------- | ------------------------ |
| [Nuxt 3](https://nuxt.com/)               | Vue 3 全栈框架 (SSR/SSG) |
| [Vue 3](https://vuejs.org/)               | 渐进式前端框架           |
| [Element Plus](https://element-plus.org/) | UI 组件库                |
| [Varlet UI](https://varlet.gitee.io/)     | 移动端组件库             |
| [UnoCSS](https://unocss.dev/)             | 原子化 CSS 引擎          |
| [Pinia](https://pinia.vuejs.org/)         | 状态管理                 |
| [Vue I18n](https://vue-i18n.intlify.dev/) | 国际化 (cn/en/jp)        |

### Backend — `apps/backend`

| 技术                                                 | 说明                    |
| ---------------------------------------------------- | ----------------------- |
| [Koa 2](https://koajs.com/)                          | 轻量级 Node.js Web 框架 |
| [TypeScript](https://www.typescriptlang.org/)        | 类型安全                |
| [Mongoose](https://mongoosejs.com/)                  | MongoDB ODM             |
| [ioredis](https://github.com/redis/ioredis)          | Redis 客户端            |
| [PM2](https://pm2.keymetrics.io/)                    | 进程管理（生产环境）    |
| [JWT](https://jwt.io/)                               | 身份认证                |
| [Log4js](https://log4js-node.github.io/log4js-node/) | 日志系统                |

### Admin — `apps/MMGCBACK`

| 技术                                                       | 说明             |
| ---------------------------------------------------------- | ---------------- |
| [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)  | 前端构建         |
| [Ant Design Vue](https://antdv.com/)                       | 企业级 UI 组件库 |
| [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) | 后台管理模板     |
| [ECharts](https://echarts.apache.org/)                     | 数据可视化       |
| [wangEditor](https://www.wangeditor.com/)                  | 富文本编辑器     |

### 基础设施

| 技术                                                  | 说明              |
| ----------------------------------------------------- | ----------------- |
| [Docker Compose](https://docs.docker.com/compose/)    | 容器编排          |
| [Turborepo](https://turbo.build/)                     | Monorepo 构建系统 |
| [pnpm](https://pnpm.io/)                              | 高效包管理器      |
| [GitHub Actions](https://github.com/features/actions) | CI/CD 流水线      |
| [GHCR](https://ghcr.io) + 阿里云 ACR                  | 容器镜像仓库      |

---

## 📂 项目结构

```
MMGC-Project/
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI/CD 流水线
├── apps/
│   ├── frontend/                # 🌐 前端 (Nuxt 3 SSR)
│   │   ├── pages/               #    页面路由
│   │   ├── components/          #    公共组件
│   │   ├── server/              #    服务端 API 代理
│   │   ├── i18n/                #    国际化配置
│   │   └── Dockerfile           #    前端容器构建
│   ├── backend/                 # ⚙️ 后端 (Koa2 + TypeScript)
│   │   ├── src/
│   │   │   ├── controller/      #    控制器（活动/作品/成员...）
│   │   │   ├── entity/          #    数据模型 (Mongoose)
│   │   │   ├── service/         #    业务逻辑
│   │   │   ├── middleware/      #    中间件（鉴权/日志/CORS）
│   │   │   └── router/          #    路由定义
│   │   └── Dockerfile           #    后端容器构建
│   └── MMGCBACK/                # 🔧 Admin 管理后台 (Vue 3 SPA)
│       ├── src/views/           #    管理页面
│       │   ├── management/      #      活动/成员/作品/赞助商管理
│       │   ├── dashboard/       #      数据看板
│       │   └── form/            #      表单页
│       └── Dockerfile           #    Admin 容器构建
├── env/                         # 🔐 环境变量模板
├── docker-compose.yml           # 🐳 基础编排
├── docker-compose.production.yml#    生产环境覆盖
├── turbo.json                   # ⚡ Turborepo 配置
├── pnpm-workspace.yaml          # 📦 Monorepo 工作区
└── package.json                 # 📋 根配置
```

---

## 🚀 快速开始

### 前置要求

- **Node.js** ≥ 22
- **pnpm** ≥ 9
- **MongoDB** ≥ 6
- **Redis** ≥ 7

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/ADKcodeXD/MMGC-Project.git
cd MMGC-Project

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp apps/backend/.env.development.example apps/backend/.env.development
# 编辑 .env.development 填写 MongoDB / Redis 等配置

# 4. 启动所有服务
pnpm dev
```

各服务地址：

- 🌐 Frontend: `http://localhost:3000`
- ⚙️ Backend API: `http://localhost:8055/mmgcApi`
- 🔧 Admin: `http://localhost:8080`

---

## 🐳 Docker 部署

### 一键部署（推荐）

```bash
# 1. 配置环境变量
mkdir -p env
cp env/backend.env.production.example env/backend.env.production
cp env/frontend.env.production.example env/frontend.env.production
# 编辑 env/ 下的文件，填写实际配置

# 2. 启动所有服务（含 MongoDB + Redis）
docker compose up -d

# 3. 查看日志
docker compose logs -f
```

### 生产环境部署

```bash
# 使用生产环境覆盖（挂载服务器特定数据目录 & 环境变量）
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

### 服务端口

| 服务     | 端口    | 说明                  |
| -------- | ------- | --------------------- |
| Frontend | `3000`  | Nuxt SSR              |
| Backend  | `8055`  | REST API (`/mmgcApi`) |
| Admin    | `8080`  | SPA 管理后台          |
| MongoDB  | `27017` | 数据库                |
| Redis    | `6379`  | 缓存                  |

> 💡 生产环境建议通过 Nginx 反向代理统一对外，不直接暴露服务端口。

---

## ⚙️ CI/CD 流水线

推送到 `master` 分支自动触发 GitHub Actions，完成以下流程：

```
代码推送 (master)
    │
    ▼
┌──────────────────────────────────────────────┐
│  GitHub Actions                              │
│                                              │
│  1. 📦 构建 Docker 镜像                       │
│     ├── mmgc-backend                         │
│     ├── mmgc-frontend                        │
│     └── mmgc-admin                           │
│                                              │
│  2. 🚀 推送到 GHCR (ghcr.io)                 │
│                                              │
│  3. 🌏 同步到阿里云 ACR (可选, 国内加速)       │
│                                              │
│  4. 🔄 SSH 部署到服务器                       │
│     ├── git pull                             │
│     ├── docker compose pull                  │
│     └── docker compose up -d                 │
└──────────────────────────────────────────────┘
```

### 所需 Secrets 配置

| Secret                     | 说明                    |
| -------------------------- | ----------------------- |
| `SSH_HOST`                 | 服务器 IP               |
| `SSH_USERNAME`             | SSH 用户名              |
| `SSH_PASSWORD` / `SSH_KEY` | SSH 密码或密钥          |
| `SSH_PORT`                 | SSH 端口                |
| `PROJECT_PATH`             | 服务器上项目路径        |
| `ALIYUN_ACR_*`             | 阿里云 ACR 配置（可选） |

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**Made with ❤️ by [ADK](https://github.com/ADKcodeXD) & Mirai Mad Team**

</div>
