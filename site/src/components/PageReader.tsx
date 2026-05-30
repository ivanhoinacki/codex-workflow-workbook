import { useEffect, useState } from 'react';
import type { WorkbookPage } from '../content/types';

type PageReaderProps = {
  page: WorkbookPage;
};

export const PageReader = ({ page }: PageReaderProps) => {
  const [fullscreenDiagram, setFullscreenDiagram] = useState<string | null>(null);

  useEffect(() => {
    setFullscreenDiagram(null);
  }, [page.id]);

  useEffect(() => {
    if (!fullscreenDiagram) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreenDiagram(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreenDiagram]);

  return (
    <article className="reader">
      <header className="reader__header">
        <div>
          <span className="reader__source">{page.sourcePath}</span>
          <h1>{page.title}</h1>
        </div>
        <div className="reader__tracks">
          {page.track.map((track) => (
            <span key={track}>{track}</span>
          ))}
        </div>
      </header>

      <section className="learning-guide" aria-label="How to study this step">
        <div>
          <span>How to study</span>
          <strong>Read the concept first, then validate your understanding.</strong>
        </div>
        <ol>
          <li>Start with the "In one sentence" section to understand the core idea of the step.</li>
          <li>Then read the summary to connect the idea to the full workflow.</li>
          <li>Use the diagram to see who talks to whom.</li>
          <li>Read the examples and commands without copying anything before you understand their role.</li>
          <li>Check the checkpoint only when you can explain it in your own words.</li>
        </ol>
      </section>

      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: page.markdown }}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          const button = target.closest<HTMLButtonElement>('[data-plantuml-fullscreen]');
          const copyButton = target.closest<HTMLButtonElement>('[data-copy-code]');

          if (button?.dataset.plantumlFullscreen) {
            setFullscreenDiagram(button.dataset.plantumlFullscreen);
            return;
          }

          if (copyButton) {
            const code = copyButton.closest('.code-block')?.querySelector('code')?.textContent ?? '';
            const originalLabel = copyButton.textContent ?? 'Copy';
            const writePromise = navigator.clipboard?.writeText(code);

            if (!writePromise) {
              copyButton.textContent = 'Unavailable';
              window.setTimeout(() => {
                copyButton.textContent = originalLabel;
              }, 1800);
              return;
            }

            writePromise
              .then(() => {
                copyButton.textContent = 'Copied';
                window.setTimeout(() => {
                  copyButton.textContent = originalLabel;
                }, 1400);
              })
              .catch(() => {
                copyButton.textContent = 'Failed';
                window.setTimeout(() => {
                  copyButton.textContent = originalLabel;
                }, 1800);
              });
          }
        }}
      />

      {fullscreenDiagram && (
        <div className="diagram-modal" role="dialog" aria-label="PlantUML diagram in fullscreen" aria-modal="true">
          <button className="diagram-modal__backdrop" onClick={() => setFullscreenDiagram(null)} type="button" aria-label="Close diagram" />
          <div className="diagram-modal__content">
            <button className="diagram-modal__close" onClick={() => setFullscreenDiagram(null)} type="button">
              Close
            </button>
            <img alt="PlantUML diagram in fullscreen" src={fullscreenDiagram} />
          </div>
        </div>
      )}
    </article>
  );
};
