import { useEffect, useState, type ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

const brandLogoPath = `${import.meta.env.BASE_URL}brand/luxury-escapes-logo.svg`;

const themeStorageKey = 'codex-workbook:theme';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem(themeStorageKey);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const Layout = ({ children }: LayoutProps) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <img alt="Luxury Escapes" src={brandLogoPath} />
          <span className="topbar__divider" aria-hidden="true" />
          <div>
            <span className="topbar__label">Engineering playbook</span>
            <strong>Codex Workflow</strong>
          </div>
        </div>
        <div className="topbar__meta" aria-label="Playbook context">
          <span>Playbook</span>
          <button
            aria-label={`Ativar tema ${nextTheme === 'dark' ? 'escuro' : 'claro'}`}
            className="theme-toggle"
            onClick={() => setTheme(nextTheme)}
            type="button"
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
          </button>
        </div>
      </header>

      {children}
    </div>
  );
};
