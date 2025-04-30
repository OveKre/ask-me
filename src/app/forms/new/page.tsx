"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

type QuestionType = "text" | "multiple-choice" | "checkbox"

interface Question {
  id: string
  type: QuestionType
  text: string
  required: boolean
  options?: string[]
}

export default function NewFormPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addQuestion = (type: QuestionType) => {
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(36).substr(2, 9),
        type,
        text: "",
        required: false,
        options: type === "multiple-choice" ? [""] : undefined,
      },
    ])
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    )
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), ""] }
          : q
      )
    )
  }

  const updateOption = (questionId: string, index: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.map((opt, i) =>
                i === index ? value : opt
              ),
            }
          : q
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          questions: questions.map(({ id, ...rest }) => rest), // Remove client-side IDs
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create form")
      }

      // Redirect to the forms list page
      router.push("/forms")
    } catch (err) {
      console.error("Error creating form:", err)
      setError(err instanceof Error ? err.message : "Failed to create form")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Form</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Form Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter form title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Form Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question) => (
            <div
              key={question.id}
              className="p-4 border rounded-lg space-y-4"
            >
              <div className="flex justify-between items-start">
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) =>
                    updateQuestion(question.id, { text: e.target.value })
                  }
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Question text"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {question.type === "multiple-choice" && (
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          updateOption(question.id, index, e.target.value)
                        }
                        className="flex-1 p-2 border rounded-md"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(question.id)}
                  >
                    Add Option
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`required-${question.id}`}
                  checked={question.required}
                  onChange={(e) =>
                    updateQuestion(question.id, { required: e.target.checked })
                  }
                />
                <label htmlFor={`required-${question.id}`}>Required</label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => addQuestion("text")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Text Question
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => addQuestion("multiple-choice")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Multiple Choice
          </Button>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating Form..." : "Create Form"}
        </Button>
      </form>
    </div>
  )
} 