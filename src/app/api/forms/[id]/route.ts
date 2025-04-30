import { NextResponse } from "next/server"
import { get, all } from "../../../../lib/db"

interface Form {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

interface Question {
  id: number;
  form_id: number;
  text: string;
  type: string;
  required: boolean;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the form
    const form = await get(
      'SELECT * FROM forms WHERE id = ?',
      [params.id]
    ) as Form;

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // Get the form's questions
    const questions = await all(
      'SELECT * FROM questions WHERE form_id = ? ORDER BY id',
      [params.id]
    ) as Question[];

    // Return the combined result
    return NextResponse.json({
      ...form,
      questions
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Failed to fetch form" },
      { status: 500 }
    );
  }
} 