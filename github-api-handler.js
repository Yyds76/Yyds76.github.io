// GitHub API 处理器 - 用于处理实际的GitHub仓库文件
// 这个文件展示了如何与GitHub API交互

class GitHubApiHandler {
  constructor(username, repo, branch = "main") {
    this.username = username
    this.repo = repo
    this.branch = branch
    this.apiKey = "yyds_steve_76"
    this.baseUrl = `https://api.github.com/repos/${username}/${repo}`
    this.rawBaseUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}`
  }

  // 验证API密钥
  validateApiKey(apiKey) {
    return apiKey === this.apiKey
  }

  // 验证请求来源（检查是否来自Roblox Executor）
  validateOrigin(userAgent) {
    if (!userAgent) return false

    const robloxIndicators = [
      "roblox",
      "executor",
      "synapse",
      "krnl",
      "oxygen",
      "scriptware",
      "sentinel",
      "protosmasher",
    ]

    const lowerUserAgent = userAgent.toLowerCase()
    return robloxIndicators.some((indicator) => lowerUserAgent.includes(indicator))
  }

  // 生成文件ID
  generateFileId(filename) {
    return btoa(filename)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 8)
  }

  // 获取仓库文件列表
  async getRepositoryFiles() {
    try {
      const response = await fetch(`${this.baseUrl}/contents?ref=${this.branch}`)
      if (!response.ok) {
        throw new Error(`GitHub API错误: ${response.status}`)
      }

      const files = await response.json()

      // 过滤支持的文件类型
      const supportedExtensions = [".lua", ".txt", ".js", ".py", ".md"]
      const filteredFiles = files.filter(
        (file) => file.type === "file" && supportedExtensions.some((ext) => file.name.endsWith(ext)),
      )

      return filteredFiles.map((file) => ({
        filename: file.name,
        fileId: this.generateFileId(file.name),
        size: file.size,
        downloadUrl: file.download_url,
        type: this.getFileType(file.name),
      }))
    } catch (error) {
      console.error("获取仓库文件失败:", error)
      throw error
    }
  }

  // 获取文件类型
  getFileType(filename) {
    const extension = filename.split(".").pop().toLowerCase()
    const typeMap = {
      lua: "lua",
      js: "javascript",
      py: "python",
      txt: "text",
      md: "markdown",
    }
    return typeMap[extension] || "unknown"
  }

  // 获取文件内容
  async getFileContent(filename) {
    try {
      const response = await fetch(`${this.rawBaseUrl}/${filename}`)
      if (!response.ok) {
        throw new Error(`文件不存在: ${filename}`)
      }

      return await response.text()
    } catch (error) {
      console.error("获取文件内容失败:", error)
      throw error
    }
  }

  // 通过文件ID查找文件名
  async findFilenameById(fileId) {
    try {
      const files = await this.getRepositoryFiles()
      const file = files.find((f) => f.fileId === fileId)
      return file ? file.filename : null
    } catch (error) {
      console.error("查找文件失败:", error)
      return null
    }
  }

  // 处理API请求 - 获取单个文件
  async handleFileRequest(fileId, apiKey, userAgent) {
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
        error: "Unauthorized origin - Only Roblox Executors allowed",
        code: 403,
      }
    }

    try {
      // 查找文件
      const filename = await this.findFilenameById(fileId)
      if (!filename) {
        return {
          success: false,
          error: "File not found",
          code: 404,
        }
      }

      // 获取文件内容
      const content = await this.getFileContent(filename)

      return {
        success: true,
        filename: filename,
        content: content,
        fileId: fileId,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 500,
      }
    }
  }

  // 处理API请求 - 获取文件列表
  async handleListRequest(apiKey, userAgent) {
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
        error: "Unauthorized origin - Only Roblox Executors allowed",
        code: 403,
      }
    }

    try {
      const files = await this.getRepositoryFiles()

      return {
        success: true,
        files: files,
        count: files.length,
        repository: `${this.username}/${this.repo}`,
        branch: this.branch,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 500,
      }
    }
  }
}

// 使用示例
const githubApi = new GitHubApiHandler("Yyds76", "Yyds76.github.io", "main")

// 模拟处理API请求的函数
async function processGitHubApiRequest(endpoint, params, headers) {
  const userAgent = headers["user-agent"] || headers["User-Agent"] || ""
  const apiKey = params.key || ""

  console.log(`处理GitHub API请求: ${endpoint}`)
  console.log(`API密钥: ${apiKey ? "***" + apiKey.slice(-4) : "未提供"}`)
  console.log(`用户代理: ${userAgent}`)

  try {
    if (endpoint.startsWith("/api/file/")) {
      const fileId = endpoint.split("/api/file/")[1]
      return await githubApi.handleFileRequest(fileId, apiKey, userAgent)
    } else if (endpoint === "/api/list") {
      return await githubApi.handleListRequest(apiKey, userAgent)
    } else {
      return {
        success: false,
        error: "Unknown endpoint",
        code: 404,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: "Internal server error: " + error.message,
      code: 500,
    }
  }
}

// 导出处理器
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GitHubApiHandler, processGitHubApiRequest }
}
