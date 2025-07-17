import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { CodeList } from "@/components/code-list"

async function getGitHubFiles() {
  // 这里需要替换为你的 GitHub 用户名和仓库名
  const GITHUB_USERNAME = "your-username"
  const GITHUB_REPO = "your-repo"

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // 如果是私有仓库，需要添加 token
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}`
      },
      next: { revalidate: 300 }, // 5分钟缓存
    })

    if (!response.ok) {
      throw new Error("Failed to fetch files")
    }

    const files = await response.json()
    return files.filter((file: any) => file.type === "file" && file.name.endsWith(".lua"))
  } catch (error) {
    console.error("Error fetching GitHub files:", error)
    return []
  }
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("auth")?.value === "true"

  if (!isLoggedIn) {
    redirect("/login")
  }

  const files = await getGitHubFiles()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HB Hub</h1>
              <p className="text-sm text-gray-600">Roblox Lua Scripts Repository</p>
            </div>
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Scripts</h2>
          <p className="text-gray-600">Click on any script to view its content</p>
        </div>

        <CodeList files={files} />
      </main>
    </div>
  )
}
