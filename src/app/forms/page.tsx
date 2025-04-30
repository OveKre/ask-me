"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Form {
  id: string
  title: string
  description: string | null
  createdAt: string
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/forms")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch forms")
        }

        setForms(data)
      } catch (error) {
        console.error("Error fetching forms:", error)
        setError(error instanceof Error ? error.message : "Failed to load forms")
      } finally {
        setLoading(false)
      }
    }

    fetchForms()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Forms</h1>
        <Link href="/forms/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : forms.length === 0 ? (
        <div className="p-4 border rounded-lg">
          <p className="text-gray-500">No forms created yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <Link
              key={form.id}
              href={`/forms/${form.id}`}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{form.title}</h2>
              {form.description && (
                <p className="text-gray-600 mb-2">{form.description}</p>
              )}
              <p className="text-sm text-gray-500">
                Created on {new Date(form.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 