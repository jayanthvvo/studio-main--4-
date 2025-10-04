import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// GET all dissertations with populated student and supervisor info
export async function GET(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const client = await clientPromise;
        const db = client.db("thesisFlowDB");
        const adminUser = await db.collection("users").findOne({ uid: decodedToken.uid });

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Use MongoDB's aggregation pipeline to join collections
        const dissertations = await db.collection("dissertations").aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "supervisorId",
                    foreignField: "_id",
                    as: "supervisorInfo"
                }
            },
            {
                $unwind: "$studentInfo" // Deconstruct the array from the lookup
            },
            {
                $unwind: "$supervisorInfo"
            },
            {
                $project: { // Select and rename fields for the final output
                    _id: 1,
                    title: 1,
                    status: 1,
                    createdAt: 1,
                    studentName: "$studentInfo.displayName",
                    supervisorName: "$supervisorInfo.displayName"
                }
            }
        ]).toArray();
        
        return NextResponse.json(dissertations);

    } catch (error) {
        console.error("Failed to fetch dissertations:", error);
        return NextResponse.json({ error: 'Failed to fetch dissertations' }, { status: 500 });
    }
}


// POST function to create a new dissertation (remains the same)
export async function POST(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
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
            studentId: new ObjectId(studentId),
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