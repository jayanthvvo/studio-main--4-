// src/lib/types.ts
export interface Submission {
  id: string;
  _id?: any; // For MongoDB ObjectId
  student: {
    name: string;
    avatarUrl: string;
    uid?: string;
  };
  title: string;
  status: "In Review" | "Approved" | "Requires Revisions" | "Pending" | "Reviewed" | "Complete";
  submittedAt: string;
  deadline: string;
  grade: string | null;
  content: string; 
  fileName: string;
  fileType: string;
  feedback: string | null;
}

export interface Milestone {
  id: string;
  _id?: any; // For MongoDB ObjectId
  title: string;
  dueDate: string;
  status: 'Complete' | 'In Progress' | 'Pending' | 'Upcoming';
  submissionId?: string;
}

export interface Message {
  id: string;
  _id?: any;
  sender: 'student' | 'supervisor';
  text: string;
  timestamp: Date;
}