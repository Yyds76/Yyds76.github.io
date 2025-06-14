-- Roblox Executor 修复版本
-- 作者: Yyds76
-- 版本: 5.2 - 修复HttpService阻止问题

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

-- 检查HttpService状态
local function checkHttpService()
    printStyled("检查HttpService状态...", "info")
    
    -- 检查HttpService是否存在
    if not HttpService then
        printStyled("HttpService不可用", "error")
        return false
    end
    
    -- 检查HttpEnabled属性
    local httpEnabled = HttpService.HttpEnabled
    printStyled("HttpEnabled状态: " .. tostring(httpEnabled), "info")
    
    if not httpEnabled then
        printStyled("HttpService未启用！", "warning")
        printStyled("请按以下步骤启用:", "info")
        print("  1. 如果在Roblox Studio中:")
        print("     - 打开 Game Settings (游戏设置)")
        print("     - 找到 Security (安全) 选项卡")
        print("     - 勾选 'Allow HTTP Requests' (允许HTTP请求)")
        print("  2. 如果在游戏中:")
        print("     - 确保游戏开发者已启用HTTP请求")
        print("     - 或使用支持HTTP的执行器")
        return false
    end
    
    printStyled("HttpService状态正常", "success")
    return true
end

-- 测试基础HTTP连接（使用更安全的方法）
local function testBasicConnection()
    printStyled("测试基础HTTP连接...", "info")
    
    -- 使用pcall保护调用
    local success, result = pcall(function()
        -- 使用Roblox官方API进行测试（更可能被允许）
        return HttpService:GetAsync("https://api.roblox.com/")
    end)
    
    if success then
        printStyled("基础HTTP连接正常", "success")
        return true
    else
        printStyled("HTTP连接失败: " .. tostring(result), "error")
        
        -- 提供详细的错误分析
        local errorStr = tostring(result)
        if errorStr:find("blocked") then
            printStyled("HTTP请求被阻止，请检查HttpService设置", "warning")
        elseif errorStr:find("timeout") then
            printStyled("连接超时，请检查网络连接", "warning")
        elseif errorStr:find("SSL") or errorStr:find("certificate") then
            printStyled("SSL证书问题，尝试使用HTTP而非HTTPS", "warning")
        end
        
        return false
    end
end

-- 获取文件列表（改进版本）
local function getFileList()
    printStyled("获取文件列表...", "info")
    
    local listUrl = string.format("https://%s/api/list?k=%s", CONFIG.domain, CONFIG.apiKey)
    
    local success, response = pcall(function()
        return HttpService:GetAsync(listUrl)
    end)
    
    if success then
        printStyled("API响应成功", "success")
        
        local parseSuccess, data = pcall(function()
            return HttpService:JSONDecode(response)
        end)
        
        if parseSuccess and data and data.success then
            printStyled("找到 " .. #data.files .. " 个文件", "success")
            return data.files
        else
            printStyled("解析API响应失败", "error")
            if data and data.error then
                printStyled("API错误: " .. data.error, "error")
            end
            return nil
        end
    else
        printStyled("API请求失败: " .. tostring(response), "error")
        return nil
    end
end

-- 执行脚本（改进版本）
function executeScript(filename)
    printStyled("准备执行脚本: " .. filename, "info")
    
    -- 1. 检查HttpService
    if not checkHttpService() then
        return false
    end
    
    -- 2. 测试基础连接
    if not testBasicConnection() then
        printStyled("基础连接测试失败，无法继续", "error")
        return false
    end
    
    -- 3. 获取文件列表
    local files = getFileList()
    if not files then
        printStyled("无法获取文件列表", "error")
        return false
    end
    
    -- 4. 查找目标文件
    local targetFile = nil
    for _, file in ipairs(files) do
        if file.filename == filename then
            targetFile = file
            break
        end
    end
    
    if not targetFile then
        printStyled("未找到文件: " .. filename, "error")
        printStyled("可用文件:", "info")
        for _, file in ipairs(files) do
            print("  - " .. file.filename)
        end
        return false
    end
    
    -- 5. 获取执行URL
    local execUrl = targetFile.execUrl
    printStyled("执行URL: " .. execUrl, "info")
    
    -- 6. 执行脚本
    local success, result = pcall(function()
        loadstring(game:HttpGet(execUrl))()
    end)
    
    if success then
        printStyled("脚本执行成功！", "success")
        return true
    else
        printStyled("脚本执行失败: " .. tostring(result), "error")
        return false
    end
end

-- 显示系统信息
function showSystemInfo()
    printStyled("系统信息:", "info")
    print("  游戏ID: " .. (game.GameId or "未知"))
    print("  地点ID: " .. (game.PlaceId or "未知"))
    print("  运行环境: " .. (RunService:IsStudio() and "Roblox Studio" or "游戏中"))
    print("  HttpService: " .. (HttpService and "可用" or "不可用"))
    print("  HttpEnabled: " .. tostring(HttpService and HttpService.HttpEnabled or false))
end

-- 手动启用HttpService（仅在Studio中有效）
function enableHttpService()
    if RunService:IsStudio() then
        printStyled("尝试启用HttpService...", "info")
        
        local success, result = pcall(function()
            HttpService.HttpEnabled = true
        end)
        
        if success then
            printStyled("HttpService已启用", "success")
        else
            printStyled("无法启用HttpService: " .. tostring(result), "error")
            printStyled("请手动在Game Settings中启用", "warning")
        end
    else
        printStyled("只能在Roblox Studio中启用HttpService", "warning")
    end
end

-- 备用执行方法（直接使用GitHub Raw）
function executeScriptDirect(filename)
    printStyled("使用直接方法执行: " .. filename, "info")
    
    -- 直接从GitHub Raw获取（绕过我们的API）
    local rawUrl = string.format("https://raw.githubusercontent.com/Yyds76/Yyds76.github.io/main/%s", filename)
    printStyled("直接URL: " .. rawUrl, "info")
    
    local success, result = pcall(function()
        loadstring(game:HttpGet(rawUrl))()
    end)
    
    if success then
        printStyled("直接执行成功！", "success")
        return true
    else
        printStyled("直接执行失败: " .. tostring(result), "error")
        return false
    end
end

-- 启动信息
print("=" .. string.rep("=", 50))
printStyled("Yyds76 修复版执行器启动", "info")
print("=" .. string.rep("=", 50))

-- 显示系统信息
showSystemInfo()

-- 检查HttpService状态
if not checkHttpService() then
    printStyled("HttpService未正确配置", "warning")
    printStyled("尝试以下解决方案:", "info")
    print("  1. enableHttpService() - 尝试自动启用")
    print("  2. executeScriptDirect('文件名') - 使用备用方法")
    print("  3. 手动在Game Settings中启用HTTP请求")
else
    printStyled("系统就绪！", "success")
end

-- 使用说明
printStyled("可用命令:", "info")
print("  • showSystemInfo() - 显示系统信息")
print("  • enableHttpService() - 尝试启用HttpService")
print("  • executeScript('文件名.lua') - 执行脚本（推荐）")
print("  • executeScriptDirect('文件名.lua') - 直接执行（备用）")

print("=" .. string.rep("=", 50))
