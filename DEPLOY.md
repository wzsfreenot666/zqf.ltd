# zqf.ltd 部署指南

## 项目结构

```
zqf.ltd/
├── index.html              # 首页（工具导航）
├── css/
│   └── style.css           # 全局样式
├── tools/
│   ├── utility.html        # 实用工具分类页
│   ├── fun.html            # 趣味工具分类页
│   ├── text.html           # 文本工具分类页
│   ├── storage.html        # 文件存储页
│   ├── image-compress.html # 图片压缩
│   ├── qrcode.html         # 二维码生成
│   ├── color-picker.html   # 颜色选择器
│   ├── unit-convert.html   # 单位换算
│   ├── dice.html           # 掷骰子
│   ├── lottery.html        # 随机抽奖
│   ├── coin-flip.html      # 抛硬币
│   ├── countdown.html      # 倒计时器
│   ├── markdown.html       # Markdown 编辑器
│   ├── word-count.html     # 字数统计
│   ├── json-format.html    # JSON 格式化
│   └── base64.html         # Base64 编解码
└── DEPLOY.md               # 本文件
```

## 部署到 Cloudflare Pages

### 方法一：通过 Git 仓库自动部署（推荐）

1. 将整个项目文件夹推送到 GitHub 仓库
2. 登录 Cloudflare Dashboard → Pages → Create a project
3. 连接你的 GitHub 仓库
4. 构建配置：
   - Framework preset: `None`
   - Build command: （留空）
   - Build output directory: `/`（根目录）
5. 点击 Save and Deploy

### 方法二：通过 Wrangler CLI 直接上传

```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署（在项目根目录执行）
wrangler pages deploy . --project-name=zqf-ltd
```

### 方法三：通过 Dashboard 直接上传

1. 登录 Cloudflare Dashboard → Pages → Create a project
2. 选择 "Direct Upload"
3. 将整个项目文件夹拖拽上传
4. 点击 Deploy

## 绑定自定义域名

1. 进入 Pages 项目 → Custom domains
2. 添加 `zqf.ltd`
3. 如果域名 DNS 已在 Cloudflare 管理，会自动添加 CNAME 记录
4. HTTPS 证书会自动签发，无需额外配置

## 特点

- **纯静态网站**：所有工具在浏览器端运行，无需后端服务器
- **零依赖**：仅二维码工具引用了 CDN 上的 qrcode.js 库
- **文件存储**：使用浏览器 IndexedDB，数据不离开用户的浏览器
- **加载极快**：Cloudflare CDN 全球加速，纯 HTML/CSS/JS 无框架开销
```
