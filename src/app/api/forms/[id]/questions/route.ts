import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDB();
    const questions = await db.all(
      'SELECT * FROM questions WHERE form_id = ? ORDER BY id',
      [params.id]
    );
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const db = await getDB();
    
    const result = await db.run(
      'INSERT INTO questions (form_id, text, type, required) VALUES (?, ?, ?, ?)',
      [params.id, body.text, body.type, body.required]
    );
    
    return NextResponse.json({ id: result.lastID });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
} 