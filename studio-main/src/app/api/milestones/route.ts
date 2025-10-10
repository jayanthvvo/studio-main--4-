// src/app/api/milestones/route.ts

import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");

    const { searchParams } = new URL(request.url);
    const studentIdFromQuery = searchParams.get('studentId');
    
    let studentToQueryId: ObjectId;

    // --- MODIFICATION START ---
    if (studentIdFromQuery) {
        // SCENARIO 1: Supervisor is asking for a specific student's milestones
        console.log(`[API/MILESTONES] Supervisor request for studentId: ${studentIdFromQuery}`);
        if (!ObjectId.isValid(studentIdFromQuery)) {
            return NextResponse.json({ error: 'A valid studentId must be provided.' }, { status: 400 });
        }
        studentToQueryId = new ObjectId(studentIdFromQuery);

    } else {
        // SCENARIO 2: Student is asking for their own milestones
        console.log(`[API/MILESTONES] Student request for their own milestones. UID: ${decodedToken.uid}`);
        const user = await db.collection("users").findOne({ uid: decodedToken.uid });
        if (!user) {
            return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
        }
        studentToQueryId = user._id;
    }
    // --- MODIFICATION END ---


    const milestones = await db.collection("milestones").find({ 
        studentId: studentToQueryId 
    }).sort({ _id: 1 }).toArray();
    
    console.log(`[API/MILESTONES] Found ${milestones.length} milestones for studentId: ${studentToQueryId}.`);

    return NextResponse.json(milestones);

  } catch (error) {
    console.error("Failed to fetch milestones:", error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

// The PATCH function remains the same
export async function PATCH(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const client = await clientPromise;
        const db = client.db("thesisFlowDB");

        const supervisor = await db.collection("users").findOne({ uid: decodedToken.uid });
        if (!supervisor || supervisor.role !== 'supervisor') {
            return NextResponse.json({ error: 'Forbidden: Only supervisors can update due dates.' }, { status: 403 });
        }
        
        const { milestoneId, dueDate } = await request.json();
        
        if (!milestoneId || !dueDate || !ObjectId.isValid(milestoneId)) {
            return NextResponse.json({ error: 'A valid milestoneId and dueDate are required.' }, { status: 400 });
        }
        
        const result = await db.collection("milestones").updateOne(
            { _id: new ObjectId(milestoneId) },
            { $set: { dueDate: dueDate, status: 'In Progress' } }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Milestone not found or not modified.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Milestone updated successfully.' });
    } catch (error) {
        console.error("Failed to update milestone:", error);
        return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
    }
}