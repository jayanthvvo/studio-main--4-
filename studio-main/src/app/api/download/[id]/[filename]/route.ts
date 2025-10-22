/*
 * src/app/api/download/[id]/[filename]/route.ts
 * Modified GET to retrieve BSON Binary file data from MongoDB
 */
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin'; // Still using Firebase for Auth
import { ObjectId, Binary } from 'mongodb'; // Import Binary
import { Readable } from 'stream'; // Import Readable from stream

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; filename: string } }
) {
  const authHeader = request.headers.get('Authorization');
  const submissionId = params.id;
  const encodedFilename = params.filename;

  // --- Authentication & Basic Validation (Same as before) ---
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
  }
  if (!ObjectId.isValid(submissionId)) {
    return NextResponse.json({ error: 'Invalid Submission ID.' }, { status: 400 });
  }
  if (!encodedFilename) {
    return NextResponse.json({ error: 'Filename is required.' }, { status: 400 });
  }

  const filename = decodeURIComponent(encodedFilename);
  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const requestorUid = decodedToken.uid;

    const client = await clientPromise;
    const db = client.db("thesisFlowDB");

    // --- Fetch Submission & Authorization Check (Same as before) ---
    const submissionObjectId = new ObjectId(submissionId);
    // --- MODIFICATION: Project only the necessary fields, including fileData ---
    const submission = await db.collection("submissions").findOne(
        { _id: submissionObjectId },
        { projection: { student: 1, fileName: 1, fileType: 1, fileData: 1 } } // Fetch fileData
    );
    // --- End Modification ---

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }
    if (submission.fileName !== filename) {
        console.warn(`Requested filename "${filename}" does not match stored filename "${submission.fileName}" for submission ${submissionId}`);
        return NextResponse.json({ error: 'Filename mismatch.' }, { status: 400 });
    }

    // --- MODIFICATION: Check if fileData exists ---
    if (!submission.fileData || !(submission.fileData instanceof Binary)) {
        console.error(`No BSON Binary fileData found for submission ${submissionId}`);
        return NextResponse.json({ error: 'No file data found for this submission.' }, { status: 404 });
    }
    // --- End Modification ---

    const requestor = await db.collection("users").findOne({ uid: requestorUid });
     if (!requestor) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }
    // ... (Authorization logic remains the same) ...
     let isAuthorized = false;
     if (submission.student.uid === requestorUid) {
      isAuthorized = true;
    } else if (requestor.role === 'supervisor') {
      const dissertation = await db.collection("dissertations").findOne({
        studentId: submission.student._id,
        supervisorId: requestor._id
      });
      if (dissertation) {
        isAuthorized = true;
      }
    }
     if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to download this file.' }, { status: 403 });
    }
    // --- End Authorization Check ---


    // --- MongoDB Binary Data Download Logic ---
    const fileBuffer = submission.fileData.buffer; // Access the underlying Buffer from BSON Binary
    const contentType = submission.fileType || 'application/pdf'; // Default to pdf since that's the only allowed type

    // Create a Readable stream from the Buffer
    const readableStream = Readable.from(fileBuffer);

    // Convert Node.js Readable stream to Web ReadableStream
    const webReadableStream = Readable.toWeb(readableStream) as ReadableStream<Uint8Array>;

    return new NextResponse(webReadableStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(), // Get length from buffer
      },
    });
    // --- End MongoDB Binary Logic ---

  } catch (error: any) {
    console.error("!!!!!!!!!! FAILED TO DOWNLOAD FILE (MongoDB Binary) !!!!!!!!!!:", error);
     if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to download file.', details: error.message }, { status: 500 });
  }
}