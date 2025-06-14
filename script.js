// 全局变量
let isAuthenticated = false
let currentFiles = {}
let currentFileId = null
let fileUpdateInterval = null
const API_KEY = "yyds_steve_76"
const PASSWORD = "SuperMiner"

// GitHub配置
const GITHUB_CONFIG = {
  owner: "Yyds76",
  repo: "Yyds76.github.io",
  branch: "main", // 或者 "master"，根据您的默认分支
  apiBase: "https://api.github.com",
  rawBase: "https://raw.githubusercontent.com",
}

// 域名配置
const DOMAIN_CONFIG = {
  primary: "www.hbhub.dpdns.org",
  fallback: "yyds76.github.io",
  getCurrentDomain: () => {
    return window.location.hostname
  },
}

// 文件ID映射 - 动态生成
let FILE_ID_MAP = {}
let REVERSE_FILE_MAP = {}

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 初始化应用...")
  initializeApp()
})

// 初始化应用程序
async function initializeApp() {
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
      await handleSpecialRequest(path)
      return
    }

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
async function showMainInterface() {
  console.log("🏠 显示主界面")
  hideAllContainers()
  document.getElementById("mainContainer").classList.remove("hidden")

  // 显示加载状态
  showLoadingState()

  // 加载GitHub文件
  await loadGitHubFiles()

  // 开始定期检测更新
  startFileUpdateDetection()

  updateApiInfo()
}

// 显示加载状态
function showLoadingState() {
  const fileListDiv = document.getElementById("fileList")
  if (fileListDiv) {
    fileListDiv.innerHTML = `
      <div class="loading-state">
        <div class="loading"></div>
        <p>正在从GitHub加载文件...</p>
      </div>
    `
  }
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
    errorDiv.textContent = "密码��误，请重试"
    passwordInput.value = ""
  }
}

// 退出登录
function logout() {
  console.log("👋 退出登录")
  isAuthenticated = false
  sessionStorage.removeItem("authenticated")

  // 停止文件更新检测
  stopFileUpdateDetection()

  showLoginInterface()
  document.getElementById("passwordInput").value = ""
}

// 返回首页
function goHome() {
  window.location.href = "/"
}

// 从GitHub加载文件
async function loadGitHubFiles() {
  try {
    console.log("📡 从GitHub加载文件...")

    // 获取存储库内容
    const response = await fetch(
      `${GITHUB_CONFIG.apiBase}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Yyds76-FileManager",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`GitHub API错误: ${response.status} ${response.statusText}`)
    }

    const files = await response.json()
    console.log("📁 获取到文件列表:", files.length, "个项目")

    // 过滤出.lua文件和其他代码文件
    const codeFiles = files.filter(
      (file) =>
        file.type === "file" &&
        (file.name.endsWith(".lua") ||
          file.name.endsWith(".js") ||
          file.name.endsWith(".py") ||
          file.name.endsWith(".txt")),
    )

    console.log("🔍 找到代码文件:", codeFiles.length, "个")

    // 重置文件映射
    FILE_ID_MAP = {}
    REVERSE_FILE_MAP = {}
    currentFiles = {}

    // 为每个文件生成ID并加载内容
    for (let i = 0; i < codeFiles.length; i++) {
      const file = codeFiles[i]
      const fileId = generateFileId(i)
      const fileName = file.name.replace(/\.[^/.]+$/, "") // 移除扩展名作为key

      FILE_ID_MAP[fileId] = fileName
      REVERSE_FILE_MAP[fileName] = fileId

      // 加载文件内容
      try {
        const content = await loadFileContent(file.download_url)
        currentFiles[fileName] = {
          name: file.name,
          content: content,
          type: file.name.split(".").pop(),
          sha: file.sha,
          url: file.download_url,
          lastModified: new Date().toISOString(),
        }
        console.log("✅ 已加载:", file.name)
      } catch (error) {
        console.error("❌ 加载文件失败:", file.name, error)
        currentFiles[fileName] = {
          name: file.name,
          content: `-- 加载失败: ${error.message}`,
          type: file.name.split(".").pop(),
          error: true,
        }
      }
    }

    console.log("🎉 所有文件加载完成，共", Object.keys(currentFiles).length, "个文件")
    renderFileList()
  } catch (error) {
    console.error("❌ 加载GitHub文件失败:", error)
    showError("无法从GitHub加载文件: " + error.message)
  }
}

// 生成文件ID
function generateFileId(index) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  let num = index + 1000 // 确保至少4位数

  while (num > 0) {
    result = chars[num % chars.length] + result
    num = Math.floor(num / chars.length)
  }

  return result.padStart(6, "a")
}

// 加载文件内容
async function loadFileContent(downloadUrl) {
  const response = await fetch(downloadUrl)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return await response.text()
}

// 开始文件更新检测
function startFileUpdateDetection() {
  console.log("🔄 开始文件更新检测...")

  // 清除现有的定时器
  if (fileUpdateInterval) {
    clearInterval(fileUpdateInterval)
  }

  // 每30秒检测一次更新
  fileUpdateInterval = setInterval(async () => {
    await checkForUpdates()
  }, 30000)
}

// 停止文件更新检测
function stopFileUpdateDetection() {
  if (fileUpdateInterval) {
    console.log("⏹️ 停止文件更新检测")
    clearInterval(fileUpdateInterval)
    fileUpdateInterval = null
  }
}

// 检查文件更新
async function checkForUpdates() {
  try {
    console.log("🔍 检查文件更新...")

    const response = await fetch(
      `${GITHUB_CONFIG.apiBase}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Yyds76-FileManager",
        },
      },
    )

    if (!response.ok) {
      console.warn("⚠️ 检查更新失败:", response.status)
      return
    }

    const files = await response.json()
    const codeFiles = files.filter(
      (file) =>
        file.type === "file" &&
        (file.name.endsWith(".lua") ||
          file.name.endsWith(".js") ||
          file.name.endsWith(".py") ||
          file.name.endsWith(".txt")),
    )

    let hasUpdates = false

    // 检查现有文件是否有更新
    for (const file of codeFiles) {
      const fileName = file.name.replace(/\.[^/.]+$/, "")
      const currentFile = currentFiles[fileName]

      if (currentFile && currentFile.sha !== file.sha) {
        console.log("🔄 检测到文件更新:", file.name)

        // 重新加载文件内容
        try {
          const content = await loadFileContent(file.download_url)
          currentFiles[fileName] = {
            ...currentFile,
            content: content,
            sha: file.sha,
            lastModified: new Date().toISOString(),
          }
          hasUpdates = true
        } catch (error) {
          console.error("❌ 更新文件失败:", file.name, error)
        }
      }
    }

    // 检查是否有新文件
    const currentFileNames = Object.values(currentFiles).map((f) => f.name)
    const newFiles = codeFiles.filter((file) => !currentFileNames.includes(file.name))

    if (newFiles.length > 0) {
      console.log("➕ 检测到新文件:", newFiles.length, "个")
      await loadGitHubFiles() // 重新加载所有文件
      return
    }

    // 检查是否有文件被删除
    const githubFileNames = codeFiles.map((f) => f.name)
    const deletedFiles = Object.values(currentFiles).filter((f) => !githubFileNames.includes(f.name))

    if (deletedFiles.length > 0) {
      console.log("🗑️ 检测到文件删除:", deletedFiles.length, "个")
      await loadGitHubFiles() // 重新加载所有文件
      return
    }

    if (hasUpdates) {
      console.log("✅ 文件已更新")
      renderFileList()

      // 如果当前正在查看已更新的文件，刷新显示
      if (currentFileId && currentFiles[currentFileId]) {
        selectFile(currentFileId)
      }
    }
  } catch (error) {
    console.error("❌ 检查更新失败:", error)
  }
}

// 渲染文件列表
function renderFileList() {
  const fileListDiv = document.getElementById("fileList")
  if (!fileListDiv) {
    console.error("❌ 找不到文件列表容器")
    return
  }

  if (Object.keys(currentFiles).length === 0) {
    fileListDiv.innerHTML = `
      <div class="empty-state">
        <p>📭 存储库中没有找到代码文件</p>
        <p>支持的文件类型: .lua, .js, .py, .txt</p>
      </div>
    `
    return
  }

  fileListDiv.innerHTML = ""
  console.log("📋 渲染文件列表...")

  for (const [fileKey, file] of Object.entries(currentFiles)) {
    const fileId = REVERSE_FILE_MAP[fileKey] || "unknown"
    const fileItem = document.createElement("div")
    fileItem.className = "file-item"

    // 添加更新时间显示
    const updateTime = file.lastModified ? new Date(file.lastModified).toLocaleTimeString() : "未知"

    fileItem.innerHTML = `
      <div class="file-info">
        <div class="file-name">
          <span>📄</span>
          <span>${file.name}</span>
          ${file.error ? '<span class="error-badge">❌</span>' : ""}
        </div>
        <div class="file-meta">
          <small>更新: ${updateTime}</small>
        </div>
      </div>
      <div class="file-actions">
        <button class="raw-btn" onclick="openRaw('${fileKey}')">Raw</button>
        <button class="refresh-btn" onclick="refreshFile('${fileKey}')">刷新</button>
      </div>
    `

    fileItem.addEventListener("click", (e) => {
      if (!e.target.classList.contains("raw-btn") && !e.target.classList.contains("refresh-btn")) {
        selectFile(fileKey, fileItem)
      }
    })

    fileListDiv.appendChild(fileItem)
  }

  console.log("✅ 文件列表渲染完成")
}

// 刷新单个文件
async function refreshFile(fileKey) {
  const file = currentFiles[fileKey]
  if (!file || !file.url) return

  try {
    console.log("🔄 刷新文件:", file.name)
    const content = await loadFileContent(file.url)

    currentFiles[fileKey] = {
      ...file,
      content: content,
      lastModified: new Date().toISOString(),
      error: false,
    }

    renderFileList()

    // 如果当前正在查看这个文件，刷新显示
    if (currentFileId === fileKey) {
      selectFile(fileKey)
    }

    console.log("✅ 文件刷新完成:", file.name)
  } catch (error) {
    console.error("❌ 刷新文件失败:", file.name, error)
    alert("刷新文件失败: " + error.message)
  }
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
    const lastModified = file.lastModified ? new Date(file.lastModified).toLocaleString() : "未知"

    fileViewer.innerHTML = `
      <div class="file-header">
        <div class="file-title">
          <h3>📄 ${file.name}</h3>
          <div class="file-info-badge">
            <small>最后更新: ${lastModified}</small>
            ${file.error ? '<span class="error-badge">加载错误</span>' : ""}
          </div>
        </div>
        <div class="file-controls">
          <button onclick="refreshFile('${fileId}')">刷新</button>
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

// 打开Raw模式
function openRaw(fileKey) {
  const fileId = REVERSE_FILE_MAP[fileKey]
  if (fileId) {
    history.pushState(null, null, `/r/${fileId}`)
    displayRawContent(fileKey)
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
      <p><strong>GitHub存储库:</strong> <code>${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}</code></p>
      <p><strong>Raw 访问:</strong> <code>https://${currentDomain}/r/文件标识符</code></p>
      <p><strong>执行访问:</strong> <code>https://${currentDomain}/x/文件标识符</code></p>
      <p><strong>自动更新:</strong> <code>每30秒检测一次</code></p>
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
async function handleSpecialRequest(path) {
  const parts = path.split("/")
  const mode = parts[1] // 'r' for raw, 'x' for execute
  const fileId = parts[2]

  // 如果文件映射还没有加载，先加载
  if (Object.keys(FILE_ID_MAP).length === 0) {
    await loadGitHubFiles()
  }

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
window.addEventListener("popstate", async (event) => {
  const path = window.location.pathname
  if (path === "/" || path === "/index.html") {
    if (isAuthenticated) {
      await showMainInterface()
    } else {
      showLoginInterface()
    }
  } else {
    await handleSpecialRequest(path)
  }
})

// 全局错误处理
window.addEventListener("error", (event) => {
  console.error("❌ 全局错误:", event.error)
  showError("发生了意外错误: " + event.error.message)
})

// 页面卸载时清理定时器
window.addEventListener("beforeunload", () => {
  stopFileUpdateDetection()
})

console.log("📜 脚本加载完成")
