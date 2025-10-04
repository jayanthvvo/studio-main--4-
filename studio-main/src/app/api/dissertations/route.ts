import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// This function handles POST requests to create a new dissertation
export async function POST(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Verify the user is an admin
        const decodedToken = await adminAuth.verifyIdToken(token);
        const client = await clientPromise;
        const db = client.db("thesisFlowDB");
        const adminUser = await db.collection("users").findOne({ uid: decodedToken.uid });

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { title, studentId, supervisorId } = await request.json();

        if (!title || !studentId || !supervisorId) {
            return NextResponse.json({ error: 'Title, studentId, and supervisorId are required.' }, { status: 400 });
        }

        const newDissertation = {
            title,
            studentId: new ObjectId(studentId), // Assuming you pass the ObjectId string from the frontend
            supervisorId: new ObjectId(supervisorId),
            status: 'In Progress',
            createdAt: new Date(),
        };

        const result = await db.collection("dissertations").insertOne(newDissertation);
        
        return NextResponse.json({ ...newDissertation, _id: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error("!!!!!!!!!! DISSERTATION API ERROR !!!!!!!!!!:", error);
        return NextResponse.json({ error: 'Failed to create dissertation' }, { status: 500 });
    }
}