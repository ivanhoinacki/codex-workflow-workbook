import type { Checkpoint, Question, WorkbookPage } from '../content/types';

const STORAGE_KEY = 'codex-workbook:progress';

export type AnswerRecord = {
  value: string;
  correct: boolean;
};

export type ProgressState = {
  completedPages: Record<string, boolean>;
  checkedItems: Record<string, boolean>;
  answers: Record<string, AnswerRecord>;
};

export const emptyProgress: ProgressState = {
  completedPages: {},
  checkedItems: {},
  answers: {},
};

export const loadProgress = (): ProgressState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyProgress, ...JSON.parse(raw) } : emptyProgress;
  } catch {
    return emptyProgress;
  }
};

export const saveProgress = (progress: ProgressState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

const normalize = (value: string) => value.trim().toLowerCase();

export const isAnswerCorrect = (question: Question, value: string) => {
  if (question.type === 'true-false') {
    return String(question.answer) === normalize(value);
  }

  return normalize(String(question.answer)) === normalize(value);
};

export const isCheckpointDone = (checkpoint: Checkpoint, progress: ProgressState) =>
  !checkpoint.required || progress.checkedItems[checkpoint.id] === true;

export const isQuestionDone = (question: Question, progress: ProgressState) =>
  !question.required || progress.answers[question.id]?.correct === true;

export const isPageComplete = (page: WorkbookPage, progress: ProgressState) =>
  page.checkpoints.every((checkpoint) => isCheckpointDone(checkpoint, progress)) &&
  page.questions.every((question) => isQuestionDone(question, progress));

export const recalculateCompletedPages = (pages: WorkbookPage[], progress: ProgressState): ProgressState => {
  const completedPages = pages.reduce<Record<string, boolean>>((acc, page) => {
    acc[page.id] = isPageComplete(page, progress);
    return acc;
  }, {});

  return { ...progress, completedPages };
};
