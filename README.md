# NEON PULSE | VES 个人音乐网站部署指南

这是一个基于 React + Vite 构建的赛博朋克风格音乐个人网站，后端使用 Cloudflare Pages Functions 和 Cloudflare KV 进行无服务器数据存储。

## 🛠️ 准备工作

在开始之前，请确保你拥有：
1.  **Node.js** (推荐 v18 或更高版本)
2.  **Git**
3.  **Cloudflare 账号** (免费版即可)
4.  **GitHub 账号** (用于托管代码并触发自动部署)

---

## 🚀 第一步：本地运行测试

1.  **安装依赖**
    ```bash
    npm install
    ```

2.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    打开浏览器访问 `http://localhost:5173` 查看效果。

---

## ☁️ 第二步：Cloudflare 设置 (关键步骤)

这个项目需要使用 **KV (键值存储)** 来保存你的歌单、文章和设置，否则刷新页面后数据会重置。

### 1. 创建 KV 命名空间
1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2.  进入左侧菜单的 **Workers & Pages** -> **KV**。
3.  点击 **Create a Namespace**。
4.  命名为 `ves_site_data` (或者你喜欢的任何名字)，点击 **Add**。
5.  **记下这个 Namespace 的 ID**，稍后会用到。

### 2. 准备同步密钥 (Sync Secret)
你需要想一个复杂的密码，用于后台管理面板和云端数据库之间的通信验证。
*   例如：`MySuperSecretPassword2025!`
*   请记住这个密码，稍后在部署配置和后台都要用到。

---

## 📦 第三步：部署到 Cloudflare Pages

### 方法 A：通过 GitHub 自动部署 (推荐)

1.  将你的代码上传到 GitHub 仓库。
2.  登录 Cloudflare Dashboard，进入 **Workers & Pages**。
3.  点击 **Create application** -> **Pages** -> **Connect to Git**。
4.  选择你的 GitHub 仓库。
5.  **构建配置 (Build settings)**:
    *   **Framework preset**: 选择 `Vite`
    *   **Build command**: `npm run build`
    *   **Output directory**: `dist`
6.  **点击 "Save and Deploy"**。

### 方法 B：直接上传 (如果不使用 GitHub)
在项目根目录运行：
```bash
npm run build
```
然后将 `dist` 文件夹手动上传到 Cloudflare Pages (Direct Upload 选项)。

---

## ⚙️ 第四步：配置环境变量与绑定 (至关重要)

项目部署完成后，还需要配置后端权限才能正常工作。

1.  进入你刚创建的 Cloudflare Pages 项目页面。
2.  点击顶部标签栏的 **Settings (设置)**。

### 1. 设置环境变量 (Environment Variables)
进入 **Environment variables** 栏目，添加以下变量：

| 变量名 (Variable name) | 值 (Value) | 说明 |
| :--- | :--- | :--- |
| `SYNC_SECRET` | `你的同步密码` | **必须**。必须与你在后台输入的密码一致，用于保护写入权限。 |
| `VITE_ADMIN_PASSWORD` | `你的后台登录密码` | **可选**。用于登录网站后台，默认为 `admin`。 |

### 2. 绑定 KV 命名空间 (Functions)
进入 **Functions** 栏目，找到 **KV Namespace Bindings** 部分：

1.  点击 **Add binding**。
2.  **Variable name (变量名)**: 必须填写 `SITE_DATA_KV` (大小写敏感，不能改)。
3.  **KV Namespace**: 选择你在第二步创建的那个命名空间 (`ves_site_data`)。
4.  点击 **Save**。

> **注意**：修改配置后，你需要去 **Deployments** 选项卡，点击最新的部署右侧的三个点，选择 **Retry deployment** (重新部署) 才能生效。

---

## 🎛️ 第五步：后台使用说明

1.  打开你部署好的网站链接 (例如 `https://your-site.pages.dev`)。
2.  点击右上角的 **齿轮图标** (或使用手机端的菜单)。
3.  输入后台密码 (默认 `admin` 或你设置的 `VITE_ADMIN_PASSWORD`)。
4.  进入 **"云端同步 (Cloud)"** 标签页。
5.  在 **"全站数据同步 (System Sync)"** 区域：
    *   在 **Sync Secret Key** 输入框中填入你在环境变量里设置的 `SYNC_SECRET`。
    *   点击 **"推送到云端"**。
6.  如果提示“成功”，说明配置完成！以后访客访问网站就能看到你更新的数据了。

---

## 📂 (可选) 配置大文件存储

如果你需要上传音频文件或图片，建议使用对象存储：

1.  在后台的 **"云端同步"** -> **"文件对象存储"** 中配置。
2.  支持 **Cloudflare R2** (推荐，免费额度大)、**阿里云 OSS** 或 **OneDrive**。
3.  填入对应的 Access Key 和 Endpoint 即可连接。

## 🛠️ 常见问题排查

*   **问：为什么点击“推送到云端”提示 500 错误？**
    *   答：通常是因为没有在 Cloudflare Settings -> Functions 里绑定 KV，或者变量名不是 `SITE_DATA_KV`。请检查绑定并重新部署。
*   **问：为什么提示 403 Unauthorized？**
    *   答：你输入的 Sync Secret 与 Cloudflare 环境变量里的 `SYNC_SECRET` 不一致。
*   **问：修改了代码上传后没变化？**
    *   答：Cloudflare Pages 可能有缓存，稍等几分钟或在浏览器强制刷新。
