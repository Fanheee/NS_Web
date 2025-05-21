# NetShaper - 差分隐私流量整形保护者

这是一个炫酷的NetShaper登录系统，具有注册、登录和用户管理功能，使用Node.js服务器和JSON文件存储用户数据。

## 功能特点

- 炫酷的粒子背景效果
- 动态登录/注册表单切换
- 使用JSON文件进行用户数据存储
- 响应式设计，适配不同设备
- 霓虹灯和发光按钮效果
- 表单验证功能
- 用户管理控制面板
- 差分隐私流量整形模拟界面

## 如何使用

### 准备工作
1. 确保已安装Node.js（建议v14.0.0以上版本）
2. 下载或克隆本仓库
3. 添加背景图片：
   - 在`assets/images`文件夹中放入两张背景图片：
     - `cyber-bg.jpg` - 登录页面背景
     - `dashboard-bg.jpg` - 控制面板背景
   - 您可以根据`assets/images/README.md`中的说明获取合适的图片

### 安装依赖
在项目根目录下运行以下命令安装依赖：
```
npm install
```

### 启动服务器
运行以下命令启动服务器：
```
npm start
```
或者启动开发模式（自动重启）：
```
npm run dev
```

### 访问网站
启动服务器后，在浏览器中访问:
```
http://localhost:3000
```

## 项目结构
```
NetShaper/
├── assets/           # 资源文件夹
│   └── images/       # 图片资源
│       ├── cyber-bg.jpg       # 登录页面背景
│       └── dashboard-bg.jpg   # 控制面板背景
├── css/              # 样式文件
│   ├── style.css     # 登录页面样式
│   └── dashboard.css # 控制面板样式
├── js/               # JavaScript文件
│   ├── script.js     # 登录页面脚本
│   └── dashboard.js  # 控制面板脚本
├── data/             # 数据存储文件夹
│   └── users.json    # 用户数据JSON文件
├── index.html        # 登录/注册页面
├── dashboard.html    # 控制面板页面
├── server.js         # Node.js服务器文件
├── package.json      # 项目依赖配置
└── README.md         # 项目说明文件
```

## 技术栈

- **前端**:
  - HTML5
  - CSS3 (动画、过渡、变量等)
  - JavaScript (ES6+)
  - Particles.js (粒子效果)
  - Font Awesome (图标)
  - Google Fonts (字体)

- **后端**:
  - Node.js
  - Express.js (服务器框架)
  - 文件系统(fs)模块 (JSON文件存储)

## 注意事项

- 本项目仅用于演示目的，不建议用于生产环境
- 密码使用简单的Base64编码存储，实际应用中应使用更安全的加密方式
- 没有会话管理或JWT实现，实际应用中应添加这些功能

## 演示模式

如果您不想启动服务器，可以在登录失败时选择"使用本地模式"，这将跳过服务器验证，直接进入演示控制面板。

## 背景图片获取方式

您可以从以下来源获取适合的背景图片：

1. [Unsplash](https://unsplash.com/s/photos/cyber-security) - 搜索"cyber security"或"hacker"
2. [Pexels](https://www.pexels.com/search/cyber%20security/) - 搜索"cyber security"
3. [Freepik](https://www.freepik.com/search?format=search&query=cyber%20security) - 搜索"cyber security"

下载后将图片重命名为 `cyber-bg.jpg` 并放入 `assets/images` 文件夹中。

## 技术栈

- HTML5
- CSS3 (动画、过渡、变量等)
- JavaScript (ES6+)
- Particles.js (粒子效果)
- Font Awesome (图标)
- Google Fonts (字体)

## 注意事项

- 本项目仅用于演示目的，不建议用于生产环境
- 用户数据存储在浏览器的LocalStorage中，清除浏览器数据会导致数据丢失
- 密码使用简单的Base64编码存储，并不安全，实际应用中应使用更安全的加密方式 