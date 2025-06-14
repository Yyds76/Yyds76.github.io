// 全局变量
let isAuthenticated = false
let currentFiles = {}
let currentFileId = null
const API_KEY = "yyds_steve_76"
const PASSWORD = "SuperMiner"

// 域名配置
const DOMAIN_CONFIG = {
  primary: "www.hbhub.dpdns.org",
  fallback: "yyds76.github.io",
  getCurrentDomain: () => {
    return window.location.hostname
  },
}

// 文件ID映射
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
  console.log("🚀 初始化应用...")
  initializeApp()
})

// 初始化应用程序
function initializeApp() {
  try {
    console.log("📋 检查页面元素...")

    // 确保所有必要元素存在
    const requiredElements = [
      "loginContainer",
      "mainContainer",
      "rawContainer",
      "errorContainer",
      "executableContainer",
      "passwordInput",
    ]

    for (const elementId of requiredElements) {
      const element = document.getElementById(elementId)
      if (!element) {
        console.error(`❌ 缺少必要元素: ${elementId}`)
        return
      }
    }

    // 隐藏所有容器
    hideAllContainers()

    // 检查URL路径
    const path = window.location.pathname
    console.log("🔍 当前路径:", path)

    if (path.startsWith("/r/") || path.startsWith("/x/")) {
      console.log("🔗 处理特殊请求...")
      handleSpecialRequest(path)
      return
    }

    // 加载示例文件
    loadSampleFiles()
    console.log("📁 示例文件已加载")

    // 检查认证状态
    checkAuthentication()

    // 绑定事件
    bindEvents()
    console.log("✅ 应用初始化完成")
  } catch (error) {
    console.error("❌ 初始化失败:", error)
    showError("应用初始化失败: " + error.message)
  }
}

// 隐藏所有容器
function hideAllContainers() {
  const containers = ["loginContainer", "mainContainer", "rawContainer", "errorContainer", "executableContainer"]

  containers.forEach((id) => {
    const element = document.getElementById(id)
    if (element) {
      element.classList.add("hidden")
    }
  })
}

// 绑定事件
function bindEvents() {
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
  console.log("🔐 检查认证状态:", authStatus)

  if (authStatus === "true") {
    isAuthenticated = true
    showMainInterface()
  } else {
    showLoginInterface()
  }
}

// 显示登录界面
function showLoginInterface() {
  console.log("🔑 显示登录界面")
  hideAllContainers()
  document.getElementById("loginContainer").classList.remove("hidden")
}

// 显示主界面
function showMainInterface() {
  console.log("🏠 显示主界面")
  hideAllContainers()
  document.getElementById("mainContainer").classList.remove("hidden")
  renderFileList()
  updateApiInfo()
}

// 身份验证
function authenticate() {
  const passwordInput = document.getElementById("passwordInput")
  const errorDiv = document.getElementById("loginError")
  const password = passwordInput.value

  console.log("🔐 尝试登录...")

  if (password === PASSWORD) {
    console.log("✅ 登录成功")
    isAuthenticated = true
    sessionStorage.setItem("authenticated", "true")
    showMainInterface()
    errorDiv.textContent = ""
  } else {
    console.log("❌ 登录失败")
    errorDiv.textContent = "密码错误，请重试"
    passwordInput.value = ""
  }
}

// 退出登录
function logout() {
  console.log("👋 退出登录")
  isAuthenticated = false
  sessionStorage.removeItem("authenticated")
  showLoginInterface()
  document.getElementById("passwordInput").value = ""
}

// 返回首页
function goHome() {
  window.location.href = "/"
}

// 加载示例文件
function loadSampleFiles() {
  currentFiles = {
    test: {
      name: "test.lua",
      content: `-- 测试脚本
print("Hello from Yyds76 repository!")
print("当前域名: ${DOMAIN_CONFIG.getCurrentDomain()}")

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
  console.log("📁 已加载", Object.keys(currentFiles).length, "个示例文件")
}

// 渲染文件列表
function renderFileList() {
  const fileListDiv = document.getElementById("fileList")
  if (!fileListDiv) {
    console.error("❌ 找不到文件列表容器")
    return
  }

  fileListDiv.innerHTML = ""
  console.log("📋 渲染文件列表...")

  for (const [fileKey, file] of Object.entries(currentFiles)) {
    const fileId = REVERSE_FILE_MAP[fileKey] || "unknown"
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
        selectFile(fileKey, fileItem)
      }
    })

    fileListDiv.appendChild(fileItem)
  }

  console.log("✅ 文件列表渲染完成")
}

// 选择文件
function selectFile(fileId, itemElement) {
  currentFileId = fileId
  const file = currentFiles[fileId]

  if (!file) {
    console.error("❌ 文件不存在:", fileId)
    return
  }

  // 更新选中状态
  document.querySelectorAll(".file-item").forEach((item) => {
    item.classList.remove("active")
  })
  if (itemElement) {
    itemElement.classList.add("active")
  }

  // 显示文件内容
  const fileViewer = document.getElementById("fileViewer")
  if (fileViewer) {
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

  console.log("📄 已选择文件:", file.name)
}

// 编辑文件
function editFile(fileId) {
  const file = currentFiles[fileId]
  const fileViewer = document.getElementById("fileViewer")

  if (!file || !fileViewer) return

  fileViewer.innerHTML = `
    <div class="file-header">
      <h3>✏️ 编辑 ${file.name}</h3>
      <div class="file-controls">
        <button onclick="saveFile('${fileId}')">保存</button>
        <button onclick="cancelEdit('${fileId}')">取消</button>
      </div>
    </div>
    <div class="file-content">
      <textarea id="codeEditor" class="code-editor">${file.content}</textarea>
    </div>
  `
}

// 取消编辑
function cancelEdit(fileId) {
  selectFile(fileId)
}

// 保存文件
function saveFile(fileId) {
  const codeEditor = document.getElementById("codeEditor")
  if (!codeEditor) return

  const content = codeEditor.value
  currentFiles[fileId].content = content
  selectFile(fileId)
  alert("文件已保存！")
  console.log("💾 文件已保存:", fileId)
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

    if (currentFileId === fileId) {
      const fileViewer = document.getElementById("fileViewer")
      if (fileViewer) {
        fileViewer.innerHTML = `
          <div class="welcome-message">
            <h2>文件已删除</h2>
            <p>选择其他文件以查看内容</p>
          </div>
        `
      }
    }
    console.log("🗑️ 文件已删除:", fileId)
  }
}

// 添加新文件
function addFile() {
  const fileName = prompt("请输入文件名（包含扩展名）:")
  if (fileName) {
    const fileId = fileName.replace(/\.[^/.]+$/, "")
    currentFiles[fileId] = {
      name: fileName,
      content: `-- 新建文件: ${fileName}\nprint("Hello World!")`,
      type: fileName.split(".").pop(),
    }
    renderFileList()
    console.log("➕ 新文件已添加:", fileName)
  }
}

// 更新API信息
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

// 显示错误
function showError(message) {
  hideAllContainers()
  document.getElementById("errorContainer").classList.remove("hidden")
  document.getElementById("errorContent").textContent = message
}

// HTML转义函数
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// 检查是否为Roblox executor
function isRobloxExecutor(userAgent) {
  return (
    userAgent &&
    (userAgent.includes("Roblox") ||
      userAgent.includes("Synapse") ||
      userAgent.includes("Krnl") ||
      userAgent.includes("Executor"))
  )
}

// 处理特殊请求
function handleSpecialRequest(path) {
  const parts = path.split("/")
  const mode = parts[1] // 'r' for raw, 'x' for execute
  const fileId = parts[2]

  if (!fileId || !FILE_ID_MAP[fileId]) {
    showError("404 - 文件未找到")
    return
  }

  const fileKey = FILE_ID_MAP[fileId]

  if (!checkAccess()) {
    showError("访问被拒绝")
    return
  }

  if (mode === "r") {
    displayRawContent(fileKey)
  } else if (mode === "x") {
    displayExecutableContent(fileKey)
  }
}

// 检查访问权限
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

// 显示Raw内容
function displayRawContent(fileKey) {
  hideAllContainers()
  document.getElementById("rawContainer").classList.remove("hidden")

  const file = currentFiles[fileKey]
  const rawContent = document.getElementById("rawContent")

  if (file && rawContent) {
    rawContent.textContent = file.content
  } else {
    rawContent.textContent = '-- 文件未找到\nprint("错误: 文件不存在")'
  }
}

// 显示可执行内容
function displayExecutableContent(fileKey) {
  hideAllContainers()
  document.getElementById("executableContainer").classList.remove("hidden")

  const file = currentFiles[fileKey]
  const executableContent = document.getElementById("executableContent")

  if (file && executableContent) {
    executableContent.textContent = `-- 执行文件: ${file.name}\n${file.content}`
  } else {
    executableContent.textContent = '-- 文件未找到\nprint("错误: 文件不存在")'
  }
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

// 全局错误处理
window.addEventListener("error", (event) => {
  console.error("❌ 全局错误:", event.error)
  showError("发生了意外错误: " + event.error.message)
})

console.log("📜 脚本加载完成")

