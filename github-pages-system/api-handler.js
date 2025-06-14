// API处理器 - 用于处理Roblox Executor的请求
// 这个文件展示了API的完整实现逻辑

class ApiHandler {
  constructor() {
    this.config = {
      apiKey: "yyds_steve_76",
      allowedOrigins: ["roblox.com", "www.roblox.com", "web.roblox.com"],
    }

    // 模拟文件存储
    this.fileStorage = new Map()
    this.initializeFiles()
  }

  // 初始化示例文件
  initializeFiles() {
    this.fileStorage.set("test.lua", {
      content: `-- 测试脚本
print("Hello from Yyds76 Repository!")
local player = game.Players.LocalPlayer
if player and player.Character then
    player.Character.Humanoid.WalkSpeed = 50
    print("移动速度已设置为50")
end`,
      type: "lua",
      created: new Date().toISOString(),
    })

    this.fileStorage.set("example.lua", {
      content: `-- 示例脚本
local Players = game:GetService("Players")
local player = Players.LocalPlayer

print("玩家信息:")
print("名称: " .. player.Name)
print("用户ID: " .. player.UserId)

-- 简单的飞行脚本
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

humanoid.PlatformStand = true
local bodyVelocity = Instance.new("BodyVelocity")
bodyVelocity.MaxForce = Vector3.new(4000, 4000, 4000)
bodyVelocity.Velocity = Vector3.new(0, 50, 0)
bodyVelocity.Parent = character.HumanoidRootPart

print("飞行模式已激活！")`,
      type: "lua",
      created: new Date().toISOString(),
    })

    this.fileStorage.set("config.txt", {
      content: `# Yyds76 配置文件
version=2.0
author=Yyds76
repository=Yyds76.github.io
api_version=1.0
last_updated=${new Date().toISOString()}

# 功能开关
enable_logging=true
enable_cache=true
max_file_size=1048576`,
      type: "config",
      created: new Date().toISOString(),
    })
  }

  // 生成文件ID
  generateFileId(filename) {
    return btoa(filename)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 8)
  }

  // 验证API密钥
  validateApiKey(apiKey) {
    return apiKey === this.config.apiKey
  }

  // 验证请求来源
  validateOrigin(userAgent) {
    // 检查是否来自Roblox Executor
    const robloxIndicators = ["roblox", "executor", "synapse", "krnl", "oxygen"]

    if (!userAgent) return false

    const lowerUserAgent = userAgent.toLowerCase()
    return robloxIndicators.some((indicator) => lowerUserAgent.includes(indicator))
  }

  // 处理文件请求
  handleFileRequest(fileId, apiKey, userAgent) {
    // 验证API密钥
    if (!this.validateApiKey(apiKey)) {
      return {
        success: false,
        error: "Invalid API key",
        code: 401,
      }
    }

    // 验证请求来源
    if (!this.validateOrigin(userAgent)) {
      return {
        success: false,
        error: "Unauthorized origin",
        code: 403,
      }
    }

    // 查找文件
    let targetFile = null
    let targetFilename = null

    for (const [filename, fileData] of this.fileStorage) {
      if (this.generateFileId(filename) === fileId) {
        targetFile = fileData
        targetFilename = filename
        break
      }
    }

    if (!targetFile) {
      return {
        success: false,
        error: "File not found",
        code: 404,
      }
    }

    // 返回文件内容
    return {
      success: true,
      filename: targetFilename,
      content: targetFile.content,
      type: targetFile.type,
      created: targetFile.created,
      fileId: fileId,
    }
  }

  // 处理文件列表请求
  handleListRequest(apiKey, userAgent) {
    // 验证API密钥
    if (!this.validateApiKey(apiKey)) {
      return {
        success: false,
        error: "Invalid API key",
        code: 401,
      }
    }

    // 验证请求来源
    if (!this.validateOrigin(userAgent)) {
      return {
        success: false,
        error: "Unauthorized origin",
        code: 403,
      }
    }

    // 返回文件列表
    const fileList = []
    for (const [filename, fileData] of this.fileStorage) {
      fileList.push({
        filename: filename,
        fileId: this.generateFileId(filename),
        type: fileData.type,
        created: fileData.created,
      })
    }

    return {
      success: true,
      files: fileList,
      count: fileList.length,
    }
  }

  // 添加新文件
  addFile(filename, content, type = "unknown") {
    this.fileStorage.set(filename, {
      content: content,
      type: type,
      created: new Date().toISOString(),
    })

    return {
      success: true,
      filename: filename,
      fileId: this.generateFileId(filename),
      message: "File added successfully",
    }
  }

  // 删除文件
  deleteFile(filename, apiKey) {
    if (!this.validateApiKey(apiKey)) {
      return {
        success: false,
        error: "Invalid API key",
        code: 401,
      }
    }

    if (this.fileStorage.has(filename)) {
      this.fileStorage.delete(filename)
      return {
        success: true,
        message: "File deleted successfully",
      }
    } else {
      return {
        success: false,
        error: "File not found",
        code: 404,
      }
    }
  }
}

// 使用示例
const apiHandler = new ApiHandler()

// 模拟API请求处理
function processApiRequest(endpoint, params, headers) {
  const userAgent = headers["user-agent"] || ""
  const apiKey = params.key || ""

  console.log(`处理API请求: ${endpoint}`)
  console.log(`API密钥: ${apiKey}`)
  console.log(`用户代理: ${userAgent}`)

  if (endpoint.startsWith("/api/file/")) {
    const fileId = endpoint.split("/api/file/")[1]
    return apiHandler.handleFileRequest(fileId, apiKey, userAgent)
  } else if (endpoint === "/api/list") {
    return apiHandler.handleListRequest(apiKey, userAgent)
  } else {
    return {
      success: false,
      error: "Unknown endpoint",
      code: 404,
    }
  }
}

// 导出API处理器
if (typeof module !== "undefined" && module.exports) {
  module.exports = ApiHandler
}
