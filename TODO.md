# MMGC Project TODO

本文件给后续 LLM 和协作者快速了解当前进度。改动前请先阅读 `AGENTS.MD`。

## 当前方向

- 旧 Admin：`apps/MMGCBACK`，当前仍是可用后台，继续保留。
- 新 Admin 模板：`apps/admin-next`，先作为轻量后台迁移模板，不立即引入依赖。
- 前台：`apps/frontend`。
- 后台：`apps/backend`。

## 已完成

- 新建 `apps/admin-next` React Admin 模板，作为旧 `apps/MMGCBACK` 的并行替换方向。
- `apps/admin-next` 已包含登录、Dashboard、活动与天数、视频管理、云运维页面雏形。
- 新后台活动天数支持抽屉新增、删除和拖拽排序。
- 新后台视频管理支持搜索、活动/Day 筛选、抽屉新增/编辑、删除和拖拽排序。
- Docker 新增 `apps/admin-next/Dockerfile`，workflow 已把 `mmgc-admin:latest` 切换为从 `apps/admin-next` 构建。
- Admin 增加 `dev:adminonline` 线上 API 调试模式。
- 修复 Admin 本地线上 API 代理：`/api` 代理到 `https://mirai-mad.com/mmgcApi`。
- Dashboard 增加七牛云流量、国内/海外流量、存储、费用估算相关接口和展示。
- 修复 AI 翻译链路：前端返回值解包、后端 JSON 解析稳定性。
- 完善前台 sitemap：从活动和作品接口生成多语言动态路由。
- 播放器支持真实 `.m3u8` 播放，但已回滚“自动把 `.mp4` 猜测替换为 `.m3u8`”逻辑。
- 播放器设置 `preload="metadata"`，减少未播放前的无效视频预加载。

## 待办：短期修旧 Admin

- 视频卡片 UI：
  - 固定封面比例。
  - 标题两行省略。
  - 操作区固定高度。
  - 移动端单列或双列自适应。
- 投稿表单：
  - 分区为基础信息、翻译、视频、外链、关联信息。
  - AI 翻译按钮改为统一组件，避免覆盖已有人工内容。
  - 日期、上传、远程选择组件宽度改为响应式，避免固定 `600px`。
- 性能：
  - 移除或关闭旧模板非业务功能：主题配置抽屉、多标签页缓存、示例页、无用动画。
  - TinyMCE、ECharts、大表格组件按路由懒加载。
  - 表格默认分页，图片懒加载。
- Dashboard：
  - 增加国内/海外流量趋势和占比。
  - 增加流量异常提示。
  - 增加每日费用估算走势。

## 待办：新 Admin 模板

- 当前采用技术栈：
  - React + Vite
  - Ant Design 5
  - TanStack Query
  - React Router
  - Zustand
  - Axios
- 首批页面：
  - 登录：已完成基础版
  - Dashboard：已完成基础版
  - 视频管理：已完成基础版，待补完整字段和上传组件
  - 投稿表单：待迁移
  - 活动管理：已完成活动列表和天数管理基础版，待补活动编辑
  - 站点配置：待迁移
  - 统计：已接入 Dashboard/云运维基础指标
- 迁移原则：
  - 新旧后台并行。
  - 先迁移高频业务页面。
  - 不复刻旧模板的复杂主题、标签页、示例功能。
  - API 契约优先复用旧后台已有封装和后端接口。

## 待办：省流与视频分发

- 后台增加视频资源元信息：格式、码率、分辨率、大小、时长。
- 七牛侧规划转码策略：
  - 原片归档。
  - 生成 480p/720p/1080p 多档。
  - HLS 只在真实具备多码率时启用。
- 前台播放器：
  - 后台返回 `.mp4` 就播 `.mp4`。
  - 后台返回 `.m3u8` 就播 HLS。
  - 后续可增加清晰度选择，不做 URL 猜测。
- CDN：
  - 检查视频和切片缓存命中率。
  - 避免每次播放生成不同 query 导致缓存失效。
  - 配置 Referer 防盗链、时间戳签名、异常 IP 限速。

## 待办：AI 能力

- 翻译：
  - 增加翻译预览，不直接覆盖人工填写内容。
  - 支持标题、简介、活动规则、FAQ、赞助商文案。
  - 增加“只补空字段”模式。
- 分析：
  - 作品简介质量检查。
  - SEO 摘要建议。
  - 标签/关键词建议。
  - 表单缺失项检查。

## 常用命令

```powershell
corepack pnpm --filter @mmgc/admin run dev:adminonline
corepack pnpm --filter @mmgc/admin run build
corepack pnpm --filter mmgc_backend run build
corepack pnpm --filter mirai-offcial-website exec nuxi build
```

## 注意事项

- 当前 worktree 可能存在用户或其它 agent 的未提交改动，不能随意 revert。
- 不要删除 `apps/MMGCBACK`，旧后台仍然承担线上管理兜底。
- 不要在没有确认技术栈前给 `apps/admin-next` 添加依赖。
- 如果修改依赖，必须同步 `pnpm-lock.yaml`。
- 如果启动 dev server 产生临时日志，完成后应清理，避免提交。

## Admin Next Migration Priority

Last updated: 2026-06-11

Current instruction:

- Prioritize migration work over exhaustive validation.
- Keep backend API contracts, permissions, deployment service name, and operational architecture aligned with the old admin.
- The main difference should be UI, interaction flow, responsiveness, and removal of old template bloat.
- Old admin remains as fallback, but new work should target `apps/admin-next`.
- Docker and GitHub workflow must keep seamless replacement behavior: production service remains `admin`, image remains `mmgc-admin:latest`, build source moves to `apps/admin-next`.

Current admin-next status:

- React admin package exists at `apps/admin-next`.
- Root scripts added:
  - `corepack pnpm run dev:admin-next`
  - `corepack pnpm run dev:admin-next-online`
  - `corepack pnpm run build:admin-next`
- `corepack pnpm --filter @mmgc/admin-next run build` passes.
- Dockerfile exists but local Docker verification is skipped for now because migration speed is higher priority and local Docker engine was unavailable.

Next migration targets:

- Full movie submit/edit schema parity with old `apps/MMGCBACK` movie form.
- Qiniu upload parity: cover upload, video upload, CDN URL generation, upload status.
- Activity edit/create parity.
- Day edit modal parity, not only create/delete/sort.
- Site config parity.
- Member/author remote selection parity.
- AI translate assistant as non-destructive preview/fill-empty flow.
