-- Roblox Executor 使用示例
-- 这个脚本展示如何通过API访问您的代码存储库

local HttpService = game:GetService("HttpService")

-- 配置信息
local CONFIG = {
    domain = "www.hbhub.dpdns.org", -- 您的代理域名
    apiKey = "yyds_steve_76" -- API密钥
}

-- 获取文件内容的函数
function getFileContent(filename)
    -- 生成文件ID（与网站相同的算法）
    local fileId = string.sub(game:GetService("HttpService"):Base64Encode(filename):gsub("[^%w]", ""), 1, 8)
    
    -- 构建API URL
    local apiUrl = string.format("https://%s/api/file/%s?key=%s", CONFIG.domain, fileId, CONFIG.apiKey)
    
    -- 发送HTTP请求
    local success, response = pcall(function()
        return HttpService:GetAsync(apiUrl)
    end)
    
    if success then
        local data = HttpService:JSONDecode(response)
        if data.success then
            return data.content
        else
            warn("API错误: " .. (data.error or "未知错误"))
            return nil
        end
    else
        warn("网络请求失败: " .. tostring(response))
        return nil
    end
end

-- 执行远程Lua代码的函数
function executeRemoteScript(filename)
    print("正在获取文件: " .. filename)
    
    local content = getFileContent(filename)
    if content then
        print("文件获取成功，正在执行...")
        
        -- 执行获取到的Lua代码
        local success, error = pcall(function()
            loadstring(content)()
        end)
        
        if success then
            print("脚本执行成功！")
        else
            warn("脚本执行失败: " .. tostring(error))
        end
    else
        warn("无法获取文件内容")
    end
end

-- 使用示例
print("=== Yyds76 代码存储库客户端 ===")
print("开始执行远程脚本...")

-- 执行test.lua文件
executeRemoteScript("test.lua")

-- 您也可以获取其他文件
-- executeRemoteScript("example.lua")

-- 如果只想获取文件内容而不执行
local configContent = getFileContent("config.txt")
if configContent then
    print("配置文件内容:")
    print(configContent)
end

print("脚本执行完成！")
