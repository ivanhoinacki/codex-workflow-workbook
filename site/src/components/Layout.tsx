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

  return 'light';
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
            aria-label={`Switch to ${nextTheme} theme`}
            className="theme-toggle"
            onClick={() => setTheme(nextTheme)}
            type="button"
          >
            {theme === 'dark' ? (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M20 15.5A8.6 8.6 0 0 1 8.5 4a8.7 8.7 0 1 0 11.5 11.5Z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {children}
    </div>
  );
};
