import type { Journey, WorkbookPage } from '../content/types';
import type { ProgressState } from '../state/progressStore';
import { CheckIcon, LockIcon, PageIcon } from './Icons';

type JourneySidebarProps = {
  journeys: Journey[];
  activePageId: string;
  progress: ProgressState;
  canOpenPage: (page: WorkbookPage) => boolean;
  onNavigate: (page: WorkbookPage) => void;
};

export const JourneySidebar = ({ journeys, activePageId, progress, canOpenPage, onNavigate }: JourneySidebarProps) => (
  <aside className="sidebar" aria-label="Workbook journeys">
    <nav className="journeys">
      {journeys.map((journey) => {
        const pages = journey.chapters.flatMap((chapter) => chapter.pages);
        const done = pages.filter((page) => progress.completedPages[page.id]).length;
        const percentage = pages.length > 0 ? Math.round((done / pages.length) * 100) : 0;

        return (
          <section className="journey-group" key={journey.id}>
            <div className="journey-group__header">
              <div>
                <h2>{journey.title}</h2>
                <p>{journey.description}</p>
              </div>
              <span>{percentage}%</span>
            </div>

            {journey.chapters.map((chapter) => (
              <div className="chapter-list" key={chapter.id}>
                <h3>{chapter.title}</h3>
                {chapter.pages.map((page) => {
                  const locked = !canOpenPage(page);
                  const completed = progress.completedPages[page.id] === true;
                  const active = page.id === activePageId;

                  return (
                    <button
                      className={`page-link${active ? ' page-link--active' : ''}${completed ? ' page-link--complete' : ''}`}
                      disabled={locked}
                      key={page.id}
                      onClick={() => onNavigate(page)}
                      type="button"
                    >
                      {completed ? <CheckIcon className="page-link__icon" /> : locked ? <LockIcon className="page-link__icon" /> : <PageIcon className="page-link__icon" />}
                      <span>{page.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </section>
        );
      })}
    </nav>
  </aside>
);
