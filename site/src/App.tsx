import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ChapterNav } from './components/ChapterNav';
import { JourneySidebar } from './components/JourneySidebar';
import { Layout } from './components/Layout';
import { PageReader } from './components/PageReader';
import { ProgressBar } from './components/ProgressBar';
import { QuestionGate } from './components/QuestionGate';
import { TemplateConfigPanel } from './components/TemplateConfigPanel';
import { createWorkbook, flattenPages, getFirstPagePath } from './content/loadDocs';
import type { WorkbookPage } from './content/types';
import {
  isAnswerCorrect,
  isPageComplete,
  loadProgress,
  recalculateCompletedPages,
  saveProgress,
  type ProgressState,
} from './state/progressStore';
import {
  applyTemplateConfig,
  loadTemplateConfig,
  saveTemplateConfig,
  type TemplateConfig,
} from './state/templateConfigStore';

const parseHashPath = () => window.location.hash.replace(/^#/, '') || '/';

const writeHashPath = (path: string) => {
  window.location.hash = path;
};

const findPageByPath = (pages: WorkbookPage[], path: string) => {
  const [, journeyId, chapterId, pageId] = path.match(/^\/journeys\/([^/]+)\/([^/]+)\/([^/]+)/) ?? [];
  return pages.find((page) => page.journeyId === journeyId && page.chapterId === chapterId && page.id === pageId);
};

const pagePath = (page: WorkbookPage) => `/journeys/${page.journeyId}/${page.chapterId}/${page.id}`;

export const App = () => {
  const journeys = useMemo(() => createWorkbook(), []);
  const pages = useMemo(() => flattenPages(journeys), [journeys]);
  const [hashPath, setHashPath] = useState(() => parseHashPath());
  const [progress, setProgress] = useState<ProgressState>(() => recalculateCompletedPages(pages, loadProgress()));
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(() => loadTemplateConfig());

  useEffect(() => {
    const onHashChange = () => setHashPath(parseHashPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    setProgress((current) => {
      const next = recalculateCompletedPages(pages, current);
      saveProgress(next);
      return next;
    });
  }, [pages]);

  const isPageAccessible = (page: WorkbookPage) => {
    const index = pages.findIndex((candidate) => candidate.id === page.id);
    return index <= 0 || pages.slice(0, index).every((candidate) => progress.completedPages[candidate.id]);
  };

  const firstOpenPage = useMemo(
    () => pages.find((page) => !progress.completedPages[page.id]) ?? pages[0],
    [pages, progress.completedPages],
  );

  const currentPage = useMemo(() => {
    const requestedPage = findPageByPath(pages, hashPath);

    if (!requestedPage) {
      return firstOpenPage;
    }

    return isPageAccessible(requestedPage) ? requestedPage : firstOpenPage;
  }, [firstOpenPage, hashPath, pages, progress.completedPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [currentPage?.id]);

  useEffect(() => {
    if (!currentPage && pages[0]) {
      writeHashPath(getFirstPagePath(journeys));
      return;
    }

    if (currentPage && hashPath !== pagePath(currentPage)) {
      writeHashPath(pagePath(currentPage));
    }
  }, [currentPage, hashPath, journeys, pages]);

  const activeIndex = currentPage ? pages.findIndex((page) => page.id === currentPage.id) : 0;
  const previousPage = activeIndex > 0 ? pages[activeIndex - 1] : undefined;
  const nextPage = activeIndex >= 0 && activeIndex < pages.length - 1 ? pages[activeIndex + 1] : undefined;

  const canOpenPage = (page: WorkbookPage) => {
    return page.id === currentPage?.id || isPageAccessible(page);
  };

  const updateProgress = (updater: (current: ProgressState) => ProgressState) => {
    setProgress((current) => {
      const next = recalculateCompletedPages(pages, updater(current));
      saveProgress(next);
      return next;
    });
  };

  const handleNavigate = (page: WorkbookPage) => {
    if (canOpenPage(page)) {
      writeHashPath(pagePath(page));
    }
  };

  const handleTemplateConfigChange = (config: TemplateConfig) => {
    setTemplateConfig(config);
    saveTemplateConfig(config);
  };

  const handleTemplateDownload = async (event: MouseEvent<HTMLElement>) => {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a.template-link');
    if (!anchor) {
      return;
    }

    event.preventDefault();

    const href = anchor.getAttribute('href');
    if (!href) {
      return;
    }

    const downloadName = anchor.getAttribute('download') || href.split('/').pop() || 'template';
    const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    const templateUrl = new URL(href.replace(/^\//, ''), window.location.origin + baseUrl);

    try {
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error(`Template fetch failed: ${response.status}`);
      }

      const source = await response.text();
      const content = applyTemplateConfig(source, templateConfig);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = objectUrl;
      downloadAnchor.download = downloadName;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.location.href = templateUrl.toString();
    }
  };

  if (!currentPage) {
    return (
      <Layout>
        <main className="empty-state">No workbook content found.</main>
      </Layout>
    );
  }

  const completed = pages.filter((page) => progress.completedPages[page.id]).length;
  const currentComplete = isPageComplete(currentPage, progress);

  return (
    <Layout>
      <div className="workspace">
        <JourneySidebar
          activePageId={currentPage.id}
          canOpenPage={canOpenPage}
          journeys={journeys}
          onNavigate={handleNavigate}
          progress={progress}
        />

        <main className="content-area" onClick={handleTemplateDownload}>
          <ProgressBar completed={completed} total={pages.length} />

          <div className="content-grid">
            <div className="content-main">
              {currentPage.id === 'template-variables' && (
                <TemplateConfigPanel config={templateConfig} onChange={handleTemplateConfigChange} />
              )}
              <PageReader page={currentPage} />
              <ChapterNav
                canAdvance={currentComplete}
                currentPage={currentPage}
                nextPage={nextPage}
                onNavigate={handleNavigate}
                previousPage={previousPage}
              />
            </div>

            <aside className="task-panel" aria-label="Page tasks">
              <QuestionGate
                page={currentPage}
                progress={progress}
                onAnswer={(questionId, value) => {
                  const question = currentPage.questions.find((candidate) => candidate.id === questionId);
                  if (!question) {
                    return;
                  }

                  updateProgress((current) => ({
                    ...current,
                    answers: {
                      ...current.answers,
                      [questionId]: {
                        value,
                        correct: isAnswerCorrect(question, value),
                      },
                    },
                  }));
                }}
              />

              <div className={`completion-card${currentComplete ? ' completion-card--done' : ''}`}>
                <span>{currentComplete ? 'Ready' : 'Locked'}</span>
                {currentComplete && (
                  <strong>{nextPage ? 'The next page is available' : 'Workbook complete'}</strong>
                )}
                {nextPage && (
                  <button
                    className="completion-card__next"
                    disabled={!currentComplete}
                    onClick={() => handleNavigate(nextPage)}
                    type="button"
                  >
                    Next
                  </button>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </Layout>
  );
};
