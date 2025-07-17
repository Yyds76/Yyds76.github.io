import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"
import Link from "next/link"

interface GitHubFile {
  name: string
  size: number
  download_url: string
  html_url: string
}

interface CodeListProps {
  files: GitHubFile[]
}

export function CodeList({ files }: CodeListProps) {
  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scripts found</h3>
            <p className="mt-1 text-sm text-gray-500">No Lua files found in the repository.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <Card key={file.name} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {file.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/code/${file.name}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium text-center"
              >
                View Code
              </Link>
              <Link
                href={`/api/raw/${file.name}`}
                target="_blank"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Raw
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
