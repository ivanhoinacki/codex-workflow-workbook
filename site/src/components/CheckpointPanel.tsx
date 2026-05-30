import type { WorkbookPage } from '../content/types';
import type { ProgressState } from '../state/progressStore';
import { isCheckpointDone } from '../state/progressStore';

type CheckpointPanelProps = {
  page: WorkbookPage;
  progress: ProgressState;
  onToggle: (checkpointId: string, checked: boolean) => void;
};

export const CheckpointPanel = ({ page, progress, onToggle }: CheckpointPanelProps) => (
  <section className="side-card" aria-labelledby="checkpoint-title">
    <div className="side-card__header">
      <span>Checkpoint</span>
      <strong id="checkpoint-title">Step validation</strong>
    </div>

    <div className="checklist">
      {page.checkpoints.map((checkpoint) => (
        <label className="check-row" key={checkpoint.id}>
          <input
            checked={isCheckpointDone(checkpoint, progress)}
            onChange={(event) => onToggle(checkpoint.id, event.target.checked)}
            type="checkbox"
          />
          <span>{checkpoint.label}</span>
        </label>
      ))}
    </div>
  </section>
);
