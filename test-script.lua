-- Roblox 高级HTTP处理器
-- 作者: Yyds76
-- 版本: 7.0 - 解决HTTP请求被阻止的问题

local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

-- 配置信息
local CONFIG = {
    domain = "www.hbhub.dpdns.org",
    apiKey = "yyds_steve_76"
}

-- 打印函数
local function printStyled(message, style)
    local prefix = "🚀 [Yyds76] "
    if style == "success" then
        prefix = "✅ [Yyds76] "
    elseif style == "error" then
        prefix = "❌ [Yyds76] "
    elseif style == "warning" then
        prefix = "⚠️ [Yyds76] "
    elseif style == "info" then
        prefix = "ℹ️ [Yyds76] "
    end
    print(prefix .. message)
end

-- 高级HTTP请求函数（绕过阻止）
local function advancedHttpGet(url)
    printStyled("尝试高级HTTP请求: " .. url, "info")
    
    -- 方法1：标准GetAsync
    local methods = {
        function()
            return HttpService:GetAsync(url)
        end,
        
        -- 方法2：带同步参数的GetAsync
        function()
            return HttpService:GetAsync(url, true)
        end,
        
        -- 方法3：使用RequestAsync（更底层）
        function()
            local response = HttpService:RequestAsync({
                Url = url,
                Method = "GET"
            })
            if response.Success then
                return response.Body
            else
                error("RequestAsync failed: " .. tostring(response.StatusMessage))
            end
        end,
        
        -- 方法4：使用game:HttpGet（某些执行器支持）
        function()
            if game.HttpGet then
                return game:HttpGet(url)
            else
                error("game:HttpGet not available")
            end
        end,
        
        -- 方法5：使用全局HttpGet（执行器提供）
        function()
            if _G.HttpGet then
                return _G.HttpGet(url)
            elseif getgenv and getgenv().HttpGet then
                return getgenv().HttpGet(url)
            else
                error("Global HttpGet not available")
            end
        end
    }
    
    for i, method in ipairs(methods) do
        local success, result = pcall(method)
        if success then
            printStyled("方法 " .. i .. " 成功", "success")
            return result
        else
            printStyled("方法 " .. i .. " 失败: " .. tostring(result), "warning")
        end
    end
    
    error("所有HTTP方法都失败了")
end

-- 测试不同的HTTP方法
local function testHttpMethods()
    printStyled("测试不同的HTTP方法...", "info")
    
    -- 测试URL列表（从最安全到最不安全）
    local testUrls = {
        "https://httpbin.org/get",
        "https://api.github.com/",
        "https://jsonplaceholder.typicode.com/posts/1",
        "https://" .. CONFIG.domain .. "/api/list?k=" .. CONFIG.apiKey
    }
    
    for i, url in ipairs(testUrls) do
        printStyled("测试URL " .. i .. ": " .. url, "info")
        
        local success, result = pcall(function()
            return advancedHttpGet(url)
        end)
        
        if success then
            printStyled("URL " .. i .. " 测试成功", "success")
            return true
        else
            printStyled("URL " .. i .. " 测试失败: " .. tostring(result), "error")
        end
    end
    
    return false
end

-- 检查执行器环境
local function checkExecutorEnvironment()
    printStyled("检查执行器环境...", "info")
    
    local features = {
        ["HttpService"] = HttpService ~= nil,
        ["HttpEnabled"] = HttpService and HttpService.HttpEnabled or false,
        ["game:HttpGet"] = game.HttpGet ~= nil,
        ["_G.HttpGet"] = _G.HttpGet ~= nil,
        ["getgenv"] = getgenv ~= nil,
        ["syn"] = syn ~= nil,
        ["request"] = request ~= nil,
        ["http_request"] = http_request ~= nil,
    }
    
    print("🔍 执行器功能检测:")
    for feature, available in pairs(features) do
        local status = available and "✅" or "❌"
        print("  " .. status .. " " .. feature .. ": " .. tostring(available))
    end
    
    -- 检查是否有可用的HTTP方法
    local httpMethods = {
        HttpService and HttpService.HttpEnabled,
        game.HttpGet,
        _G.HttpGet,
        request,
        http_request
    }
    
    local hasHttpMethod = false
    for _, method in ipairs(httpMethods) do
        if method then
            hasHttpMethod = true
            break
        end
    end
    
    if hasHttpMethod then
        printStyled("找到可用的HTTP方法", "success")
        return true
    else
        printStyled("没有找到可用的HTTP方法", "error")
        return false
    end
end

-- 使用执行器特定的HTTP方法
local function executorHttpGet(url)
    -- 尝试执行器特定的HTTP方法
    if request then
        printStyled("使用 request() 方法", "info")
        local response = request({
            Url = url,
            Method = "GET"
        })
        if response and response.Body then
            return response.Body
        end
    end
    
    if http_request then
        printStyled("使用 http_request() 方法", "info")
        local response = http_request({
            Url = url,
            Method = "GET"
        })
        if response and response.Body then
            return response.Body
        end
    end
    
    if syn and syn.request then
        printStyled("使用 syn.request() 方法", "info")
        local response = syn.request({
            Url = url,
            Method = "GET"
        })
        if response and response.Body then
            return response.Body
        end
    end
    
    -- 回退到标准方法
    return advancedHttpGet(url)
end

-- 执行脚本（使用最佳HTTP方法）
function executeScriptAdvanced(filename)
    printStyled("使用高级方法执行脚本: " .. filename, "info")
    
    -- 1. 检查执行器环境
    if not checkExecutorEnvironment() then
        printStyled("执行器环境不支持HTTP请求", "error")
        return false
    end
    
    -- 2. 测试HTTP方法
    if not testHttpMethods() then
        printStyled("所有HTTP方法测试失败", "error")
        return false
    end
    
    -- 3. 获取文件列表
    printStyled("获取文件列表...", "info")
    local listUrl = string.format("https://%s/api/list?k=%s", CONFIG.domain, CONFIG.apiKey)
    
    local success, response = pcall(function()
        return executorHttpGet(listUrl)
    end)
    
    if not success then
        printStyled("获取文件列表失败: " .. tostring(response), "error")
        return false
    end
    
    local parseSuccess, data = pcall(function()
        return HttpService:JSONDecode(response)
    end)
    
    if not parseSuccess or not data or not data.success then
        printStyled("解析文件列表失败", "error")
        return false
    end
    
    printStyled("找到 " .. #data.files .. " 个文件", "success")
    
    -- 4. 查找目标文件
    local targetFile = nil
    for _, file in ipairs(data.files) do
        if file.filename == filename then
            targetFile = file
            break
        end
    end
    
    if not targetFile then
        printStyled("未找到文件: " .. filename, "error")
        return false
    end
    
    -- 5. 获取文件内容
    printStyled("获取文件内容...", "info")
    local fileUrl = string.format("https://%s/api/file/%s?k=%s", 
        CONFIG.domain, targetFile.fileId, CONFIG.apiKey)
    
    local success, fileResponse = pcall(function()
        return executorHttpGet(fileUrl)
    end)
    
    if not success then
        printStyled("获取文件内容失败: " .. tostring(fileResponse), "error")
        return false
    end
    
    local parseSuccess, fileData = pcall(function()
        return HttpService:JSONDecode(fileResponse)
    end)
    
    if not parseSuccess or not fileData or not fileData.success then
        printStyled("解析文件内容失败", "error")
        return false
    end
    
    -- 6. 执行脚本
    printStyled("执行脚本内容...", "info")
    local execSuccess, execResult = pcall(function()
        loadstring(fileData.content)()
    end)
    
    if execSuccess then
        printStyled("脚本执行成功！", "success")
        return true
    else
        printStyled("脚本执行失败: " .. tostring(execResult), "error")
        return false
    end
end

-- 诊断HTTP问题
function diagnoseHttpIssues()
    printStyled("开始HTTP问题诊断...", "info")
    print("=" .. string.rep("=", 50))
    
    -- 1. 基础检查
    print("📋 基础检查:")
    print("  HttpService存在: " .. tostring(HttpService ~= nil))
    print("  HttpEnabled: " .. tostring(HttpService and HttpService.HttpEnabled or false))
    print("  运行环境: " .. (RunService:IsStudio() and "Roblox Studio" or "游戏中"))
    
    -- 2. 执行器检查
    checkExecutorEnvironment()
    
    -- 3. HTTP方法测试
    print("\n🧪 HTTP方法测试:")
    testHttpMethods()
    
    print("=" .. string.rep("=", 50))
    printStyled("诊断完成", "info")
end

-- 主程序
print("=" .. string.rep("=", 50))
printStyled("Yyds76 高级HTTP处理器", "info")
print("=" .. string.rep("=", 50))

-- 立即进行诊断
diagnoseHttpIssues()

-- 可用命令
printStyled("可用命令:", "info")
print("  • executeScriptAdvanced('文件名.lua') - 使用高级方法执行脚本")
print("  • diagnoseHttpIssues() - 诊断HTTP问题")
print("  • testHttpMethods() - 测试HTTP方法")
print("  • checkExecutorEnvironment() - 检查执行器环境")

print("=" .. string.rep("=", 50))
