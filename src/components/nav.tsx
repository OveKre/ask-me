"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function Nav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Ask Me
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/forms">
            <Button variant="ghost">My Forms</Button>
          </Link>
          <Link href="/forms/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Form
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
} 