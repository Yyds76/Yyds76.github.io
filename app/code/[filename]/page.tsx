import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { CodeViewer } from "@/components/code-viewer"

async function getFileContent(filename: string) {
  const GITHUB_USERNAME = "your-username"
  const GITHUB_REPO = "your-repo"

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filename}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 },
      },
    )

    if (!response.ok) {
      return null
    }

    const file = await response.json()

    if (file.content) {
      const content = Buffer.from(file.content, "base64").toString("utf-8")
      return {
        name: file.name,
        content,
        size: file.size,
        download_url: file.download_url,
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching file content:", error)
    return null
  }
}

export default async function CodePage({ params }: { params: { filename: string } }) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("auth")?.value === "true"

  if (!isLoggedIn) {
    redirect("/login")
  }

  const file = await getFileContent(params.filename)

  if (!file) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <a href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                ← Back to Scripts
              </a>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{file.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Size: {(file.size / 1024).toFixed(2)} KB</span>
              <a
                href={`/api/raw/${params.filename}`}
                target="_blank"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                rel="noreferrer"
              >
                Raw
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CodeViewer content={file.content} filename={file.name} />
      </main>
    </div>
  )
}
