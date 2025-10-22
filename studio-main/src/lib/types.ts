/*
 * src/lib/types.ts
 * Added fileData field to Submission interface for BSON Binary data
 */
// --- MODIFICATION: Import Binary from mongodb ---
// Note: If this causes issues in client-side components,
// you might need to use `any` or `Buffer` type instead.
import { Binary } from 'mongodb';

export interface Submission {
  id: string;
  _id?: any; // For MongoDB ObjectId
  student: {
    _id?: any; // For MongoDB ObjectId
    name: string;
    avatarUrl: string;
    uid?: string;
  };
  title: string;
  status: "In Review" | "Approved" | "Requires Revisions" | "Pending" | "Reviewed" | "Complete";
  submittedAt: string; // Or Date
  deadline: string; // Or Date
  grade: string | null;
  content: string;
  fileName: string | null; // Original filename for display
  fileType: string | null; // Original file type
  // --- MODIFICATION: Add fileData, remove/comment fileStoragePath ---
  fileData?: Binary | null; // Field to hold BSON Binary data (optional on client)
  // fileStoragePath: string | null; // No longer needed for this approach
  // --- End Modification ---
  feedback: string | null;
  downloadUrl?: string | null; // Can keep if used for temporary client state
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