import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  // 简单的硬编码认证 - 在生产环境中应该使用更安全的方法
  const VALID_USERNAME = "admin" // 你可以修改这个用户名
  const VALID_PASSWORD = "hbhub2024" // 你可以修改这个密码

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set("auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
}
