type IconProps = {
  className?: string;
};

export const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4.2 10.4 8.1 14l7.7-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M6 8V6.8a4 4 0 0 1 8 0V8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="4.8" y="8" width="10.4" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const PageIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5.5 3.5h6.8l2.2 2.3v10.7h-9z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M12.2 3.7v2.4h2.3M7.4 9h5.2M7.4 12h5.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
