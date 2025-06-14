-- Roblox Executor 使用示例 (更新版)
-- 使用特定URL标识符访问文件

local HttpService = game:GetService("HttpService")


-- 配置信息
local REPO_URL = "https://yyds76.github.io"
local API_KEY = "yyds_steve_76"

-- 文件标识符映射
local FILE_IDS = {
    test = "a1b2c3",      -- test.lua 的标识符
    example = "d4e5f6",   -- example.lua 的标识符  
    utility = "g7h8i9",   -- utility.lua 的标识符
    advanced = "j0k1l2"   -- advanced.lua 的标识符
}

-- 创建增强的GitHub客户端
local GitHubRepo = {}
GitHubRepo.__index = GitHubRepo

function GitHubRepo.new(baseUrl, apiKey)
    local self = setmetatable({}, GitHubRepo)
    self.baseUrl = baseUrl
    self.apiKey = apiKey
    return self
end

-- 获取文件内容 (Raw模式)
function GitHubRepo:getRawFile(fileName)
    local fileId = FILE_IDS[fileName]
    if not fileId then
        warn("❌ 未知文件: " .. fileName)
        return nil
    end
    
    local success, result = pcall(function()
        -- 使用新的URL格式: /r/文件标识符
        local url = self.baseUrl .. "/r/" .. fileId
        
        return HttpService:GetAsync(url, false, {
            ["User-Agent"] = "Roblox-Executor-v2.0",
            ["X-API-Key"] = self.apiKey
        })
    end)
    
    if success then
        print("✅ 成功获取文件: " .. fileName .. " (ID: " .. fileId .. ")")
        return result
    else
        warn("❌ 获取文件失败: " .. fileName)
        warn("错误: " .. tostring(result))
        return nil
    end
end

-- 获取可执行文件内容 (Execute模式)
function GitHubRepo:getExecutableFile(fileName)
    local fileId = FILE_IDS[fileName]
    if not fileId then
        warn("❌ 未知文件: " .. fileName)
        return nil
    end
    
    local success, result = pcall(function()
        -- 使用执行模式URL: /x/文件标识符
        local url = self.baseUrl .. "/x/" .. fileId
        
        return HttpService:GetAsync(url, false, {
            ["User-Agent"] = "Roblox-Executor-v2.0",
            ["X-API-Key"] = self.apiKey
        })
    end)
    
    if success then
        print("✅ 成功获取可执行文件: " .. fileName)
        return result
    else
        warn("❌ 获取可执行文件失败: " .. fileName)
        return nil
    end
end

-- 执行远程文件
function GitHubRepo:executeFile(fileName)
    local code = self:getRawFile(fileName)
    if not code then
        return false
    end
    
    local success, result = pcall(function()
        local func = loadstring(code)
        if func then
            return func()
        else
            error("代码编译失败")
        end
    end)
    
    if success then
        print("✅ 成功执行: " .. fileName)
        return result
    else
        warn("❌ 执行失败: " .. fileName)
        warn("错误: " .. tostring(result))
        return false
    end
end

-- 批量加载文件
function GitHubRepo:loadMultipleFiles(fileNames)
    local results = {}
    for _, fileName in ipairs(fileNames) do
        local content = self:getRawFile(fileName)
        if content then
            results[fileName] = content
        end
    end
    return results
end

-- 使用示例
print("🚀 连接到Yyds76代码库...")
print("📡 使用新的URL标识符系统")

local repo = GitHubRepo.new(REPO_URL, API_KEY)

-- 示例1: 执行test文件
print("\n📁 示例1: 执行test文件")
repo:executeFile("test")

-- 示例2: 获取utility模块
print("\n📁 示例2: 加载utility模块")
local utilityCode = repo:getRawFile("utility")
if utilityCode then
    local utilityModule = loadstring(utilityCode)()
    if utilityModule then
        print("🔧 Utility模块加载成功")
        local randomNum = utilityModule.getRandomNumber(1, 100)
        print("随机数: " .. randomNum)
    end
end

-- 示例3: 批量加载文件
print("\n📁 示例3: 批量加载文件")
local files = repo:loadMultipleFiles({"test", "example", "utility"})
for fileName, content in pairs(files) do
    print("✅ 已加载: " .. fileName .. " (" .. #content .. " 字符)")
end

-- 示例4: 错误处理
print("\n📁 示例 4: 错误处理")
repo:executeFile("nonexistent")

print("\n✨ 演示完成!")
print("🔗 URL格式说明:")
print("   Raw访问: " .. REPO_URL .. "/r/文件标识符")
print("   执行访问: " .. REPO_URL .. "/x/文件标识符")

--[[
新的URL标识符系统:
- test.lua    -> /r/a1b2c3 或 /x/a1b2c3
- example.lua -> /r/d4e5f6 或 /x/d4e5f6  
- utility.lua -> /r/g7h8i9 或 /x/g7h8i9
- advanced.lua-> /r/j0k1l2 或 /x/j0k1l2

优势:
✅ 隐藏真实文件名
✅ 更好的安全性
✅ 支持Raw和Execute两种模式
✅ 简洁的URL结构
]]
