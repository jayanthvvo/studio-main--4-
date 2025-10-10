// src/app/api/dissertations/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// CORRECTED GET function to fetch all dissertation projects
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

        // Authorization: Check if the user is an admin
        const adminUser = await db.collection("users").findOne({ uid: decodedToken.uid });
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // This aggregation pipeline joins dissertations with student and supervisor info
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
                $unwind: { path: "$studentInfo", preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: "$supervisorInfo", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    status: 1,
                    createdAt: 1,
                    student: {
                        _id: "$studentInfo._id",
                        name: "$studentInfo.displayName",
                    },
                    supervisor: {
                        _id: "$supervisorInfo._id",
                        name: "$supervisorInfo.displayName",
                    }
                }
            }
        ]).toArray();

        return NextResponse.json(dissertations);

    } catch (error) {
        console.error("!!!!!!!!!! FAILED TO FETCH DISSERTATIONS !!!!!!!!!!:", error);
        return NextResponse.json({ error: 'Failed to fetch dissertation projects' }, { status: 500 });
    }
}


// POST function to create a new dissertation project
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
        
        const studentObjectId = new ObjectId(studentId);
        const supervisorObjectId = new ObjectId(supervisorId);

        const newDissertation = {
            title,
            studentId: studentObjectId,
            supervisorId: supervisorObjectId,
            status: 'In Progress',
            createdAt: new Date(),
        };
        const result = await db.collection("dissertations").insertOne(newDissertation);
        const dissertationId = result.insertedId;

        if (dissertationId) {
            const milestoneTemplate = [
                { title: 'Dissertation Proposal', status: 'Pending' },
                { title: 'Chapter 1: Introduction', status: 'Upcoming' },
                { title: 'Chapter 2: Literature Review', status: 'Upcoming' },
                { title: 'Chapter 3: Methodology', status: 'Upcoming' },
                { title: 'Chapter 4: Results & Analysis', status: 'Upcoming' },
                { title: 'Final Draft Submission', status: 'Upcoming' },
            ];
            
            const milestonesToInsert = milestoneTemplate.map(milestone => ({
                dissertationId: dissertationId,
                studentId: studentObjectId,
                title: milestone.title,
                status: milestone.status,
                dueDate: 'TBD',
                submissionId: null,
            }));

            await db.collection("milestones").insertMany(milestonesToInsert);
        }
        
        return NextResponse.json({ ...newDissertation, _id: dissertationId }, { status: 201 });

    } catch (error) {
        console.error("!!!!!!!!!! DISSERTATION CREATION ERROR !!!!!!!!!!:", error);
        return NextResponse.json({ error: 'Failed to create dissertation project' }, { status: 500 });
    }
}