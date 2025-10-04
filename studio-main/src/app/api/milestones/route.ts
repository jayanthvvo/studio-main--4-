import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// GET milestones
export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");
    
    // In a real app, you would filter by a studentId from the request.
    // For now, we fetch all milestones to display on the supervisor's timeline.
    const milestones = await db.collection("milestones").find({}).sort({ id: 1 }).toArray();
    
    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Failed to fetch milestones:", error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

// PATCH to update a milestone (e.g., set a due date)
export async function PATCH(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Securely verify that the user is a supervisor
        const decodedToken = await adminAuth.verifyIdToken(token);
        const client = await clientPromise;
        const db = client.db("thesisFlowDB");
        const userDoc = await db.collection("users").findOne({ uid: decodedToken.uid });

        if (!userDoc || userDoc.role !== 'supervisor') {
             return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 });
        }
        
        const { milestoneId, dueDate } = await request.json();

        if (!milestoneId || !dueDate) {
            return NextResponse.json({ error: 'Milestone ID and due date are required.' }, { status: 400 });
        }

        // Find the milestone by its MongoDB ObjectId and update it
        const result = await db.collection("milestones").updateOne(
            { _id: new ObjectId(milestoneId) },
            { $set: { dueDate: dueDate, status: 'In Progress' } }
        );

        if (result.modifiedCount === 0) {
             return NextResponse.json({ error: 'Milestone not found or no changes were needed.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Milestone updated successfully.' });

    } catch (error) {
        console.error("!!!!!!!!!! MILESTONE API ERROR !!!!!!!!!!:", error);
        return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
    }
}
