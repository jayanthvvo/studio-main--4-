// src/app/api/submissions/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// The GET function for the supervisor dashboard remains the same.
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
        
        const supervisor = await db.collection("users").findOne({ uid: supervisorUid });
        if (!supervisor || supervisor.role !== 'supervisor') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        
        const dissertations = await db.collection("dissertations").find({ supervisorId: supervisor._id }).toArray();
        if (dissertations.length === 0) {
            return NextResponse.json([]);
        }

        const studentIds = dissertations.map(d => d.studentId);
        const students = await db.collection("users").find({ _id: { $in: studentIds } }).toArray();
        const studentUids = students.map(s => s.uid);

        const submissions = await db.collection("submissions").find({ "student.uid": { $in: studentUids } }).sort({ submittedAt: -1 }).toArray();
        
        return NextResponse.json(submissions);

    } catch (error) {
        console.error("Failed to fetch submissions:", error);
        return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }
}


// --- MODIFICATION: The POST function is now much more robust ---
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const { content, fileName, fileType } = await request.json(); // Title is no longer needed from the client

    if (!content) {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");
    const user = await db.collection("users").findOne({ uid: uid });

    if (!user) {
         return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    // --- NEW LOGIC: Find the active milestone directly in the backend ---
    const activeMilestone = await db.collection("milestones").findOne({
        studentId: user._id,
        status: 'In Progress' // The active milestone is the one 'In Progress'
    });

    if (!activeMilestone) {
        return NextResponse.json({ error: 'No active milestone is awaiting submission.' }, { status: 400 });
    }
    // --- END NEW LOGIC ---

    const newSubmission = {
      student: {
        _id: user._id,
        uid: user.uid,
        name: user.displayName || 'Unknown Student',
        avatarUrl: user.avatarUrl || `https://picsum.photos/seed/${user.uid}/100/100`,
      },
      title: activeMilestone.title, // Use the title from the milestone we found
      content,
      fileName,
      fileType,
      status: "In Review" as const,
      submittedAt: new Date(),
      feedback: null,
    };

    const submissionResult = await db.collection("submissions").insertOne(newSubmission);
    const newSubmissionId = submissionResult.insertedId;

    if (newSubmissionId) {
        // Now, update the milestone we found by its unique _id
        const milestoneUpdateResult = await db.collection("milestones").updateOne(
            { _id: activeMilestone._id },
            { 
                $set: { 
                    status: 'Complete',
                    submissionId: newSubmissionId.toString()
                } 
            }
        );

        // --- Activate the next milestone ---
        if (milestoneUpdateResult.modifiedCount > 0) {
            const allMilestones = await db.collection("milestones").find({ studentId: user._id }).sort({ _id: 1 }).toArray();
            const completedIndex = allMilestones.findIndex(m => m._id.equals(activeMilestone._id));

            if (completedIndex !== -1 && completedIndex + 1 < allMilestones.length) {
                const nextMilestone = allMilestones[completedIndex + 1];
                if (nextMilestone.status === 'Upcoming') {
                    await db.collection("milestones").updateOne(
                        { _id: nextMilestone._id },
                        { $set: { status: 'Pending' } }
                    );
                }
            }
        }
    }

    return NextResponse.json({ ...newSubmission, _id: newSubmissionId }, { status: 201 });

  } catch (error) {
    console.error("!!!!!!!!!! SUBMISSION API ERROR !!!!!!!!!!:", error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}