// src/lib/data.ts
import { Submission, Milestone } from '@/lib/types';

export const submissions: Submission[] = [
  {
    id: '1',
    student: {
      name: 'Alice Johnson',
      avatarUrl: 'https://picsum.photos/seed/1/100/100',
    },
    title: 'The Impact of AI on Modern Literature',
    status: 'Approved',
    deadline: '2024-08-15',
    grade: 'A-',
    submittedAt: '2024-07-20',
    content: `Abstract: This dissertation explores the multifaceted impact of artificial intelligence on contemporary literary creation and consumption, examining both generative text models and analytical tools. It argues that while AI presents challenges to traditional notions of authorship, it also opens up new avenues for narrative experimentation and critical inquiry. The study analyzes works from pioneering digital artists and authors who have integrated AI into their creative process, highlighting the evolution of storytelling in the digital age. Furthermore, it discusses the ethical implications and the future role of human creativity in an increasingly automated world. The conclusion posits that AI, rather than replacing human authors, can serve as a collaborative partner, augmenting and expanding the boundaries of literary expression.`,
    feedback: 'Excellent work, Alice. Your analysis is thorough and well-supported. Minor revisions on chapter 3 would be beneficial.',
    fileName: 'chapter1.pdf',
    fileType: 'application/pdf',
  },
  {
    id: '2',
    student: {
      name: 'Bob Williams',
      avatarUrl: 'https://picsum.photos/seed/2/100/100',
    },
    title: 'Quantum Computing: A Theoretical Framework',
    status: 'In Review',
    deadline: '2024-09-01',
    grade: null,
    submittedAt: '2024-08-10',
    content: `Introduction: Quantum computing represents a paradigm shift in computational theory, promising to solve complex problems that are intractable for classical computers. This dissertation provides a comprehensive theoretical framework for understanding quantum algorithms and their potential applications. It begins with an overview of quantum mechanics, including superposition and entanglement, before delving into the mathematics of qubits and quantum gates. Key algorithms such as Shor's algorithm for factoring and Grover's algorithm for searching are analyzed in detail. The paper also explores the challenges in building a scalable quantum computer, including decoherence and error correction. Finally, it speculates on the future impact of quantum computing on fields ranging from cryptography to materials science, offering a roadmap for future research in this burgeoning field.`,
    feedback: null,
    fileName: 'quantum_framework.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    id: '3',
    student: {
      name: 'Charlie Brown',
      avatarUrl: 'https://picsum.photos/seed/3/100/100',
    },
    title: 'Renaissance Art and its Patronage Systems',
    status: 'Requires Revisions',
    deadline: '2024-08-20',
    grade: 'C+',
    submittedAt: '2024-07-15',
    content: `Chapter 1: The Medici family was instrumental in the flourishing of Renaissance art in Florence. Their patronage supported artists like Michelangelo and Leonardo da Vinci, enabling the creation of masterpieces that defined an era. This dissertation examines the complex relationship between patrons and artists during the Italian Renaissance, arguing that patronage was not merely financial support but a dynamic interplay of power, ambition, and artistic vision. It analyzes how the specific demands and tastes of patrons shaped the subject matter, style, and scale of artworks. Case studies of the Medici, the Sforza, and the Papacy illustrate different models of patronage and their impact on artistic production. The study concludes that understanding the patronage system is essential to fully appreciating the context and meaning of Renaissance art.`,
    feedback: 'Your research is promising, but the central thesis needs to be clearer. Please revise chapters 2 and 4 based on my comments.',
    fileName: 'renaissance_patronage.pdf',
    fileType: 'application/pdf',
  },
  {
    id: '4',
    student: {
      name: 'Diana Prince',
      avatarUrl: 'https://picsum.photos/seed/4/100/100',
    },
    title: 'Sustainable Urban Development in Megacities',
    status: 'Pending',
    deadline: '2024-09-10',
    grade: null,
    submittedAt: '',
    content: `Proposal: This dissertation aims to analyze and compare sustainable urban development strategies in three major megacities: Tokyo, Mexico City, and Lagos. The research will focus on key areas such as public transportation, waste management, green infrastructure, and housing policy. By employing a mixed-methods approach, including policy analysis, statistical data, and case studies, this study seeks to identify best practices and common challenges in achieving urban sustainability. The expected outcome is a set of policy recommendations that can be adapted to other rapidly growing urban centers around the world. The research will contribute to the broader academic discourse on urban planning and environmental science, providing valuable insights for policymakers and urban developers.`,
    feedback: null,
    fileName: '',
    fileType: '',
  },
   {
    id: '5',
    student: {
      name: 'Alice Johnson',
      avatarUrl: 'https://picsum.photos/seed/1/100/100',
    },
    title: 'Chapter 2: Literature Review',
    status: 'In Review',
    deadline: '2024-09-05',
    grade: null,
    submittedAt: '2024-09-01',
    content: 'This is the literature review for my dissertation on the impact of AI on modern literature.',
    feedback: null,
    fileName: 'chapter2_lit_review.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
];

export const milestones: Milestone[] = [
  { id: 'm1', title: 'Dissertation Proposal', dueDate: '2024-07-20', status: 'Complete', submissionId: '1' },
  { id: 'm2', title: 'Chapter 1: Introduction', dueDate: '2024-08-15', status: 'Complete', submissionId: '1' },
  { id: 'm3', title: 'Chapter 2: Literature Review', dueDate: '2024-09-05', status: 'Complete', submissionId: '5' },
  { id: 'm4', title: 'Chapter 3: Methodology', dueDate: '2024-09-25', status: 'Pending' },
  { id: 'm5', title: 'Chapter 4: Results', dueDate: '2024-10-15', status: 'Upcoming' },
  { id: 'm6', title: 'Final Draft', dueDate: '2024-11-15', status: 'Upcoming' },
];


export const getSubmissionById = (id: string): Submission | undefined => {
  return submissions.find((s) => s.id === id);
};

export const getMilestonesByStudent = (studentName: string): Milestone[] => {
  // In a real app, you'd filter milestones by student ID.
  // For this demo, we'll return all milestones for Alice Johnson.
  if (studentName === "Alice Johnson") {
    return JSON.parse(JSON.stringify(milestones));
  }
  return [];
};