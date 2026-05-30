type ProgressBarProps = {
  completed: number;
  total: number;
};

export const ProgressBar = ({ completed, total }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress" aria-label={`Progresso ${percentage}%`}>
      <div className="progress__meta">
        <span>{percentage}% completo</span>
        <span>
          {completed}/{total} páginas
        </span>
      </div>
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};
