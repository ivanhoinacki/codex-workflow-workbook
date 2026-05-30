export type QuestionType = 'single-choice' | 'true-false' | 'short-answer';

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: string | boolean;
  required: boolean;
  feedback?: string;
};

export type Checkpoint = {
  id: string;
  label: string;
  required: boolean;
};

export type WorkbookPage = {
  id: string;
  title: string;
  journeyId: string;
  chapterId: string;
  order: number;
  track: string[];
  sourcePath: string;
  markdown: string;
  checkpoints: Checkpoint[];
  questions: Question[];
};

export type Chapter = {
  id: string;
  title: string;
  description: string;
  pages: WorkbookPage[];
};

export type Journey = {
  id: string;
  title: string;
  description: string;
  track: string[];
  chapters: Chapter[];
};
