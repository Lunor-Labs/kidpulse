import Link from 'next/link';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[440px] flex-col justify-center px-6 py-10">
      <Link
        href="/"
        className="mb-4 text-center text-[0.85rem] font-semibold text-brand-ink-soft hover:text-brand-indigo"
      >
        ← Back to KidPulse
      </Link>
      <div className="rounded-[20px] border border-brand-line bg-white p-8 shadow-[0_20px_44px_rgba(27,11,128,0.08)]">
        <h1 className="mb-1 font-chewy text-[1.75rem] text-brand-indigo">{title}</h1>
        {subtitle && (
          <p className="mb-6 text-[0.9rem] text-brand-ink-soft">{subtitle}</p>
        )}
        {children}
      </div>
      {footer && (
        <div className="mt-6 text-center text-[0.88rem] text-brand-ink-soft">{footer}</div>
      )}
    </div>
  );
}
