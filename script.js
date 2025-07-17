// 配置信息 - 请替换为你的GitHub信息
const CONFIG = {
  GITHUB_USERNAME: "your-username", // 替换为你的GitHub用户名
  GITHUB_REPO: "your-repo-name", // 替换为你的仓库名
  LOGIN_USERNAME: "admin", // 登录用户名
  LOGIN_PASSWORD: "hbhub2024", // 登录密码
}

// 全局变量
let currentFiles = []
let selectedFile = null

// DOM 元素
const loginPage = document.getElementById("loginPage")
const mainPage = document.getElementById("mainPage")
const rawPage = document.getElementById("rawPage")
const loginForm = document.getElementById("loginForm")
const loginError = document.getElementById("loginError")
const logoutBtn = document.getElementById("logoutBtn")
const refreshBtn = document.getElementById("refreshBtn")
const fileList = document.getElementById("fileList")
const loadingFiles = document.getElementById("loadingFiles")
const noFiles = document.getElementById("noFiles")
const noSelection = document.getElementById("noSelection")
const codeContainer = document.getElementById("codeContainer")
const loadingCode = document.getElementById("loadingCode")
const fileName = document.getElementById("fileName")
const codeContent = document.getElementById("codeContent")
const copyBtn = document.getElementById("copyBtn")
const rawBtn = document.getElementById("rawBtn")
const rawContent = document.getElementById("rawContent")

// 检查URL参数，如果是raw模式则显示raw页面
function checkRawMode() {
  const urlParams = new URLSearchParams(window.location.search)
  const rawFile = urlParams.get("raw")

  if (rawFile) {
    showRawPage(rawFile)
    return true
  }
  return false
}

// 显示raw页面
async function showRawPage(filename) {
  loginPage.style.display = "none"
  mainPage.style.display = "none"
  rawPage.style.display = "block"

  try {
    // 验证文件名
    if (!isValidLuaFile(filename)) {
      rawContent.textContent = "Error: Invalid file type. Only .lua files are allowed."
      return
    }

    if (!isFileInWhitelist(filename)) {
      rawContent.textContent = "Error: File not in allowed list."
      return
    }

    const content = await fetchFileContent(filename)
    rawContent.textContent = content
  } catch (error) {
    rawContent.textContent = `Error: ${error.message}`
  }
}

// 登录处理
loginForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  if (username === CONFIG.LOGIN_USERNAME && password === CONFIG.LOGIN_PASSWORD) {
    loginPage.style.display = "none"
    mainPage.style.display = "block"
    loadFiles()
    hideError()
  } else {
    showError("用户名或密码错误")
  }
})

// 退出登录
logoutBtn.addEventListener("click", () => {
  mainPage.style.display = "none"
  loginPage.style.display = "block"
  document.getElementById("username").value = ""
  document.getElementById("password").value = ""
  hideError()
})

// 刷新文件列表
refreshBtn.addEventListener("click", loadFiles)

// 复制代码
copyBtn.addEventListener("click", () => {
  if (selectedFile) {
    navigator.clipboard.writeText(codeContent.textContent).then(() => {
      // 临时改变按钮文本
      const originalText = copyBtn.innerHTML
      copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制'
      setTimeout(() => {
        copyBtn.innerHTML = originalText
      }, 2000)
    })
  }
})

// Raw链接
rawBtn.addEventListener("click", () => {
  if (selectedFile) {
    const rawUrl = `${window.location.origin}${window.location.pathname}?raw=${selectedFile.name}`
    window.open(rawUrl, "_blank")
  }
})

// 显示错误信息
function showError(message) {
  loginError.textContent = message
  loginError.style.display = "block"
}

// 隐藏错误信息
function hideError() {
  loginError.style.display = "none"
}

// 加载文件列表
async function loadFiles() {
  showLoadingFiles()

  try {
    const response = await fetch(
      `https://api.github.com/repos/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/contents`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch files")
    }

    const files = await response.json()
    currentFiles = files.filter((file) => file.name.endsWith(".lua") && file.type === "file")

    displayFiles()
  } catch (error) {
    console.error("Error loading files:", error)
    showNoFiles()
  }
}

// 显示加载中
function showLoadingFiles() {
  loadingFiles.style.display = "flex"
  fileList.style.display = "none"
  noFiles.style.display = "none"
}

// 显示文件列表
function displayFiles() {
  loadingFiles.style.display = "none"

  if (currentFiles.length === 0) {
    showNoFiles()
    return
  }

  fileList.style.display = "block"
  fileList.innerHTML = ""

  currentFiles.forEach((file) => {
    const fileItem = document.createElement("div")
    fileItem.className = "file-item"
    fileItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <div>
                <span class="file-badge">.lua</span>
                <i class="fas fa-eye" style="margin-left: 8px; color: #94a3b8;"></i>
            </div>
        `

    fileItem.addEventListener("click", () => selectFile(file, fileItem))
    fileList.appendChild(fileItem)
  })
}

// 显示无文件
function showNoFiles() {
  loadingFiles.style.display = "none"
  fileList.style.display = "none"
  noFiles.style.display = "flex"
}

// 选择文件
async function selectFile(file, element) {
  // 更新UI状态
  document.querySelectorAll(".file-item").forEach((item) => item.classList.remove("active"))
  element.classList.add("active")

  selectedFile = file

  // 显示加载状态
  noSelection.style.display = "none"
  codeContainer.style.display = "none"
  loadingCode.style.display = "flex"

  try {
    const content = await fetchFileContent(file.name)

    // 显示代码
    fileName.textContent = file.name
    codeContent.textContent = content

    loadingCode.style.display = "none"
    codeContainer.style.display = "flex"
    copyBtn.style.display = "flex"
    rawBtn.style.display = "flex"
  } catch (error) {
    console.error("Error loading file content:", error)
    loadingCode.style.display = "none"
    noSelection.style.display = "flex"
  }
}

// 验证文件名是否安全
function isValidLuaFile(filename) {
  // 只允许.lua文件
  if (!filename.endsWith(".lua")) {
    return false
  }

  // 防止路径遍历攻击
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return false
  }

  // 只允许字母、数字、下划线、连字符和点
  const validPattern = /^[a-zA-Z0-9_.-]+\.lua$/
  return validPattern.test(filename)
}

// 白名单机制（可选）- 只允许特定的文件
const ALLOWED_FILES = [
  // 'script1.lua',
  // 'script2.lua',
  // 如果不想使用白名单，保持数组为空
]

function isFileInWhitelist(filename) {
  // 如果白名单为空，允许所有通过基本验证的文件
  if (ALLOWED_FILES.length === 0) {
    return true
  }
  return ALLOWED_FILES.includes(filename)
}

// 获取文件内容
async function fetchFileContent(filename) {
  // 验证文件名
  if (!isValidLuaFile(filename)) {
    throw new Error("Invalid file type. Only .lua files are allowed.")
  }

  // 检查白名单
  if (!isFileInWhitelist(filename)) {
    throw new Error("File not in allowed list.")
  }

  const response = await fetch(
    `https://raw.githubusercontent.com/${CONFIG.GITHUB_USERNAME}/${CONFIG.GITHUB_REPO}/main/${filename}`,
  )

  if (!response.ok) {
    throw new Error("Failed to fetch file content")
  }

  return await response.text()
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  // 检查是否是raw模式
  if (!checkRawMode()) {
    // 正常模式，显示登录页面
    loginPage.style.display = "block"
  }
})

// 处理浏览器后退按钮
window.addEventListener("popstate", () => {
  if (!checkRawMode()) {
    rawPage.style.display = "none"
    if (mainPage.style.display === "block") {
      mainPage.style.display = "block"
    } else {
      loginPage.style.display = "block"
    }
  }
})
