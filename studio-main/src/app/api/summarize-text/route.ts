// src/app/api/summarize-text/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { summarizeSubmission } from '@/ai/flows/summarize-submission';

// This is our new, secure endpoint for summarizing plain text
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
      return NextResponse.json({ error: 'No text provided to summarize.' }, { status: 400 });
    }

    // 3. Call our secure Genkit flow (server-to-server)
    const summaryOutput = await summarizeSubmission({ submissionContent: text });

    // 4. Send back *only* the summary
    return NextResponse.json({ summary: summaryOutput.summary });

  } catch (error: any) {
    console.error("Failed to summarize text:", error);
    return NextResponse.json({ error: 'Failed to generate summary.', details: error.message }, { status: 500 });
  }
}
