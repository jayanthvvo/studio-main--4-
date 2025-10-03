export type SubmissionStatus = 'Pending' | 'In Review' | 'Approved' | 'Requires Revisions';

export type Submission = {
  id: string;
  student: {
    name: string;
    avatarUrl: string;
  };
  title: string;
  status: SubmissionStatus;
  deadline: string;
  grade: string | null;
  submittedAt: string;
  content: string;
  feedback: string | null;
};

export type Message = {
    id: string;
    sender: 'student' | 'supervisor';
    text: string;
    timestamp: string;
};

export type MilestoneStatus = 'Complete' | 'In Progress' | 'Pending' | 'Upcoming';

export type Milestone = {
  id: string;
  title: string;
  dueDate: string;
  status: MilestoneStatus;
  submissionId?: string;
};
