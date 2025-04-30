"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  type: string
  text: string
  required: boolean
  options: string | null
}

interface Form {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

export default function FormPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch form")
        }
        const data = await response.json()
        setForm(data)
      } catch (error) {
        console.error("Error fetching form:", error)
        setError("Failed to load form")
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [params.id])

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
        <Button onClick={() => router.push("/forms")} className="mt-4">
          Back to Forms
        </Button>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="container mx-auto py-8">
        <div className="p-4 bg-yellow-50 text-yellow-600 rounded-md">
          Form not found
        </div>
        <Button onClick={() => router.push("/forms")} className="mt-4">
          Back to Forms
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600">{form.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {form.questions.map((question) => (
          <div key={question.id} className="p-4 border rounded-lg space-y-4">
            <div>
              <p className="font-medium">
                {question.text}
                {question.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </p>
            </div>

            {question.type === "text" && (
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Your answer"
              />
            )}

            {question.type === "multiple-choice" && (
              <div className="space-y-2">
                {JSON.parse(question.options || "[]").map(
                  (option: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        id={`option-${question.id}-${index}`}
                      />
                      <label htmlFor={`option-${question.id}-${index}`}>
                        {option}
                      </label>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button onClick={() => router.push("/forms")}>
          Back to Forms
        </Button>
      </div>
    </div>
  )
} 