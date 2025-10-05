import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';

// ... (GET function remains the same)

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

    const { title, content, deadline, fileName, fileType } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }
    
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
      content, // Storing the Base64 string
      fileName,
      fileType,
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