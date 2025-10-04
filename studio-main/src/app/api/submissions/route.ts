import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';

// GET all submissions (for supervisor)
export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");
    const submissions = await db.collection("submissions").find({}).toArray();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// POST a new submission (for student)
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const { title, content, deadline } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }
    
    // Fetch user details to embed in the submission
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");
    const user = await db.collection("users").findOne({ uid: uid });

    if (!user) {
         return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    const newSubmission = {
      student: {
        uid: user.uid,
        name: user.displayName || 'Unknown Student',
        avatarUrl: user.avatarUrl || `https://picsum.photos/seed/${user.uid}/100/100`,
      },
      title,
      content,
      status: "In Review" as const,
      deadline: deadline || new Date().toISOString().split('T')[0],
      grade: null,
      submittedAt: new Date(),
      feedback: null,
    };

    await db.collection("submissions").insertOne(newSubmission);

    return NextResponse.json(newSubmission, { status: 201 });

  } catch (error) {
    console.error("!!!!!!!!!! SUBMISSION API ERROR !!!!!!!!!!:", error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}
