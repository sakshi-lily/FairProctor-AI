import { QuestionItem } from '../types/proctoring';

export const SYNTHETIC_EXAM_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    category: 'Algorithms & Complexity',
    text: 'What is the worst-case asymptotic time complexity of standard Quicksort when choosing the first element as the pivot on an already sorted array?',
    options: [
      { key: 'A', label: 'O(n log n)' },
      { key: 'B', label: 'O(n^2)' },
      { key: 'C', label: 'O(log n)' },
      { key: 'D', label: 'O(n)' },
    ],
  },
  {
    id: 2,
    category: 'Data Structures',
    text: 'Which abstract data structure operates on a Last-In, First-Out (LIFO) discipline?',
    options: [
      { key: 'A', label: 'Queue' },
      { key: 'B', label: 'Binary Search Tree' },
      { key: 'C', label: 'Stack' },
      { key: 'D', label: 'Circular Buffer' },
    ],
  },
  {
    id: 3,
    category: 'Operating Systems & Concurrency',
    text: 'Which of the following is NOT one of Coffman’s four necessary conditions for a deadlock in a concurrent operating system?',
    options: [
      { key: 'A', label: 'Mutual Exclusion' },
      { key: 'B', label: 'Preemptive Scheduling' },
      { key: 'C', label: 'Hold and Wait' },
      { key: 'D', label: 'Circular Wait' },
    ],
  },
  {
    id: 4,
    category: 'Computer Networks',
    text: 'In the Transmission Control Protocol (TCP), which sequence of packet flags establishes a reliable 3-way connection handshake?',
    options: [
      { key: 'A', label: 'SYN -> SYN-ACK -> ACK' },
      { key: 'B', label: 'ACK -> SYN -> ACK' },
      { key: 'C', label: 'FIN -> FIN-ACK -> ACK' },
      { key: 'D', label: 'SYN -> ACK -> RST' },
    ],
  },
  {
    id: 5,
    category: 'Software Engineering Principles',
    text: 'In the SOLID design principles, what does the Single Responsibility Principle (SRP) dictate?',
    options: [
      { key: 'A', label: 'A class should have only one reason to change, encapsulating a single function.' },
      { key: 'B', label: 'Software entities should be open for extension, but closed for modification.' },
      { key: 'C', label: 'Derived classes must be substitutable for their base classes.' },
      { key: 'D', label: 'Clients should not be forced to depend upon interfaces they do not use.' },
    ],
  },
];
