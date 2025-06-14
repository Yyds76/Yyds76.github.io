// Configuration
const CONFIG = {
  password: "SuperMiner",
  apiKey: "yyds_steve_76",
  repoOwner: "Yyds76",
  repoName: "Yyds76.github.io",
}

// Sample file structure (you'll need to update this with your actual files)
const fileStructure = {
  "test.lua": {
    type: "file",
    content: `-- Test Lua Script
print("Hello from test.lua!")
local function testFunction()
    return "This is a test function"
end

print(testFunction())`,
  },
  "scripts/": {
    type: "folder",
    children: {
      "example.lua": {
        type: "file",
        content: `-- Example Script
local Players = game:GetService("Players")
local player = Players.LocalPlayer

print("Player name: " .. player.Name)`,
      },
      "utils.lua": {
        type: "file",
        content: `-- Utility Functions
local Utils = {}

function Utils.wait(seconds)
    wait(seconds)
end

function Utils.print(message)
    print("[Utils] " .. message)
end

return Utils`,
      },
    },
  },
  "config.json": {
    type: "file",
    content: `{
    "version": "1.0.0",
    "author": "Yyds76",
    "description": "Repository configuration"
}`,
  },
}

let currentPath = ""
let isAuthenticated = false

// Check if user is Roblox executor
function isRobloxExecutor() {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes("roblox") || userAgent.includes("executor") || window.roblox !== undefined
}

// Check authentication on page load
window.addEventListener("load", () => {
  // Check if it's a Roblox executor
  if (isRobloxExecutor()) {
    isAuthenticated = true
    showMainContent()
    return
  }

  // Check for API access
  const urlParams = new URLSearchParams(window.location.search)
  const apiKey = urlParams.get("api")
  if (apiKey === CONFIG.apiKey) {
    isAuthenticated = true
    showMainContent()
    return
  }

  // Check session storage for authentication
  if (sessionStorage.getItem("authenticated") === "true") {
    isAuthenticated = true
    showMainContent()
    return
  }

  // Show login modal
  showLoginModal()
})

function showLoginModal() {
  document.getElementById("loginModal").style.display = "flex"
  document.getElementById("mainContent").classList.add("hidden")
  document.getElementById("rawContent").classList.add("hidden")
}

function showMainContent() {
  document.getElementById("loginModal").style.display = "none"
  document.getElementById("mainContent").classList.remove("hidden")
  document.getElementById("rawContent").classList.add("hidden")
  loadFiles(currentPath)
}

function authenticate() {
  const password = document.getElementById("passwordInput").value
  const errorDiv = document.getElementById("loginError")

  if (password === CONFIG.password) {
    isAuthenticated = true
    sessionStorage.setItem("authenticated", "true")
    showMainContent()
    errorDiv.textContent = ""
  } else {
    errorDiv.textContent = "Incorrect password"
  }
}

function logout() {
  isAuthenticated = false
  sessionStorage.removeItem("authenticated")
  currentPath = ""
  showLoginModal()
}

function loadFiles(path) {
  if (!isAuthenticated) {
    showLoginModal()
    return
  }

  const fileListDiv = document.getElementById("fileList")
  const breadcrumbDiv = document.getElementById("breadcrumb")

  // Update breadcrumb
  updateBreadcrumb(path)

  // Get files for current path
  const files = getFilesAtPath(path)

  fileListDiv.innerHTML = ""

  // Add parent directory link if not at root
  if (path !== "") {
    const parentItem = createFileItem("..", "folder", true)
    fileListDiv.appendChild(parentItem)
  }

  // Add files and folders
  Object.keys(files).forEach((name) => {
    const item = files[name]
    const fileItem = createFileItem(name, item.type, false, path)
    fileListDiv.appendChild(fileItem)
  })
}

function getFilesAtPath(path) {
  if (path === "") {
    return fileStructure
  }

  const pathParts = path.split("/").filter((p) => p !== "")
  let current = fileStructure

  for (const part of pathParts) {
    if (current[part] && current[part].type === "folder") {
      current = current[part].children
    } else {
      return {}
    }
  }

  return current
}

function createFileItem(name, type, isParent, currentPath = "") {
  const item = document.createElement("div")
  item.className = "file-item"
  if (type === "folder") item.classList.add("folder")

  const icon = document.createElement("span")
  icon.className = "file-icon"
  icon.textContent = type === "folder" ? "📁" : "📄"

  const nameSpan = document.createElement("span")
  nameSpan.className = "file-name"
  nameSpan.textContent = name

  const actions = document.createElement("div")
  actions.className = "file-actions"

  if (type === "file" && !isParent) {
    const rawBtn = document.createElement("button")
    rawBtn.className = "raw-btn"
    rawBtn.textContent = "Raw"
    rawBtn.onclick = (e) => {
      e.stopPropagation()
      showRawContent(currentPath, name)
    }
    actions.appendChild(rawBtn)
  }

  item.appendChild(icon)
  item.appendChild(nameSpan)
  item.appendChild(actions)

  item.onclick = () => {
    if (isParent) {
      const parentPath = currentPath.split("/").slice(0, -1).join("/")
      navigateToPath(parentPath)
    } else if (type === "folder") {
      const newPath = currentPath ? `${currentPath}/${name}` : name.replace("/", "")
      navigateToPath(newPath)
    }
  }

  return item
}

function navigateToPath(path) {
  currentPath = path
  loadFiles(path)

  // Update URL without showing file extension
  const cleanPath = path.replace(/\/$/, "")
  const newUrl = cleanPath ? `/${cleanPath}` : "/"
  history.pushState({ path: path }, "", newUrl)
}

function updateBreadcrumb(path) {
  const breadcrumbDiv = document.getElementById("breadcrumb")
  breadcrumbDiv.innerHTML = "<span onclick=\"navigateToPath('')\">Repository</span>"

  if (path) {
    const parts = path.split("/").filter((p) => p !== "")
    let currentPath = ""

    parts.forEach((part, index) => {
      currentPath += (currentPath ? "/" : "") + part
      breadcrumbDiv.innerHTML += ` / <span onclick="navigateToPath('${currentPath}')">${part}</span>`
    })
  }
}

function showRawContent(path, filename) {
  if (!isAuthenticated) {
    showLoginModal()
    return
  }

  const fullPath = path ? `${path}/${filename}` : filename
  const content = getFileContent(fullPath)

  document.getElementById("mainContent").classList.add("hidden")
  document.getElementById("rawContent").classList.remove("hidden")
  document.getElementById("codeContent").textContent = content

  // Update URL for raw view
  const rawUrl = `/raw/${fullPath}`
  history.pushState({ raw: true, path: fullPath }, "", rawUrl)
}

function getFileContent(filePath) {
  const pathParts = filePath.split("/")
  const filename = pathParts.pop()
  const dirPath = pathParts.join("/")

  const files = getFilesAtPath(dirPath)

  if (files[filename] && files[filename].type === "file") {
    return files[filename].content
  }

  return "File not found"
}

function goBack() {
  document.getElementById("rawContent").classList.add("hidden")
  document.getElementById("mainContent").classList.remove("hidden")

  // Restore previous URL
  const cleanPath = currentPath.replace(/\/$/, "")
  const newUrl = cleanPath ? `/${cleanPath}` : "/"
  history.pushState({ path: currentPath }, "", newUrl)
}

// Handle browser back/forward buttons
window.addEventListener("popstate", (event) => {
  if (event.state && event.state.raw) {
    showRawContent("", event.state.path)
  } else {
    const path = event.state ? event.state.path : ""
    navigateToPath(path)
  }
})

// API endpoint simulation for Roblox executors
window.addEventListener("message", (event) => {
  if (event.data.type === "API_REQUEST" && event.data.apiKey === CONFIG.apiKey) {
    const filePath = event.data.filePath
    const content = getFileContent(filePath)

    event.source.postMessage(
      {
        type: "API_RESPONSE",
        content: content,
        filePath: filePath,
      },
      "*",
    )
  }
})

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && document.getElementById("passwordInput") === document.activeElement) {
    authenticate()
  }
})
