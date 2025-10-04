export interface Submission {
  id: string;
  _id?: any; // For MongoDB ObjectId
  student: {
    name: string;
    avatarUrl: string;
    uid?: string;
  };
  title: string;
  // **FIX: Add "Reviewed" to the list of possible statuses**
  status: "In Review" | "Complete" | "Needs Revision" | "Reviewed";
  submittedAt: string;
  deadline: string;
  grade: string | null;
  content: string;
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
  sender: 'student' | 'supervisor';
  text: string;
  timestamp: string;
}