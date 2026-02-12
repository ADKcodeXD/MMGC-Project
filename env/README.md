# 环境配置说明

## 服务器 .env（项目根目录）

部署时从**阿里云 ACR** 拉镜像（国内快），在项目根目录创建或编辑 `.env`，写入：

```env
# 使用阿里云镜像仓库（把下面换成你的 ACR 地址）
IMAGE_REGISTRY=crpi-azw9tnt1yp2keikm.cn-shenzhen.personal.cr.aliyuncs.com/mmgc
```

不设置 `IMAGE_REGISTRY` 时，默认从 `ghcr.io/adkcodexd` 拉取，国内会较慢。

## 后端 / 前端 env 文件

- `backend.env.production`、`frontend.env.production` 见同目录下 `*.example` 模板。
- 生产服务器若使用固定路径，见 `docker-compose.production.yml` 中的挂载路径（如 `/www/wwwroot/env/`）。
