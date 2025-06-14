-- 测试脚本 - 验证执行器功能
-- 作者: Yyds76

print("🎉 测试脚本执行成功！")
print("📅 执行时间: " .. os.date("%Y-%m-%d %H:%M:%S"))

local Players = game:GetService("Players")
local player = Players.LocalPlayer

if player then
    print("👤 玩家信息:")
    print("   名称: " .. player.Name)
    print("   用户ID: " .. player.UserId)
    print("   显示名称: " .. (player.DisplayName or "未设置"))
else
    print("⚠️ 无法获取玩家信息")
end

-- 简单的功能测试
local function testBasicFunctions()
    print("\n🔧 基础功能测试:")
    
    -- 测试数学运算
    local result = 2 + 2
    print("   数学测试: 2 + 2 = " .. result)
    
    -- 测试字符串操作
    local text = "Hello, " .. (player and player.Name or "World") .. "!"
    print("   字符串测试: " .. text)
    
    -- 测试表操作
    local testTable = {1, 2, 3, "test"}
    print("   表测试: 长度 = " .. #testTable)
    
    print("✅ 所有基础功能测试通过！")
end

-- 执行测试
testBasicFunctions()

-- 显示成功消息
print("\n" .. string.rep("=", 40))
print("🚀 Yyds76 代码存储库测试完成")
print("✅ 脚本执行器工作正常")
print("📝 您可以安全地执行其他脚本")
print(string.rep("=", 40))

-- 返回成功状态
return true
