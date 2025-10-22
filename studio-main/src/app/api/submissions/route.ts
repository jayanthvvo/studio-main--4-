/*
 * src/app/api/submissions/route.ts
 * Modified POST to handle FormData, convert file to BSON Binary, and store in MongoDB
 */

import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId, Binary } from 'mongodb'; // Import Binary

// GET function remains the same...
export async function GET(request: Request) {
    // ... (keep existing GET logic) ...
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


// --- MODIFICATION: Updated POST function ---
export async function POST(request: NextRequest) { // Changed Request to NextRequest
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // --- MODIFICATION: Parse FormData ---
    const formData = await request.formData();
    const content = formData.get('content') as string | null;
    const file = formData.get('file') as File | null;
    // --- End FormData Parsing ---

    if (!content && !file) { // Adjusted validation: need content OR file
      return NextResponse.json({ error: 'Submission content or a file is required.' }, { status: 400 });
    }
    // Size and type validation should have happened on client, but can add server-side checks here too if desired.

    const client = await clientPromise;
    const db = client.db("thesisFlowDB");
    const user = await db.collection("users").findOne({ uid: uid });

    if (!user) {
         return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    const activeMilestone = await db.collection("milestones").findOne({
        studentId: user._id,
        status: 'In Progress'
    });

    if (!activeMilestone) {
        return NextResponse.json({ error: 'No active milestone is awaiting submission.' }, { status: 400 });
    }

    // --- MODIFICATION: Process file into BSON Binary ---
    let fileData: Binary | null = null;
    let fileName: string | null = null;
    let fileType: string | null = null;

    if (file) {
        fileName = file.name;
        fileType = file.type;
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        // subtype 0 is the generic binary subtype
        fileData = new Binary(fileBuffer, 0);
        console.log(`Received file: ${fileName}, Type: ${fileType}, Size: ${fileBuffer.length} bytes`); // Debug log
    }
    // --- End File Processing ---


    const newSubmission = {
      student: {
        _id: user._id,
        uid: user.uid,
        name: user.displayName || 'Unknown Student',
        avatarUrl: user.avatarUrl || `https://picsum.photos/seed/${user.uid}/100/100`,
      },
      title: activeMilestone.title,
      content: content || "", // Use content field, default to empty string if null/undefined
      // --- MODIFICATION: Add fileData, keep fileName/fileType ---
      fileData: fileData,             // Store the BSON Binary data
      fileName: fileName,             // Original filename
      fileType: fileType,             // Original file type
      fileStoragePath: null,          // Remove or set to null if switching from storage path
      // --- End Modification ---
      status: "In Review" as const,
      submittedAt: new Date(),
      feedback: null,
      grade: null,
    };

    const submissionResult = await db.collection("submissions").insertOne(newSubmission);
    const newSubmissionId = submissionResult.insertedId;

    if (newSubmissionId) {
      // ... (Milestone update logic remains the same) ...
       const milestoneUpdateResult = await db.collection("milestones").updateOne(
            { _id: activeMilestone._id },
            {
                $set: {
                    status: 'Complete',
                    submissionId: newSubmissionId.toString()
                }
            }
        );

        if (milestoneUpdateResult.modifiedCount > 0) {
            const allMilestones = await db.collection("milestones").find({ studentId: user._id }).sort({ _id: 1 }).toArray();
            const completedIndex = allMilestones.findIndex(m => m._id.equals(activeMilestone._id));

            if (completedIndex !== -1 && completedIndex + 1 < allMilestones.length) {
                const nextMilestone = allMilestones[completedIndex + 1];
                 const nextStatus = (nextMilestone.dueDate && nextMilestone.dueDate !== 'TBD') ? 'In Progress' : 'Pending';
                if (nextMilestone.status === 'Upcoming') {
                     await db.collection("milestones").updateOne(
                        { _id: nextMilestone._id },
                        { $set: { status: nextStatus } }
                    );
                }
            }
        }
    }

    // Don't send fileData back in the response, just the confirmation
    const responseData = { ...newSubmission, _id: newSubmissionId };
    // @ts-ignore - delete fileData before sending response
    delete responseData.fileData;

    return NextResponse.json(responseData, { status: 201 });

  } catch (error: any) {
    console.error("!!!!!!!!!! SUBMISSION API ERROR (FormData) !!!!!!!!!!:", error);
    // Add specific error handling if needed
    if (error.name === 'MongoNetworkError') {
        return NextResponse.json({ error: 'Database connection error during submission.' }, { status: 500 });
    }
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
     return NextResponse.json({ error: 'Authentication error. Please log in again.' }, { status: 401 });
   }
    return NextResponse.json({ error: 'Failed to create submission record.', details: error.message }, { status: 500 });
  }
}