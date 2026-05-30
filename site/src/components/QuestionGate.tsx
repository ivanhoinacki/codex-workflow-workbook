import type { WorkbookPage } from '../content/types';
import type { ProgressState } from '../state/progressStore';

type QuestionGateProps = {
  page: WorkbookPage;
  progress: ProgressState;
  onAnswer: (questionId: string, value: string) => void;
};

export const QuestionGate = ({ page, progress, onAnswer }: QuestionGateProps) => (
  <section className="side-card" aria-labelledby="question-title">
    <div className="side-card__header">
      <span>Question</span>
      <strong id="question-title">Understanding review</strong>
    </div>

    {page.questions.map((question) => {
      const answer = progress.answers[question.id];

      return (
        <div className="question" key={question.id}>
          <p>{question.prompt}</p>

          {question.options ? (
            <div className="answer-list">
              {question.options.map((option) => (
                <button
                  className={`answer${answer?.value === option ? ' answer--selected' : ''}${answer?.value === option && answer.correct ? ' answer--correct' : ''}`}
                  key={option}
                  onClick={() => onAnswer(question.id, option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <input
              className="short-answer"
              defaultValue={answer?.value ?? ''}
              onBlur={(event) => onAnswer(question.id, event.target.value)}
              placeholder="Type your answer"
              type="text"
            />
          )}

          {answer && (
            <div className={`feedback${answer.correct ? ' feedback--correct' : ' feedback--wrong'}`}>
              {answer.correct ? question.feedback ?? 'Correct answer.' : 'Incorrect answer. Review this page and try again.'}
            </div>
          )}
        </div>
      );
    })}
  </section>
);
