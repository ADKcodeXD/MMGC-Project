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

**Docker 部署时务必：**
- 后端使用 **host 网络**，在服务器后端 env 里写 `MONGO_PATH=mongodb://127.0.0.1:27017`、`REDIS_HOST=127.0.0.1`（直连宿主机）。
- 后端 env 里 `MMGC_PREFIX=/mmgcApi` 且**等号两边不要有空格**，否则接口 404。
- 前端 env 里 `NUXT_PUBLIC_API_LOCAL=http://host.docker.internal:8055`（后端在宿主机 8055，前端容器通过该地址访问）。
