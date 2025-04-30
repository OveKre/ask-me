import { NextResponse } from "next/server"
import { run, get, all } from "../../../lib/db"

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

export async function GET() {
  try {
    const forms = await all('SELECT * FROM forms') as Form[]
    console.log('Fetched forms:', forms)
    return NextResponse.json(forms)
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received form data:', body)
    const { title, description, questions } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Insert the form first
    console.log('Inserting form:', { title, description })
    const formResult = await run(
      'INSERT INTO forms (title, description) VALUES (?, ?)',
      [title, description]
    ) as { lastID: number };

    if (!formResult.lastID) {
      throw new Error('Failed to get form ID after insertion');
    }

    const formId = formResult.lastID;
    console.log('Form inserted with ID:', formId);

    // Insert questions if they exist
    if (questions && Array.isArray(questions) && questions.length > 0) {
      console.log('Inserting questions:', questions);
      
      for (const question of questions) {
        if (!question.text || !question.type) {
          console.error('Invalid question data:', question);
          continue;
        }

        await run(
          'INSERT INTO questions (form_id, text, type, required) VALUES (?, ?, ?, ?)',
          [formId, question.text, question.type, !!question.required]
        );
      }
    }

    // Fetch the complete form with questions
    const form = await get('SELECT * FROM forms WHERE id = ?', [formId]) as Form;
    const formQuestions = await all('SELECT * FROM questions WHERE form_id = ?', [formId]) as Question[];
    
    const result = { ...form, questions: formQuestions };
    console.log('Created form with questions:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json({ 
      error: "Failed to create form",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 