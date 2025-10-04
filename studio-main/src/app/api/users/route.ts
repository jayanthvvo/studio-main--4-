import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';

// GET all users (students and supervisors)
export async function GET(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // First, verify the user is an admin
        const decodedToken = await adminAuth.verifyIdToken(token);
        const client = await clientPromise;
        const db = client.db("thesisFlowDB");
        const adminUser = await db.collection("users").findOne({ uid: decodedToken.uid });

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 });
        }

        // Fetch all users from the database
        const users = await db.collection("users").find({}).toArray();
        
        return NextResponse.json(users);

    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}