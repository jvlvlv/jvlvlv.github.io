# 智能车手记 —— 一个零构建的个人博客

一个纯静态博客：没有 Node、没有 Hugo、没有编译步骤。**推上去就是网站**，默认托管在 GitHub Pages 的免费域名上，以后随时可以换成你自己的域名。

- 用 Markdown 写文章（表格、代码块、引用、图片、B 站视频都支持）
- 手机上自动适配，支持深色模式
- 零依赖、零构建、零服务器费用

---

## 一、先上线（约 10 分钟，不用装任何软件）

### 1. 建仓库

打开 <https://github.com/new>：

- **Repository name** 填 `你的用户名.github.io`（例如用户名是 `xiaoming`，就填 `xiaoming.github.io`）
  > 这样填的好处是网址直接就是 `https://xiaoming.github.io`，最短最省事。
- 选 **Public**（Private 仓库的 Pages 要付费）
- 勾上 **Add a README file**，点 **Create repository**

### 2. 把文件传上去

在仓库首页点 **Add file → Upload files**，把 `smartcar-blog` 文件夹里的**全部内容**（`index.html`、`assets`、`posts`、`images` 这些，不是文件夹本身）拖进去，点 **Commit changes**。

> 网页上传时，以 `.` 开头的隐藏文件 `.nojekyll` 可能会被漏掉。补救办法：仓库首页 **Add file → Create new file**，文件名填 `.nojekyll`，内容留空，提交即可。
> 用 GitHub Desktop 上传则不会有这个问题。

### 3. 开启 Pages

仓库 **Settings → Pages**：

- **Source** 选 `Deploy from a branch`
- **Branch** 选 `main`，目录选 `/ (root)`，点 **Save**

等 1～2 分钟，刷新这个页面，顶部出现 *Your site is live at …* 就好了：

```
https://你的用户名.github.io
```

> 用 GitHub Desktop 也行：`File → Add local repository` 选这个文件夹 → `Publish repository`。

---

## 二、写一篇新文章

**第 1 步**：在 GitHub 上打开 `posts/` 目录 → **Add file → Create new file**，文件名用 `日期-英文短名.md`，比如 `2026-12-01-pcb-v2.md`。

**第 2 步**：内容直接写 Markdown，不用写标题（标题在下一步填）。想要模板就复制 `posts/00-template.md`。

**第 3 步**：打开 `posts/index.json`，在最前面加一段：

```json
  {
    "slug": "2026-12-01-pcb-v2",
    "title": "第二版 PCB 打样回来了",
    "date": "2026-12-01",
    "tags": ["硬件", "PCB"],
    "summary": "一句话摘要，会显示在列表里。"
  },
```

注意：
- `slug` 必须和 `.md` 文件名一致（不带 `.md`）
- 上一段结尾要有逗号，最后一段结尾不能有逗号
- `tags` 会出现在首页的标签筛选里

提交后等一两分钟，刷新首页就能看到。**新文章按日期自动排序，不用管顺序。**

---

## 三、把站点改成你自己的

| 要改什么 | 改哪里 |
|---|---|
| 站名、副标题、作者、GitHub 链接 | `assets/app.js` 最上面的 `SITE` |
| 关于页的赛车档案、邮箱 | `about.html` |
| 浏览器标签页上的标题 | `index.html`、`post.html`、`about.html` 里的 `<title>` |

站名和副标题改完 `app.js` 就会自动生效（`index.html` 里那两处文字是给禁用 JS 的浏览器兜底的，顺手一起改掉更整齐）。

---

## 四、以后想用自己的域名

先用 `xxx.github.io` 写几个月，确认自己真的会坚持写，再花钱买域名也不迟。真要买的时候按这个来：

### 1. 买域名（约 ¥30～80/年）

阿里云 / 腾讯云（国内，备案要求看下文）、Namecheap、Cloudflare（后两个不需要实名）。推荐 `.com`、`.me`、`.dev`，别贪便宜买奇怪的国别后缀。

### 2. 仓库里加一个 `CNAME` 文件

仓库根目录新建文件，**文件名 `CNAME`**（无后缀），内容只有一行你的域名，例如：

```
blog.example.com
```

### 3. 到域名服务商那儿配 DNS 解析

| 类型 | 主机记录 | 记录值 |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `你的用户名.github.io` |

（如果用的是 `blog.example.com` 这种子域名，只需要一条 CNAME：`blog` → `你的用户名.github.io`）

A 记录的四个 IP 是 GitHub Pages 的固定地址，四条都要加，任一条挂掉还有别的顶着。

### 4. 回到 Settings → Pages

- **Custom domain** 填你的域名 → Save
- 等证书签发（几分钟到 24 小时），然后勾上 **Enforce HTTPS**

### 5. 两个坑

- **备案**：GitHub Pages 的服务器在境外，**不需要 ICP 备案**。但国内注册商要求域名实名，且如果以后想用国内服务器就得备案。
- **访问速度**：GitHub Pages 在国内时快时慢，图片多的话更明显。如果以后嫌慢，可以套一层 Cloudflare（免费）加速，或者把站点迁到 Vercel / Cloudflare Pages——因为这个博客是纯静态的，**换托管方就是拖一遍文件，别的一行都不用改**。

---

## 五、关于网络（梯子、国内访问速度）

这套站点的设计目标之一就是**不依赖任何境外资源**，所以日常使用完全不需要梯子：

- 页面里没有 Google Fonts、没有 CDN 上的 JS 库、没有统计脚本。图标是内联 SVG，字体用系统自带的，打开页面只有站内请求。
- 前端零构建：不用装 Node、不用 `npm install`、不用下载 Hugo 二进制。Pages 的构建在 GitHub 服务器上跑，你本地什么都不用装。
- 唯一的外链是 B 站播放器（文章里用了 `@bilibili` 才会有），它在国内是通的。

**可能真的需要梯子的只有一步**：`git push` 到 github.com。GitHub 在国内时快时慢，网页上传小文件一般能忍；如果提交反复失败（`Failed to connect to github.com port 443`），要么再开梯子，要么改用 GitHub Desktop 重试——它比命令行好重试。

你的读者不需要梯子，除非你自己买了个被墙的域名（一般不会）。

---

## 六、本地预览（可选）

直接双击 `index.html` 是**看不到文章**的——浏览器出于安全策略会拦截 `fetch` 读取本地文件。要么传到 GitHub 上看，要么起一个本地服务器：

```bash
# 在博客文件夹里执行
python -m http.server 8000
```

然后打开 <http://127.0.0.1:8000>。用 VS Code 的话装个 Live Server 插件也一样。

---

## 七、常见问题

**首页一直转圈 / 显示"加载中"**
`posts/index.json` 的 JSON 写坏了（多半是少了或多了逗号）。用 <https://jsonlint.com> 粘进去检查一下。

**文章打开是 404，或者提示"没有找到这篇文章"**
`index.json` 里的 `slug` 和 `posts/` 下的文件名对不上，注意大小写。

**图片不显示**
路径是相对站点根目录的：`images/xxx.jpg`，别写成 `/images/xxx.jpg` 或本地绝对路径。

**视频**
别把视频文件传进仓库（几十兆的视频会让仓库很难用）。传到 B 站，文章里单独一行写 `@bilibili BV号`。

**改了没生效**
浏览器缓存，强制刷新（Ctrl+F5），或者等 GitHub 构建完（Actions 里能看进度）。

**图片太大**
手机拍的照片动辄 5MB，压到 200KB 以内（WebP 或 JPG）再传，加载体验差别巨大。

---

## 文件结构

```
.
├─ index.html          首页（文章列表）
├─ post.html           文章页，地址形如 post.html?p=slug
├─ about.html          关于 / 赛车档案
├─ 404.html            找不到页面时显示
├─ .nojekyll           告诉 GitHub Pages 不要用 Jekyll 处理
├─ assets/
│  ├─ style.css        样式
│  ├─ app.js           站点配置 + 页面逻辑（改站名来这里）
│  └─ md.js            极简 Markdown 渲染器
├─ posts/
│  ├─ index.json       文章目录（每篇文章在这里登记一条）
│  ├─ 00-template.md   新文章模板（不显示在列表中）
│  └─ *.md             文章正文
└─ images/             图片
```
