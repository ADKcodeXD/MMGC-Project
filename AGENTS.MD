# AGENTS.MD

本文件约束所有在本仓库中工作的自动化 agent 和协作者。改动前先阅读本文件，并优先遵循仓库现有代码、脚本和架构。

## 基本原则

- 做最小化修改。只改为完成当前任务必须修改的文件和逻辑，不做无关重构、格式化或目录整理。
- 保持现有技术栈和项目结构。优先使用仓库已有工具、组件、样式、工具函数和工程约定。
- 不要随便引入新库。只有在现有依赖和标准能力无法合理解决问题时，才考虑新增依赖，并说明原因、影响范围和替代方案。
- 不要随便升级大版本。避免无明确必要的 major version 更新；如确实需要，必须评估 breaking changes，并同步验证受影响的构建、类型和运行路径。
- 不要随便修改 UI 风格。前端改动应保持现有视觉语言、布局密度、组件用法、颜色、间距和交互模式，除非任务明确要求调整设计。
- 不要覆盖用户或他人已有改动。遇到无关的未提交变更时保留它们，只处理当前任务相关内容。

## TypeScript 与代码质量

- 代码必须符合 TypeScript 规范，不引入类型错误。
- 避免使用 `any` 绕过类型系统；确有必要时应收窄作用域，并说明原因。
- 保持类型定义、接口、运行时数据结构一致，避免只修编译不修实际行为。
- 不要用隐式副作用、脆弱的字符串拼接或临时 hack 代替清晰实现。
- 新增逻辑应贴合现有模块边界，不把前端、后端、部署配置的职责混在一起。

## 前端 UI 约束

- 修改 UI 时优先复用现有组件、样式变量、布局方式和图标体系。
- 不引入新的 UI 框架、图标库、CSS 框架或设计体系，除非任务明确要求。
- 避免大范围改色、改字体、改圆角、改间距、改页面结构。
- 修 bug 时只修相关交互和状态，不借机重做页面。
- 保证响应式布局不产生文字溢出、遮挡、错位或不可点击区域。

## 依赖与版本管理

- 使用仓库声明的包管理器：`pnpm@9.15.4`。
- 修改依赖后必须同步更新根 `pnpm-lock.yaml`，并确认 `pnpm install --frozen-lockfile` 可通过。
- workspace 级 pnpm 配置应放在根 `package.json`，不要放在子包中指望其全局生效。
- 不要把临时调试依赖、全局安装依赖或本地机器路径写进项目配置。
- Docker 和 CI 里的 Node/pnpm 版本要与仓库声明保持一致，除非任务明确要求升级。

## 验证要求

- 完成改动后必须做与改动范围匹配的验证。
- TypeScript 相关改动至少运行对应包的类型检查或构建命令。
- 前端 UI 改动需要验证页面能正常构建，并在可行时进行浏览器检查。
- Docker/CI 相关改动需要验证 lockfile、Dockerfile、workflow 配置和相关 build/install 命令。
- 如果某项验证无法运行，必须说明原因、已做的替代验证，以及剩余风险。

## 常用验证命令

按改动范围选择运行，不要求每次全部执行。

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm --filter mmgc_backend run build
corepack pnpm --filter mirai-offcial-website run build
corepack pnpm --filter @mmgc/admin run build
corepack pnpm run build
```

Docker 相关改动可按需验证：

```powershell
docker build -f apps/backend/Dockerfile -t mmgc-backend-test .
docker build -f apps/frontend/Dockerfile -t mmgc-frontend-test .
docker build -f apps/MMGCBACK/Dockerfile -t mmgc-admin-test .
```

## 提交前检查

- 检查 `git diff`，确认只包含当前任务需要的改动。
- 确认没有新增无关依赖、调试代码、临时文件、日志文件或本地环境文件。
- 确认没有无意修改 UI 风格、文案、格式化或锁文件中无关的大范围变动。
- 确认类型、构建或任务相关验证已经通过。
