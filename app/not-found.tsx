import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">File not found</p>
        <p className="text-gray-500 mt-2">The requested script could not be found.</p>
        <Link href="/">
          <Button className="mt-6">Back to Scripts</Button>
        </Link>
      </div>
    </div>
  )
}
