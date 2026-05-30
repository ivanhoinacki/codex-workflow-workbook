import type { WorkbookPage } from '../content/types';

type ChapterNavProps = {
  currentPage: WorkbookPage;
  previousPage?: WorkbookPage;
  nextPage?: WorkbookPage;
  canAdvance: boolean;
  onNavigate: (page: WorkbookPage) => void;
};

export const ChapterNav = ({ currentPage, previousPage, nextPage, canAdvance, onNavigate }: ChapterNavProps) => (
  <div className="chapter-nav">
    <button disabled={!previousPage} onClick={() => previousPage && onNavigate(previousPage)} type="button">
      Anterior
    </button>

    <div className="chapter-nav__meta">
      <span>Página {currentPage.order}</span>
      <strong>{currentPage.title}</strong>
    </div>

    <button disabled={!nextPage || !canAdvance} onClick={() => nextPage && onNavigate(nextPage)} type="button">
      Próxima
    </button>
  </div>
);
