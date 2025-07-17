import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get("auth")?.value === "true"

  if (isLoggedIn) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to HB Hub</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Access Roblox Lua Scripts Repository</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
