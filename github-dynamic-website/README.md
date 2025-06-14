# Yyds76 GitHub Pages 动态网站

这是一个为Roblox executor设计的动态代码存储库网站。

## 功能特性

- 🔐 密码保护访问 (密码: SuperMiner)
- 🤖 支持Roblox executor自动访问
- 📁 动态文件管理系统
- 🔗 API访问支持 (API Key: yyds_steve_76)
- 📱 响应式设计
- 🌐 Raw模式文件访问

## 使用方法

### 网页访问
1. 访问 https://yyds76.github.io
2. 输入密码: SuperMiner
3. 浏览和管理您的代码文件

### Roblox Executor访问
\`\`\`lua
-- 示例代码
local HttpService = game:GetService("HttpService")
local code = HttpService:GetAsync("https://yyds76.github.io/test")
loadstring(code)()
\`\`\`

### API访问
- Raw文件访问: `https://yyds76.github.io/文件ID`
- 带API密钥: `https://yyds76.github.io/文件ID?api=yyds_steve_76`

## 文件结构
\`\`\`
/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript逻辑
├── roblox-example.lua  # Roblox使用示例
└── README.md           # 说明文档
\`\`\`

## 安全特性
- 密码保护的Web界面
- API密钥验证
- Roblox executor检测
- 会话管理

## 部署说明
1. 将所有文件上传到您的 `Yyds76.github.io` 存储库
2. 启用GitHub Pages
3. 配置自定义域名 (可选)
4. 测试访问和API功能

## 注意事项
- 请妥善保管密码和API密钥
- 定期备份重要代码文件
- 确保executor具有HTTP请求权限
