import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// GET submissions for the currently logged-in supervisor
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const supervisorUid = decodedToken.uid;

    const client = await clientPromise;
    const db = client.db("thesisFlowDB");

    // 1. Find the supervisor's user document to get their MongoDB ObjectId
    const supervisor = await db.collection("users").findOne({ uid: supervisorUid });
    if (!supervisor) {
      return NextResponse.json({ error: 'Supervisor profile not found.' }, { status: 404 });
    }
    const supervisorId = supervisor._id;

    // 2. Find all dissertations assigned to this supervisor
    const dissertations = await db.collection("dissertations").find({ supervisorId: supervisorId }).toArray();
    if (!dissertations.length) {
      return NextResponse.json([]); // No dissertations, so no submissions to show
    }

    // 3. Get an array of the student IDs from these dissertations
    const studentIds = dissertations.map(d => d.studentId);
    
    // 4. Find all users who are these students to get their UIDs
    const students = await db.collection("users").find({ _id: { $in: studentIds } }).toArray();
    const studentUids = students.map(s => s.uid);

    // 5. Fetch only the submissions from those students
    const submissions = await db.collection("submissions").find({ "student.uid": { $in: studentUids } }).toArray();
    
    return NextResponse.json(submissions);

  } catch (error) {
    console.error("Failed to fetch supervisor's submissions:", error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// POST function for creating a new submission (remains the same)
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