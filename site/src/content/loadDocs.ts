import { Marked } from 'marked';
import { deflateSync, strToU8 } from 'fflate';
import { journeyDefinitions } from './journeyMap';
import type { Chapter, Journey, WorkbookPage } from './types';

const rawDocs = import.meta.glob('../../../docs/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const titleize = (value: string) =>
  value
    .replace(/\.md$/i, '')
    .replace(/^\d+-/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const plantUmlAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

const encodePlantUml6Bit = (value: number) => plantUmlAlphabet[value & 0x3f];

const appendPlantUml3Bytes = (byte1: number, byte2: number, byte3: number) => {
  const c1 = byte1 >> 2;
  const c2 = ((byte1 & 0x3) << 4) | (byte2 >> 4);
  const c3 = ((byte2 & 0xf) << 2) | (byte3 >> 6);
  const c4 = byte3 & 0x3f;

  return encodePlantUml6Bit(c1) + encodePlantUml6Bit(c2) + encodePlantUml6Bit(c3) + encodePlantUml6Bit(c4);
};

const encodePlantUml = (source: string) => {
  const compressed = deflateSync(strToU8(source), { level: 9 });
  let encoded = '';

  for (let index = 0; index < compressed.length; index += 3) {
    encoded += appendPlantUml3Bytes(compressed[index], compressed[index + 1] ?? 0, compressed[index + 2] ?? 0);
  }

  return encoded;
};

const renderPlantUml = (source: string) => {
  const encoded = encodePlantUml(source);
  const imageUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;

  return `
    <figure class="plantuml-diagram">
      <img alt="PlantUML diagram" loading="lazy" src="${imageUrl}" />
      <button class="plantuml-diagram__fullscreen" data-plantuml-fullscreen="${imageUrl}" type="button">Fullscreen</button>
    </figure>
  `;
};

const renderCodeBlock = (source: string, language?: string) => {
  const languageLabel = language ? language.toUpperCase() : 'TEXT';
  const languageClass = language ? ` class="language-${escapeHtml(language)}"` : '';

  return `
    <figure class="code-block">
      <figcaption>
        <span>${escapeHtml(languageLabel)}</span>
        <button class="code-block__copy" data-copy-code type="button">Copy</button>
      </figcaption>
      <pre><code${languageClass}>${escapeHtml(source)}</code></pre>
    </figure>
  `;
};

const getTemplateDownloadName = (href: string) => {
  const parts = href.split('/').filter(Boolean);
  const fileName = parts.at(-1) ?? 'template';
  const parentName = parts.at(-2);

  if (fileName === 'SKILL.md' && parentName) {
    return `${parentName}-SKILL.md`;
  }

  return fileName;
};

const marked = new Marked({
  gfm: true,
  breaks: false,
});

marked.use({
  renderer: {
    code(token) {
      if (token.lang === 'plantuml') {
        return renderPlantUml(token.text);
      }

      return renderCodeBlock(token.text, token.lang);
    },
    link(token) {
      const href = token.href ?? '';
      const isTemplate = href.startsWith('templates/');
      const downloadAttribute = isTemplate ? ` download="${escapeHtml(getTemplateDownloadName(href))}"` : '';
      const classAttribute = isTemplate ? ' class="template-link"' : '';
      const titleAttribute = token.title ? ` title="${escapeHtml(token.title)}"` : '';

      return `<a href="${escapeHtml(href)}"${titleAttribute}${classAttribute}${downloadAttribute}>${token.text}</a>`;
    },
  },
});

const stripFrontmatter = (markdown: string) => markdown.replace(/^---[\s\S]*?---\s*/, '').trim();

const renderWikilinksInText = (markdown: string) =>
  markdown.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target: string, label: string | undefined) => {
    const visibleLabel = label ?? titleize(target);
    return `<span class="wikilink">${escapeHtml(visibleLabel)}</span>`;
  });

const renderWikilinksOutsideInlineCode = (markdown: string) =>
  markdown
    .split(/(`[^`\n]+`)/g)
    .map((part) => (part.startsWith('`') ? part : renderWikilinksInText(part)))
    .join('');

const renderWikilinks = (markdown: string) => {
  const fencePattern = /(```[\s\S]*?```)/g;
  return markdown
    .split(fencePattern)
    .map((part) => (part.startsWith('```') ? part : renderWikilinksOutsideInlineCode(part)))
    .join('');
};

const sourceKey = (sourcePath: string) => `../../../docs/${sourcePath}`;

const renderMarkdown = (markdown: string) => marked.parse(renderWikilinks(stripFrontmatter(markdown)), { async: false }) as string;

export const createWorkbook = (): Journey[] => {
  let order = 0;

  return journeyDefinitions
    .map((journey): Journey => ({
      id: journey.id,
      title: journey.title,
      description: journey.description,
      track: journey.track,
      chapters: journey.chapters
        .map((chapter): Chapter => ({
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          pages: chapter.pages
            .map((page): WorkbookPage => {
              const rawMarkdown = rawDocs[sourceKey(page.sourcePath)];

              if (!rawMarkdown) {
                throw new Error(`Missing workbook doc: ${page.sourcePath}`);
              }

              order += 1;

              return {
                id: page.id,
                title: page.title,
                journeyId: journey.id,
                chapterId: chapter.id,
                order,
                track: page.track,
                sourcePath: page.sourcePath,
                markdown: renderMarkdown(rawMarkdown),
                checkpoints: page.checkpoints,
                questions: page.questions,
              };
            }),
        }))
        .filter((chapter) => chapter.pages.length > 0),
    }))
    .filter((journey) => journey.chapters.length > 0);
};

export const flattenPages = (journeys: Journey[]): WorkbookPage[] =>
  journeys.flatMap((journey) => journey.chapters.flatMap((chapter) => chapter.pages));

export const getFirstPagePath = (journeys: Journey[]) => {
  const firstPage = flattenPages(journeys)[0];
  return firstPage ? `/journeys/${firstPage.journeyId}/${firstPage.chapterId}/${firstPage.id}` : '/';
};
