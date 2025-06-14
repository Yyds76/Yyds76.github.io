# Yyds76 代码存储库系统

这是一个安全的代码文件管理系统，专为Roblox Executor设计，支持通过API访问和管理Lua脚本文件。

## 🚀 功能特性

- **🔐 安全认证**: 密码保护访问（密码：SuperMiner）
- **🔑 API访问**: 专用API密钥供Roblox Executor使用
- **📁 文件管理**: 上传、查看、删除代码文件
- **🌐 Raw模式**: 纯文本文件内容显示
- **🛡️ 访问控制**: 只允许授权用户和Roblox Executor访问

## 📋 部署说明

### 1. GitHub Pages 设置

1. 将所有文件上传到您的 `Yyds76.github.io` 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支作为源

### 2. 域名代理设置

将您的域名 `www.hbhub.dpdns.org` 指向 `Yyds76.github.io`

### 3. 文件结构

\`\`\`
Yyds76.github.io/
├── index.html          # 主页面
├── api-handler.js      # API处理逻辑
├── roblox-example.lua  # Roblox使用示例
└── README.md          # 说明文档
\`\`\`

## 🔧 API 使用方法

### 获取文件内容

\`\`\`
GET https://www.hbhub.dpdns.org/api/file/{fileId}?key=yyds_steve_76
\`\`\`

### 获取文件列表

\`\`\`
GET https://www.hbhub.dpdns.org/api/list?key=yyds_steve_76
\`\`\`

## 🎮 Roblox Executor 使用示例

\`\`\`lua
-- 基本使用
local HttpService = game:GetService("HttpService")

function executeRemoteScript(filename)
    local fileId = string.sub(HttpService:Base64Encode(filename):gsub("[^%w]", ""), 1, 8)
    local url = "https://www.hbhub.dpdns.org/api/file/" .. fileId .. "?key=yyds_steve_76"
    
    local success, response = pcall(function()
        return HttpService:GetAsync(url)
    end)
    
    if success then
        local data = HttpService:JSONDecode(response)
        if data.success then
            loadstring(data.content)()
        end
    end
end

-- 执行test.lua
executeRemoteScript("test.lua")
\`\`\`

## 🔒 安全特性

- **密码保护**: 网页访问需要密码验证
- **API密钥**: Roblox Executor需要有效API密钥
- **来源验证**: 检查请求来源是否为授权的Roblox Executor
- **会话管理**: 登录状态管理和自动过期

## 📝 文件管理

### 支持的文件类型
- `.lua` - Lua脚本文件
- `.txt` - 文本配置文件
- `.js` - JavaScript文件
- `.py` - Python脚本文件

### URL 结构
- 主页: `https://www.hbhub.dpdns.org/`
- Raw文件: `https://www.hbhub.dpdns.org/r/{fileId}`
- API端点: `https://www.hbhub.dpdns.org/api/file/{fileId}?key={apiKey}`

## ⚠️ 注意事项

1. 这是一个静态网站，文件存储在浏览器本地存储中
2. 实际部署时建议使用真实的后端数据库
3. API密钥请妥善保管，不要泄露给他人
4. 定期备份重要的脚本文件

## 🛠️ 自定义配置

在 `index.html` 中修改以下配置：

\`\`\`javascript
const CONFIG = {
    password: 'SuperMiner',     // 访问密码
    apiKey: 'yyds_steve_76',   // API密钥
    domain: 'www.hbhub.dpdns.org' // 代理域名
};
\`\`\`

## 📞 技术支持

如有问题，请在GitHub仓库中提交Issue或联系开发者。

---

**版本**: 1.0.0  
**作者**: Yyds76  
**更新时间**: 2024年12月
