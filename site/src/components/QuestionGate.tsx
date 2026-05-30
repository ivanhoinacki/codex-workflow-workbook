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
      <span>Pergunta</span>
      <strong id="question-title">Revisão de entendimento</strong>
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
              placeholder="Digite sua resposta"
              type="text"
            />
          )}

          {answer && (
            <div className={`feedback${answer.correct ? ' feedback--correct' : ' feedback--wrong'}`}>
              {answer.correct ? question.feedback ?? 'Resposta correta.' : 'Resposta incorreta. Revise o conteúdo desta página e tente novamente.'}
            </div>
          )}
        </div>
      );
    })}
  </section>
);
