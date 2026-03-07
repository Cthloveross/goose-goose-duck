# 🪿🦆 鹅鸭杀人格测试 — Goose Duck Personality Quiz

一个基于鹅鸭杀 (Goose Goose Duck) 游戏风格的人格测试 Web 应用。通过 72 道场景题，分析玩家在博弈情境中的行为偏好，匹配 8 种人格原型之一。

---

## 🎮 测试流程

```
首页 → 输入邀请码 → 72 道题（逐题作答）→ 分析动画 → 人格结果卡 → 保存/分享
```

1. **首页** — 展示测试卡片，点击进入
2. **邀请码验证** — 输入邀请码（服务端验证 + 限流 + 次数扣减）
3. **答题** — 72 道中文场景题，每题 4 个选项 (A/B/C/D)，逐题呈现，支持回看
4. **分析动画** — 3 秒加载动画
5. **结果页** — 完整人格报告：主人格 + 副人格 + 八维雷达 + 概述 / 优势 / 盲区 / 建议 + 分享卡片

---

## 🧠 八维人格模型

每道题的每个选项对应一个模块 (module)，答题即计分。72 题作答后，8 个模块得分排名决定你的人格原型：

| 模块 ID | 中文名 | 人格原型 | Emoji |
|---------|--------|---------|-------|
| `logic` | 逻辑推理 | 真相破译者 (The Analyst) | 🔍 |
| `insight` | 洞察直觉 | 读心侦探 (The Empath) | 👁️ |
| `mobility` | 机动操作 | 地图主宰者 (The Scout) | 🗺️ |
| `control` | 控场指挥 | 局势建筑师 (The Commander) | 🎯 |
| `protect` | 守护团建 | 团队守护者 (The Guardian) | 🛡️ |
| `enforce` | 雷霆执行 | 雷霆执行者 (The Enforcer) | ⚡ |
| `manipulate` | 叙事操控 | 叙事幻术师 (The Illusionist) | 🎭 |
| `opportunism` | 机会收割 | 暗夜收割者 (The Opportunist) | 🌙 |

---

## 🛠 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 框架 | **Nuxt 4.3** (Vue 3.5) | SSR / SPA / 文件路由 |
| 样式 | **Tailwind CSS 4** | 原子化 CSS，`@nuxtjs/tailwindcss` |
| 状态 | **Pinia** | 全局 Store + localStorage 持久化 |
| 服务端 | **Nitro** | Nuxt 内置服务引擎，处理 API 路由 |
| 验证 | **Zod** | 可选，数据校验 |
| 测试 | **Vitest** | 12 个单元测试，覆盖评分引擎 |
| 运行时 | **Node.js ≥ 22** | Nuxt 4 要求 `^20.19.0 \|\| >=22.12.0` |

---

## 📁 项目结构

```
goose-quiz/
├── app/                        # Nuxt 4 源码目录（~ alias 指向此处）
│   ├── app.vue                 # 根布局
│   ├── data/
│   │   └── tests/
│   │       └── gooseduck.json  # 📋 72 题问卷数据（中文）
│   ├── lib/
│   │   ├── types.ts            # TypeScript 类型定义
│   │   ├── characters.ts       # 8 种人格原型定义 + 模块标签
│   │   └── scoring.ts          # 纯函数评分引擎（无框架依赖）
│   ├── stores/
│   │   └── quiz.ts             # Pinia Store（答题状态 + localStorage）
│   └── pages/
│       ├── index.vue           # 首页
│       └── t/[testId]/
│           ├── index.vue       # 🔐 邀请码验证页
│           ├── quiz.vue        # 📝 答题页（72 题逐题）
│           ├── analyzing.vue   # ⏳ 分析动画页
│           └── result.vue      # 📊 结果页 + 分享卡片
├── server/
│   ├── api/
│   │   └── codes/
│   │       └── verify.post.ts  # POST /api/codes/verify — 邀请码验证 API
│   └── data/
│       └── access-codes.json   # 邀请码数据库（JSON）
├── tests/
│   └── scoring.test.ts         # 评分引擎单元测试（12 个）
├── nuxt.config.ts              # Nuxt 配置
├── tailwind.config.ts          # Tailwind 配置
├── vitest.config.ts            # Vitest 配置
├── tsconfig.json               # TypeScript 配置（引用 .nuxt 生成的）
└── package.json
```

---

## 🚀 快速开始

### 前提条件

- **Node.js ≥ 22.12.0**（推荐用 [nvm](https://github.com/nvm-sh/nvm) 管理）
- **npm**（随 Node 附带）

### 1. 安装 Node 22（如尚未安装）

```bash
# 安装 nvm（如未安装）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh

# 安装并使用 Node 22
nvm install 22
nvm use 22

# 确认版本
node -v  # 应 ≥ v22.12.0
```

### 2. 安装依赖

```bash
cd goose-quiz
npm install
```

### 3. 生成类型

```bash
npx nuxi prepare
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 **http://localhost:3000**

### 5. 运行测试

```bash
npm test
```

预期输出：

```
 ✓ tests/scoring.test.ts (12 tests) 8ms
 Test Files  1 passed (1)
      Tests  12 passed (12)
```

### 6. 生产构建

```bash
npm run build
npm run preview  # 预览生产构建
```

---

## 🔐 邀请码

邀请码存储在 `server/data/access-codes.json`：

| 邀请码 | 可用次数 | 过期时间 | 说明 |
|--------|---------|---------|------|
| `GOOSE2026` | 999 | 永不过期 | 通用测试码 |
| `DUCK-TEST` | 999 | 永不过期 | 通用测试码 |
| `QUACK123` | 50 | 2026-12-31 | 限量码 |
| `HONK-VIP` | 10 | 永不过期 | VIP 限量码 |
| `BIRDWATCH` | 100 | 永不过期 | 观察者码 |

**安全机制：**
- 每个 IP 最多 5 次失败尝试
- 超出后锁定 10 分钟
- 每次成功使用后可用次数 -1
- 支持过期时间检查

要添加新邀请码，直接编辑 JSON 文件即可：

```json
{ "code": "YOUR-CODE", "usesLeft": 100, "expiresAt": null, "status": "active" }
```

---

## ⚙️ 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (localhost:3000) |
| `npm test` | 运行 Vitest 单元测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npx nuxi prepare` | 重新生成 .nuxt 类型 |

---

## 🧩 评分算法说明

1. **计分**：72 道题，每题选项对应 1 个模块，选中即 +1 分
2. **归一化**：`百分比 = (模块得分 / 已答题数) × 100`
3. **排名**：8 个模块按分数降序排列
4. **匹配**：第 1 名 → 主人格，第 2 名 → 副人格
5. **置信度**：`(第1名分数 - 第2名分数) / 已答题数 × 100`

源码：`app/lib/scoring.ts`（纯函数，无副作用，可独立测试）

---

## 📱 分享卡片

结果页底部自动生成一张 720×1000 的 PNG 分享卡片，包含：

- 人格 Emoji + 名称 + 标语
- Top 6 模块分数条形图
- 关键词标签
- 副人格信息

点击「保存卡片到相册」即可下载。

---

## 📝 License

MIT
