# 命运之签（Fate Draw）

一款以 3A 游戏级视觉风格打造的沉浸式每日抽签网站。用户每天轻触签筒抽取固定运势签文，结果保存在浏览器本地，并可将签文卡片保存为图片分享。

## 技术栈

- [Vue 3](https://vuejs.org/) + TypeScript
- [Vite](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [GSAP](https://gsap.com/) 动画
- [html-to-image](https://github.com/bubkoo/html-to-image) 签文卡片导出

## 项目结构

```
daily-sign/
├── fate-draw-app/          # 前端应用（Vue + Vite）
│   ├── src/
│   │   ├── components/     # UI 组件
│   │   ├── data/           # 108 条签文数据
│   │   ├── utils/          # 抽签逻辑与本地存储
│   │   └── ...
│   ├── public/
│   └── dist/               # 构建产物（部署时使用）
└── README.md
```

## 本地开发

### 环境要求

- Node.js 20+
- npm 10+

### 安装依赖

```bash
cd fate-draw-app
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认访问地址：<http://localhost:5173>

### 构建与预览

```bash
# 生产构建
npm run build

# 本地预览构建结果
npm run preview
```

## 部署到 Cloudflare Pages

本项目为纯静态前端，无需后端服务，适合直接部署到 [Cloudflare Pages](https://pages.cloudflare.com/)。

### 方式一：Dashboard 连接 Git 仓库（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选择本仓库并授权
3. 填写构建设置：

| 配置项 | 值 |
|--------|-----|
| **Production branch** | `main`（或你的默认分支） |
| **Root directory** | `fate-draw-app` |
| **Build command** | `npm ci && npm run build` |
| **Build output directory** | `dist` |

4. **Environment variables**（可选）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_VERSION` | `20` | 指定 Node.js 版本 |

5. 点击 **Save and Deploy**，等待首次构建完成

部署成功后，Pages 会提供一个 `*.pages.dev` 预览域名，可在 **Custom domains** 中绑定自己的域名。

### 方式二：Wrangler CLI 手动部署

```bash
cd fate-draw-app
npm install
npm run build
npx wrangler pages deploy dist --project-name=fate-draw
```

首次运行会提示登录 Cloudflare 账号并创建 Pages 项目。

### 部署说明

- 应用为单页应用（SPA），无服务端路由依赖，构建产物可直接托管
- 抽签记录保存在浏览器 `localStorage`，不依赖服务器
- 每次推送到已连接的分支会自动触发重新构建与部署

## 功能概览

- 每日一签：同一设备同一天结果固定
- 108 条签文：上 / 中 / 下签按比例分布
- 摇签动画：签筒摇动、飞签、签文展开
- 本地历史：保留最近 30 次抽签记录
- 签文分享：一键导出 PNG 签文卡片

## 许可证

Private
