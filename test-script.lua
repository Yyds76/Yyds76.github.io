-- Roblox HttpService 启用器
-- 作者: Yyds76
-- 版本: 6.0 - 专注于启用HttpService而非绕过

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

-- 强制启用HttpService的多种方法
local function forceEnableHttpService()
    printStyled("尝试强制启用HttpService...", "info")
    
    local methods = {
        -- 方法1：直接设置
        function()
            HttpService.HttpEnabled = true
            return "直接设置"
        end,
        
        -- 方法2：通过pcall保护设置
        function()
            local success = pcall(function()
                HttpService.HttpEnabled = true
            end)
            if success then
                return "保护设置"
            else
                error("设置失败")
            end
        end,
        
        -- 方法3：通过游戏设置（如果可访问）
        function()
            if game.HttpService then
                game.HttpService.HttpEnabled = true
                return "游戏设置"
            else
                error("无法访问游戏设置")
            end
        end,
        
        -- 方法4：通过RunService设置
        function()
            if RunService:IsStudio() then
                -- 在Studio中尝试设置
                local success, result = pcall(function()
                    game:GetService("HttpService").HttpEnabled = true
                end)
                if success then
                    return "Studio设置"
                else
                    error("Studio设置失败: " .. tostring(result))
                end
            else
                error("不在Studio环境中")
            end
        end
    }
    
    for i, method in ipairs(methods) do
        local success, result = pcall(method)
        if success then
            printStyled("方法 " .. i .. " 成功: " .. result, "success")
            
            -- 验证是否真的启用了
            if HttpService.HttpEnabled then
                printStyled("HttpService已成功启用！", "success")
                return true
            else
                printStyled("方法 " .. i .. " 执行成功但HttpService仍未启用", "warning")
            end
        else
            printStyled("方法 " .. i .. " 失败: " .. tostring(result), "error")
        end
    end
    
    return false
end

-- 检查HttpService状态并尝试启用
local function checkAndEnableHttpService()
    printStyled("检查HttpService状态...", "info")
    
    if not HttpService then
        printStyled("HttpService服务不可用", "error")
        return false
    end
    
    printStyled("HttpService服务: 可用", "success")
    printStyled("HttpEnabled状态: " .. tostring(HttpService.HttpEnabled), "info")
    
    if HttpService.HttpEnabled then
        printStyled("HttpService已启用，无需操作", "success")
        return true
    else
        printStyled("HttpService未启用，尝试启用...", "warning")
        return forceEnableHttpService()
    end
end

-- 测试HTTP连接（仅在启用后）
local function testHttpConnection()
    if not HttpService.HttpEnabled then
        printStyled("HttpService未启用，跳过连接测试", "warning")
        return false
    end
    
    printStyled("测试HTTP连接...", "info")
    
    -- 测试简单的HTTP请求
    local success, result = pcall(function()
        return HttpService:GetAsync("https://httpbin.org/get", true)
    end)
    
    if success then
        printStyled("HTTP连接测试成功", "success")
        return true
    else
        printStyled("HTTP连接测试失败: " .. tostring(result), "error")
        return false
    end
end

-- 执行脚本（仅使用API方式）
function executeScriptAPI(filename)
    printStyled("使用API方式执行脚本: " .. filename, "info")
    
    -- 1. 确保HttpService启用
    if not checkAndEnableHttpService() then
        printStyled("无法启用HttpService，停止执行", "error")
        printStyled("请手动在游戏设置中启用HTTP请求", "warning")
        return false
    end
    
    -- 2. 测试连接
    if not testHttpConnection() then
        printStyled("HTTP连接测试失败，停止执行", "error")
        return false
    end
    
    -- 3. 获取文件列表
    printStyled("获取文件列表...", "info")
    local listUrl = string.format("https://%s/api/list?k=%s", CONFIG.domain, CONFIG.apiKey)
    
    local success, response = pcall(function()
        return HttpService:GetAsync(listUrl)
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
    
    -- 5. 使用API获取文件内容
    printStyled("获取文件内容...", "info")
    local fileUrl = string.format("https://%s/api/file/%s?k=%s", 
        CONFIG.domain, targetFile.fileId, CONFIG.apiKey)
    
    local success, fileResponse = pcall(function()
        return HttpService:GetAsync(fileUrl)
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

-- 显示详细的启用指南
function showEnableGuide()
    printStyled("HttpService启用指南:", "info")
    print("=" .. string.rep("=", 50))
    
    if RunService:IsStudio() then
        print("🎮 您在Roblox Studio中:")
        print("  1. 点击 Home 选项卡")
        print("  2. 点击 Game Settings 按钮")
        print("  3. 选择 Security 选项卡")
        print("  4. 勾选 'Allow HTTP Requests'")
        print("  5. 点击 Save 保存")
        print("  6. 重新运行游戏")
    else
        print("🎮 您在游戏中:")
        print("  1. 确保使用支持HTTP的执行器")
        print("  2. 检查执行器的HTTP设置")
        print("  3. 尝试在不同游戏中测试")
    end
    
    print("=" .. string.rep("=", 50))
    printStyled("完成设置后，使用 executeScriptAPI('文件名.lua')", "info")
end

-- 主程序
print("=" .. string.rep("=", 50))
printStyled("Yyds76 HttpService启用器", "info")
print("=" .. string.rep("=", 50))

-- 立即检查并尝试启用
local httpEnabled = checkAndEnableHttpService()

if httpEnabled then
    printStyled("系统就绪！可以使用API方式执行脚本", "success")
    printStyled("使用命令: executeScriptAPI('文件名.lua')", "info")
else
    printStyled("HttpService启用失败", "error")
    showEnableGuide()
end

-- 可用命令
printStyled("可用命令:", "info")
print("  • checkAndEnableHttpService() - 检查并启用HttpService")
print("  • executeScriptAPI('文件名.lua') - 使用API执行脚本")
print("  • showEnableGuide() - 显示详细启用指南")
print("  • testHttpConnection() - 测试HTTP连接")

print("=" .. string.rep("=", 50))
