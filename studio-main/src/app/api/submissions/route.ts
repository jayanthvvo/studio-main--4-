// src/app/api/submissions/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// The GET function for the supervisor dashboard remains the same.
// This is a complex query to get all submissions for students of a supervisor.
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


// POST function for creating a new submission
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
        _id: user._id, // Embed the student's ObjectId for easier lookups
        uid: user.uid,
        name: user.displayName || 'Unknown Student',
        avatarUrl: user.avatarUrl || `https://picsum.photos/seed/${user.uid}/100/100`,
      },
      title,
      content,
      fileName,
      fileType,
      status: "In Review" as const,
      deadline: deadline || new Date().toISOString().split('T')[0],
      grade: null,
      submittedAt: new Date(),
      feedback: null,
    };

    const submissionResult = await db.collection("submissions").insertOne(newSubmission);
    const newSubmissionId = submissionResult.insertedId;

    // --- MODIFICATION START ---
    // After creating the submission, find and update the corresponding milestone.
    if (newSubmissionId) {
        console.log(`[API/SUBMISSIONS] Attempting to update milestone for studentId: ${user._id} with title: ${title}`);
        
        const milestoneUpdateResult = await db.collection("milestones").updateOne(
            // CORRECTED QUERY: Use the student's MongoDB _id, not their Firebase uid
            { studentId: user._id, title: title, status: { $ne: 'Complete' } },
            { 
                $set: { 
                    status: 'Complete', // Mark the milestone as complete
                    submissionId: newSubmissionId.toString() // Link the submission to the milestone
                } 
            }
        );

        console.log(`[API/SUBMISSIONS] Matched: ${milestoneUpdateResult.matchedCount}, Modified: ${milestoneUpdateResult.modifiedCount}`);

        // --- Now, activate the next milestone ---
        if (milestoneUpdateResult.modifiedCount > 0) {
            const allMilestones = await db.collection("milestones").find({ studentId: user._id }).sort({ _id: 1 }).toArray();
            const completedIndex = allMilestones.findIndex(m => m.title === title);

            if (completedIndex !== -1 && completedIndex + 1 < allMilestones.length) {
                const nextMilestone = allMilestones[completedIndex + 1];
                if (nextMilestone.status === 'Upcoming') {
                    await db.collection("milestones").updateOne(
                        { _id: nextMilestone._id },
                        { $set: { status: 'Pending' } }
                    );
                     console.log(`[API/SUBMISSIONS] Activated next milestone: ${nextMilestone.title}`);
                }
            }
        }
    }
    // --- MODIFICATION END ---

    return NextResponse.json({ ...newSubmission, _id: newSubmissionId }, { status: 201 });

  } catch (error) {
    console.error("!!!!!!!!!! SUBMISSION API ERROR !!!!!!!!!!:", error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}