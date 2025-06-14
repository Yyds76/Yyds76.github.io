// 全局变量
let isAuthenticated = false
let currentFiles = {}
let currentFileId = null
const API_KEY = "yyds_steve_76"
const PASSWORD = "SuperMiner"

// 域名配置 - 支持多个域名
const DOMAIN_CONFIG = {
  primary: "www.hbhub.dpdns.org",
  fallback: "yyds76.github.io",
  getCurrentDomain: () => {
    return window.location.hostname
  },
}

// 文件ID映射 - 使用特定标识符而不是文件名
const FILE_ID_MAP = {
  a1b2c3: "test",
  d4e5f6: "example",
  g7h8i9: "utility",
  j0k1l2: "advanced",
}

// 反向映射
const REVERSE_FILE_MAP = {}
Object.keys(FILE_ID_MAP).forEach((key) => {
  REVERSE_FILE_MAP[FILE_ID_MAP[key]] = key
})

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// 初始化应用程序
function initializeApp() {
  // 隐藏所有容器
  document.getElementById("loginContainer").classList.add("hidden")
  document.getElementById("mainContainer").classList.add("hidden")
  document.getElementById("rawContainer").classList.add("hidden")
  document.getElementById("errorContainer").classList.add("hidden")
  document.getElementById("executableContainer").classList.add("hidden")

  // 检查URL路径
  const path = window.location.pathname
  if (path.startsWith("/r/") || path.startsWith("/x/")) {
    handleSpecialRequest(path)
    return
  }

  // 检查认证状态
  checkAuthentication()
  loadSampleFiles()

  // 绑定事件
  const passwordInput = document.getElementById("passwordInput")
  if (passwordInput) {
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        authenticate()
      }
    })
  }
}

// 检查身份验证状态
function checkAuthentication() {
  const authStatus = sessionStorage.getItem("authenticated")
  if (authStatus === "true") {
    isAuthenticated = true
    showMainInterface()
  } else {
    showLoginInterface()
  }
}

// 显示登录界面
function showLoginInterface() {
  document.getElementById("loginContainer").classList.remove("hidden")
  document.getElementById("mainContainer").classList.add("hidden")
  document.getElementById("rawContainer").classList.add("hidden")
  document.getElementById("errorContainer").classList.add("hidden")
  document.getElementById("executableContainer").classList.add("hidden")
}

// 显示主界面
function showMainInterface() {
  document.getElementById("loginContainer").classList.add("hidden")
  document.getElementById("mainContainer").classList.remove("hidden")
  document.getElementById("rawContainer").classList.add("hidden")
  document.getElementById("errorContainer").classList.add("hidden")
  document.getElementById("executableContainer").classList.add("hidden")
  renderFileList()
  updateApiInfo()
}

// 身份验证
function authenticate() {
  const password = document.getElementById("passwordInput").value
  const errorDiv = document.getElementById("loginError")

  if (password === PASSWORD) {
    isAuthenticated = true
    sessionStorage.setItem("authenticated", "true")
    showMainInterface()
    errorDiv.textContent = ""
  } else {
    errorDiv.textContent = "密码错误，请重试"
    document.getElementById("passwordInput").value = ""
  }
}

// 退出登录
function logout() {
  isAuthenticated = false
  sessionStorage.removeItem("authenticated")
  showLoginInterface()
  document.getElementById("passwordInput").value = ""
}

// 检查是否为Roblox executor请求
function isRobloxExecutor(userAgent) {
  // Roblox executor通常会在User-Agent中包含特定标识
  // 这里使用简单的检测方法，实际使用时可能需要更复杂的检测
  return (
    userAgent &&
    (userAgent.includes("Roblox") ||
      userAgent.includes("Synapse") ||
      userAgent.includes("Krnl") ||
      userAgent.includes("Executor"))
  )
}

// 处理Raw请求
function handleRawRequest(path) {
  const fileId = path.substring(1) // 移除开头的 '/'

  // 检查API密钥（通过URL参数或请求头）
  const urlParams = new URLSearchParams(window.location.search)
  const apiKey = urlParams.get("api") || getApiKeyFromHeaders()

  // 检查是否为Roblox executor或有效API密钥
  const userAgent = navigator.userAgent
  const isValidExecutor = isRobloxExecutor(userAgent)
  const hasValidApiKey = apiKey === API_KEY

  if (!isValidExecutor && !hasValidApiKey && !isAuthenticated) {
    // 如果不是executor且没有有效API密钥且未登录，重定向到登录页面
    window.location.href = "/"
    return
  }

  // 显示文件内容
  displayRawContent(fileId)
}

// 从请求头获取API密钥（模拟）
function getApiKeyFromHeaders() {
  // 在实际的服务器环境中，这将从HTTP头部获取
  // 在客户端JavaScript中，我们无法直接访问自定义请求头
  // 这里仅作为示例
  return null
}

// 显示Raw内容
function displayRawContent(fileKey) {
  document.getElementById("loginContainer").classList.add("hidden")
  document.getElementById("mainContainer").classList.add("hidden")
  document.getElementById("rawContainer").classList.remove("hidden")
  document.getElementById("errorContainer").classList.add("hidden")
  document.getElementById("executableContainer").classList.add("hidden")

  const file = currentFiles[fileKey]
  const rawContent = document.getElementById("rawContent")

  if (file) {
    rawContent.textContent = file.content
  } else {
    rawContent.textContent = '-- 文件未找到\nprint("错误: 文件不存在")'
  }
}

// 加载示例文件
function loadSampleFiles() {
  currentFiles = {
    test: {
      name: "test.lua",
      content: `-- 测试脚本
print("Hello from Yyds76 repository!")
print("这是一个测试文件")

-- 示例函数
function greet(name)
    return "Hello, " .. name .. "!"
end

-- 调用函数
local message = greet("Roblox Player")
print(message)`,
      type: "lua",
    },
    example: {
      name: "example.lua",
      content: `-- 示例脚本
local Players = game:GetService("Players")
local player = Players.LocalPlayer

-- 输出玩家信息
print("玩家名称: " .. player.Name)
print("用户ID: " .. player.UserId)

-- 示例循环
for i = 1, 5 do
    print("计数: " .. i)
    wait(1)
end`,
      type: "lua",
    },
    utility: {
      name: "utility.lua",
      content: `-- 实用工具函数
local Utility = {}

-- 获取随机数
function Utility.getRandomNumber(min, max)
    return math.random(min, max)
end

-- 格式化时间
function Utility.formatTime(seconds)
    local minutes = math.floor(seconds / 60)
    local secs = seconds % 60
    return string.format("%02d:%02d", minutes, secs)
end

-- 检查玩家是否在游戏中
function Utility.isPlayerInGame(playerName)
    local Players = game:GetService("Players")
    return Players:FindFirstChild(playerName) ~= nil
end

return Utility`,
      type: "lua",
    },
  }
}

// 渲染文件列表
function renderFileList() {
  const fileListDiv = document.getElementById("fileList")
  fileListDiv.innerHTML = ""

  for (const [fileKey, file] of Object.entries(currentFiles)) {
    const fileId = REVERSE_FILE_MAP[fileKey]
    const fileItem = document.createElement("div")
    fileItem.className = "file-item"
    fileItem.innerHTML = `
      <div class="file-name">
        <span>📄</span>
        <span>${file.name}</span>
      </div>
      <div class="file-actions">
        <button class="raw-btn" onclick="openRaw('${fileKey}')">Raw</button>
        <button class="delete-btn" onclick="deleteFile('${fileKey}')">删除</button>
      </div>
    `

    fileItem.addEventListener("click", (e) => {
      if (!e.target.classList.contains("raw-btn") && !e.target.classList.contains("delete-btn")) {
        selectFile(fileKey)
      }
    })

    fileListDiv.appendChild(fileItem)
  }
}

// 选择文件
function selectFile(fileId) {
  currentFileId = fileId
  const file = currentFiles[fileId]

  // 更新选中状态
  document.querySelectorAll(".file-item").forEach((item) => {
    item.classList.remove("active")
  })
  event.currentTarget.classList.add("active")

  // 显示文件内容
  const fileViewer = document.getElementById("fileViewer")
  fileViewer.innerHTML = `
        <div class="file-header">
            <h3>📄 ${file.name}</h3>
            <div class="file-controls">
                <button onclick="editFile('${fileId}')">编辑</button>
                <button onclick="openRaw('${fileId}')">查看Raw</button>
            </div>
        </div>
        <div class="file-content">
            <pre><code>${escapeHtml(file.content)}</code></pre>
        </div>
    `
}

// 编辑文件
function editFile(fileId) {
  const file = currentFiles[fileId]
  const fileViewer = document.getElementById("fileViewer")

  fileViewer.innerHTML = `
        <div class="file-header">
            <h3>✏️ 编辑 ${file.name}</h3>
            <div class="file-controls">
                <button onclick="saveFile('${fileId}')">保存</button>
                <button onclick="selectFile('${fileId}')">取消</button>
            </div>
        </div>
        <div class="file-content">
            <textarea id="codeEditor" class="code-editor">${file.content}</textarea>
        </div>
    `
}

// 保存文件
function saveFile(fileId) {
  const content = document.getElementById("codeEditor").value
  currentFiles[fileId].content = content
  selectFile(fileId)
  alert("文件已保存！")
}

// 打开Raw模式
function openRaw(fileKey) {
  const fileId = REVERSE_FILE_MAP[fileKey]
  if (fileId) {
    history.pushState(null, null, `/r/${fileId}`)
    displayRawContent(fileKey)
  }
}

// 删除文件
function deleteFile(fileId) {
  if (confirm("确定要删除这个文件吗？")) {
    delete currentFiles[fileId]
    renderFileList()

    // 如果删除的是当前选中的文件，清空查看器
    if (currentFileId === fileId) {
      document.getElementById("fileViewer").innerHTML = `
                <div class="welcome-message">
                    <h2>文件已删除</h2>
                    <p>选择其他文件以查看内容</p>
                </div>
            `
    }
  }
}

// 添加新文件
function addFile() {
  const fileName = prompt("请输入文件名（包含扩展名）:")
  if (fileName) {
    const fileId = fileName.replace(/\.[^/.]+$/, "") // 移除扩展名作为ID
    currentFiles[fileId] = {
      name: fileName,
      content: `-- 新建文件: ${fileName}\nprint("Hello World!")`,
      type: fileName.split(".").pop(),
    }
    renderFileList()
  }
}

// HTML转义函数
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// 处理浏览器后退按钮
window.addEventListener("popstate", (event) => {
  const path = window.location.pathname
  if (path === "/" || path === "/index.html") {
    if (isAuthenticated) {
      showMainInterface()
    } else {
      showLoginInterface()
    }
  } else {
    handleSpecialRequest(path)
  }
})

// API端点模拟（用于Roblox executor）
window.API = {
  // 获取文件内容
  getFile: (fileId, apiKey) => {
    if (apiKey !== API_KEY) {
      return { error: "Invalid API key" }
    }

    const file = currentFiles[fileId]
    if (file) {
      return { success: true, content: file.content, name: file.name }
    } else {
      return { error: "File not found" }
    }
  },

  // 获取文件列表
  getFileList: (apiKey) => {
    if (apiKey !== API_KEY) {
      return { error: "Invalid API key" }
    }

    const fileList = Object.keys(currentFiles).map((id) => ({
      id: id,
      name: currentFiles[id].name,
      type: currentFiles[id].type,
    }))

    return { success: true, files: fileList }
  },
}

function handleSpecialRequest(path) {
  const parts = path.split("/")
  const mode = parts[1] // 'r' for raw, 'x' for execute
  const fileId = parts[2]

  if (!fileId || !FILE_ID_MAP[fileId]) {
    show404()
    return
  }

  const fileKey = FILE_ID_MAP[fileId]

  // 检查权限
  if (!checkAccess()) {
    showAccessDenied()
    return
  }

  if (mode === "r") {
    displayRawContent(fileKey)
  } else if (mode === "x") {
    displayExecutableContent(fileKey)
  }
}

function checkAccess() {
  // 检查是否已登录
  if (sessionStorage.getItem("authenticated") === "true") {
    return true
  }

  // 检查是否为Roblox executor
  const userAgent = navigator.userAgent
  if (isRobloxExecutor(userAgent)) {
    return true
  }

  // 检查API密钥
  const urlParams = new URLSearchParams(window.location.search)
  const apiKey = urlParams.get("api")
  if (apiKey === API_KEY) {
    return true
  }

  return false
}

// 显示404页面
function show404() {
  document.getElementById("loginContainer").classList.add("hidden")
  document.getElementById("mainContainer").classList.add("hidden")
  document.getElementById("rawContainer").classList.add("hidden")
  document.getElementById("errorContainer").classList.remove("hidden")
  document.getElementById("executableContainer").classList.add("hidden")
  document.getElementById("errorContent").textContent = "404 - 文件未找到"
}

// 显示访问被拒绝页面
function showAccessDenied() {
  document.getElementById("loginContainer").classList.add("hidden")
  document.getElementById("mainContainer").classList.add("hidden")
  document.getElementById("rawContainer").classList.add("hidden")
  document.getElementById("errorContainer").classList.remove("hidden")
  document.getElementById("executableContainer").classList.add("hidden")
  document.getElementById("errorContent").textContent = "访问被拒绝"
}

// 显示可执行内容
function displayExecutableContent(fileKey) {
  document.getElementById("loginContainer").classList.add("hidden")
  document.getElementById("mainContainer").classList.add("hidden")
  document.getElementById("rawContainer").classList.add("hidden")
  document.getElementById("errorContainer").classList.add("hidden")
  document.getElementById("executableContainer").classList.remove("hidden")

  const file = currentFiles[fileKey]
  const executableContent = document.getElementById("executableContent")

  if (file) {
    executableContent.textContent = `-- 执行文件: ${file.name}\n${file.content}`
  } else {
    executableContent.textContent = '-- 文件未找到\nprint("错误: 文件不存在")'
  }
}

// 在 showMainInterface 函数中更新API信息显示
function updateApiInfo() {
  const currentDomain = DOMAIN_CONFIG.getCurrentDomain()
  const apiInfoElement = document.querySelector(".api-details")
  if (apiInfoElement) {
    apiInfoElement.innerHTML = `
      <p><strong>API Key:</strong> <code>yyds_steve_76</code></p>
      <p><strong>当前域名:</strong> <code>${currentDomain}</code></p>
      <p><strong>Raw 访问:</strong> <code>https://${currentDomain}/r/文件标识符</code></p>
      <p><strong>执行访问:</strong> <code>https://${currentDomain}/x/文件标识符</code></p>
      <p><strong>示例:</strong> <code>https://${currentDomain}/r/a1b2c3</code></p>
    `
  }
}
