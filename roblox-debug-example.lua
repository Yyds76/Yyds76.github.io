-- Roblox Executor 调试版本
-- 作者: Yyds76
-- 版本: 5.1 - 增强错误处理和调试信息

local HttpService = game:GetService("HttpService")

-- 配置信息
local CONFIG = {
    domain = "www.hbhub.dpdns.org",
    apiKey = "yyds_steve_76"
}

-- 调试模式
local DEBUG_MODE = true

-- 调试打印函数
local function debugPrint(message, level)
    if not DEBUG_MODE then return end
    
    local prefix = "🔍 [DEBUG] "
    if level == "error" then
        prefix = "❌ [ERROR] "
    elseif level == "warning" then
        prefix = "⚠️ [WARN] "
    elseif level == "success" then
        prefix = "✅ [SUCCESS] "
    end
    
    print(prefix .. message)
end

-- 测试HTTP连接
local function testConnection()
    debugPrint("测试基础HTTP连接...", "info")
    
    local success, result = pcall(function()
        return HttpService:GetAsync("https://httpbin.org/get")
    end)
    
    if success then
        debugPrint("HTTP连接正常", "success")
        return true
    else
        debugPrint("HTTP连接失败: " .. tostring(result), "error")
        return false
    end
end

-- 测试API连接
local function testApiConnection()
    debugPrint("测试API连接...", "info")
    
    local listUrl = string.format("https://%s/api/list?k=%s", CONFIG.domain, CONFIG.apiKey)
    debugPrint("API URL: " .. listUrl, "info")
    
    local success, response = pcall(function()
        return HttpService:GetAsync(listUrl)
    end)
    
    if success then
        debugPrint("API响应: " .. response:sub(1, 200) .. "...", "info")
        
        local parseSuccess, data = pcall(function()
            return HttpService:JSONDecode(response)
        end)
        
        if parseSuccess and data.success then
            debugPrint("API连接成功，找到 " .. #data.files .. " 个文件", "success")
            return data.files
        else
            debugPrint("API响应解析失败", "error")
            return nil
        end
    else
        debugPrint("API连接失败: " .. tostring(response), "error")
        return nil
    end
end

-- 测试执行端点
local function testExecEndpoint(fileId)
    debugPrint("测试执行端点...", "info")
    
    local execUrl = string.format("https://%s/exec/%s?k=%s", CONFIG.domain, fileId, CONFIG.apiKey)
    debugPrint("执行URL: " .. execUrl, "info")
    
    local success, response = pcall(function()
        return game:HttpGet(execUrl)
    end)
    
    if success then
        debugPrint("执行端点响应长度: " .. #response, "info")
        debugPrint("响应内容预览: " .. response:sub(1, 100) .. "...", "info")
        
        -- 检查是否是有效的Lua代码
        local loadSuccess, loadResult = pcall(function()
            return loadstring(response)
        end)
        
        if loadSuccess and loadResult then
            debugPrint("代码编译成功", "success")
            return response
        else
            debugPrint("代码编译失败: " .. tostring(loadResult), "error")
            return nil
        end
    else
        debugPrint("执行端点请求失败: " .. tostring(response), "error")
        return nil
    end
end

-- 安全执行代码
local function safeExecute(code)
    debugPrint("安全执行代码...", "info")
    
    local success, result = pcall(function()
        return loadstring(code)()
    end)
    
    if success then
        debugPrint("代码执行成功", "success")
        return true
    else
        debugPrint("代码执行失败: " .. tostring(result), "error")
        return false
    end
end

-- 主要的执行函数（调试版本）
function executeScriptDebug(filename)
    debugPrint("开始调试执行: " .. filename, "info")
    
    -- 1. 测试基础连接
    if not testConnection() then
        debugPrint("基础连接测试失败，停止执行", "error")
        return false
    end
    
    -- 2. 获取文件列表
    local files = testApiConnection()
    if not files then
        debugPrint("无法获取文件列表，停止执行", "error")
        return false
    end
    
    -- 3. 查找目标文件
    local targetFileId = nil
    for _, file in ipairs(files) do
        if file.filename == filename then
            targetFileId = file.fileId
            debugPrint("找到目标文件: " .. filename .. " -> " .. targetFileId, "success")
            break
        end
    end
    
    if not targetFileId then
        debugPrint("未找到文件: " .. filename, "error")
        return false
    end
    
    -- 4. 测试执行端点
    local code = testExecEndpoint(targetFileId)
    if not code then
        debugPrint("无法获取可执行代码", "error")
        return false
    end
    
    -- 5. 执行代码
    return safeExecute(code)
end

-- 快速测试函数
function quickTest()
    debugPrint("开始快速测试...", "info")
    
    -- 测试一个简单的URL
    local testUrl = string.format("https://%s/exec/test?k=%s", CONFIG.domain, CONFIG.apiKey)
    
    local success, response = pcall(function()
        return game:HttpGet(testUrl)
    end)
    
    if success then
        debugPrint("快速测试成功", "success")
        debugPrint("响应: " .. response, "info")
    else
        debugPrint("快速测试失败: " .. tostring(response), "error")
    end
end

-- 启动调试
print("=" .. string.rep("=", 50))
debugPrint("Yyds76 调试执行器启动", "info")
debugPrint("域名: " .. CONFIG.domain, "info")
debugPrint("调试模式: " .. (DEBUG_MODE and "开启" or "关闭"), "info")
print("=" .. string.rep("=", 50))

-- 使用说明
debugPrint("使用以下命令进行调试:", "info")
print("  • quickTest() - 快速连接测试")
print("  • testConnection() - 测试HTTP连接")
print("  • testApiConnection() - 测试API连接")
print("  • executeScriptDebug('文件名.lua') - 调试执行脚本")

print("=" .. string.rep("=", 50))
