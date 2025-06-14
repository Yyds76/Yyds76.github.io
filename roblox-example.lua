-- Roblox Executor 使用示例
-- 这个脚本展示如何从您的GitHub存储库获取和执行Lua代码

local HttpService = game:GetService("HttpService")

-- 配置信息
local REPO_URL = "https://yyds76.github.io"  -- 您的GitHub Pages URL
local PROXY_URL = "https://www.hbhub.dpdns.org"  -- 您的代理域名
local API_KEY = "yyds_steve_76"  -- API密钥

-- 创建HTTP客户端类
local GitHubRepo = {}
GitHubRepo.__index = GitHubRepo

function GitHubRepo.new(baseUrl, apiKey)
    local self = setmetatable({}, GitHubRepo)
    self.baseUrl = baseUrl
    self.apiKey = apiKey
    return self
end

-- 获取文件内容
function GitHubRepo:getFile(fileName)
    local success, result = pcall(function()
        -- 构建请求URL (使用Raw模式)
        local url = self.baseUrl .. "/" .. fileName
        
        -- 发送HTTP请求
        local response = HttpService:GetAsync(url, false, {
            ["User-Agent"] = "Roblox-Executor",
            ["X-API-Key"] = self.apiKey
        })
        
        return response
    end)
    
    if success then
        print("✅ 成功获取文件: " .. fileName)
        return result
    else
        warn("❌ 获取文件失败: " .. fileName)
        warn("错误信息: " .. tostring(result))
        return nil
    end
end

-- 执行远程Lua代码
function GitHubRepo:executeFile(fileName)
    local code = self:getFile(fileName)
    if code then
        local success, result = pcall(function()
            -- 使用loadstring执行代码
            local func = loadstring(code)
            if func then
                return func()
            else
                error("代码编译失败")
            end
        end)
        
        if success then
            print("✅ 成功执行文件: " .. fileName)
            return result
        else
            warn("❌ 执行文件失败: " .. fileName)
            warn("错误信息: " .. tostring(result))
            return nil
        end
    end
end

-- 获取文件列表（如果API支持）
function GitHubRepo:getFileList()
    local success, result = pcall(function()
        local url = self.baseUrl .. "/api/files?key=" .. self.apiKey
        return HttpService:GetAsync(url)
    end)
    
    if success then
        local data = HttpService:JSONDecode(result)
        return data.files
    else
        warn("❌ 获取文件列表失败: " .. tostring(result))
        return nil
    end
end

-- 使用示例
print("🚀 开始连接到GitHub存储库...")

-- 创建存储库客户端
local repo = GitHubRepo.new(REPO_URL, API_KEY)

-- 示例1: 获取并执行test.lua文件
print("\n📁 示例1: 执行test.lua文件")
repo:executeFile("test")

-- 示例2: 获取文件内容但不执行
print("\n📁 示例2: 获取example.lua文件内容")
local exampleCode = repo:getFile("example")
if exampleCode then
    print("文件内容预览:")
    print(string.sub(exampleCode, 1, 200) .. "...")
end

-- 示例3: 获取并使用utility模块
print("\n📁 示例3: 使用utility模块")
local utilityCode = repo:getFile("utility")
if utilityCode then
    -- 执行utility模块并获取返回值
    local utilityModule = loadstring(utilityCode)()
    if utilityModule then
        -- 使用utility函数
        local randomNum = utilityModule.getRandomNumber(1, 100)
        print("随机数: " .. randomNum)
        
        local formattedTime = utilityModule.formatTime(125)
        print("格式化时间: " .. formattedTime)
    end
end

-- 示例4: 错误处理
print("\n📁 示例4: 错误处理演示")
repo:executeFile("nonexistent")  -- 这会失败并显示错误信息

print("\n✨ 演示完成!")

--[[
使用说明:
1. 将此脚本保存到您的executor中
2. 确保您的executor支持HTTP请求
3. 运行脚本即可从您的GitHub存储库获取和执行代码

注意事项:
- 确保您的GitHub Pages网站已正确配置
- API密钥必须正确
- 某些executor可能需要额外的HTTP权限设置
- 如果使用代理域名，请相应修改REPO_URL

文件访问格式:
- 直接访问: https://yyds76.github.io/文件ID
- 带API密钥: https://yyds76.github.io/文件ID?api=yyds_steve_76
- 代理访问: https://www.hbhub.dpdns.org/文件ID
]]
