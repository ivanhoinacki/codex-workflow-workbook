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

      <section className="learning-guide" aria-label="Como estudar esta etapa">
        <div>
          <span>Como estudar</span>
          <strong>Leia primeiro o conceito, depois valide o entendimento.</strong>
        </div>
        <ol>
          <li>Comece pela seção "Em uma frase" para entender a ideia central da etapa.</li>
          <li>Depois leia o resumo para conectar a ideia ao workflow completo.</li>
          <li>Use o diagrama para enxergar quem conversa com quem.</li>
          <li>Leia os exemplos e comandos sem copiar nada antes de entender o papel deles.</li>
          <li>Marque o checkpoint apenas quando conseguir explicar com suas palavras.</li>
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
              copyButton.textContent = 'Indisponível';
              window.setTimeout(() => {
                copyButton.textContent = originalLabel;
              }, 1800);
              return;
            }

            writePromise
              .then(() => {
                copyButton.textContent = 'Copiado';
                window.setTimeout(() => {
                  copyButton.textContent = originalLabel;
                }, 1400);
              })
              .catch(() => {
                copyButton.textContent = 'Falhou';
                window.setTimeout(() => {
                  copyButton.textContent = originalLabel;
                }, 1800);
              });
          }
        }}
      />

      {fullscreenDiagram && (
        <div className="diagram-modal" role="dialog" aria-label="Diagrama PlantUML em tela cheia" aria-modal="true">
          <button className="diagram-modal__backdrop" onClick={() => setFullscreenDiagram(null)} type="button" aria-label="Fechar diagrama" />
          <div className="diagram-modal__content">
            <button className="diagram-modal__close" onClick={() => setFullscreenDiagram(null)} type="button">
              Fechar
            </button>
            <img alt="Diagrama PlantUML em tela cheia" src={fullscreenDiagram} />
          </div>
        </div>
      )}
    </article>
  );
};
