import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

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
      return Buffer.from(file.content, "base64").toString("utf-8")
    }

    return null
  } catch (error) {
    console.error("Error fetching file content:", error)
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("auth")?.value === "true"

  if (!isLoggedIn) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const content = await getFileContent(params.filename)

  if (!content) {
    return new NextResponse("File not found", { status: 404 })
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  })
}
