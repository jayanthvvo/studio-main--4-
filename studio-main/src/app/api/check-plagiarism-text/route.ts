// src/app/api/check-plagiarism-text/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { checkPlagiarism } from '@/ai/flows/check-plagiarism';

// This is our new, secure endpoint for checking plain text
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split('Bearer ')[1];

  try {
    await adminAuth.verifyIdToken(token); // 1. Authenticate the user
    const { text } = await request.json(); // 2. Get the plain text

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text provided to check.' }, { status: 400 });
    }

    // 3. Call our secure Genkit flow (server-to-server)
    const checkOutput = await checkPlagiarism({ text: text });

    // 4. Send back *only* the result
    return NextResponse.json(checkOutput);

  } catch (error: any) {
    console.error("Failed to check plagiarism:", error);
    return NextResponse.json({ error: 'Failed to run check.', details: error.message }, { status: 500 });
  }
}
