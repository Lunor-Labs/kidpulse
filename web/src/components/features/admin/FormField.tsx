interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, hint, error, required, children }: FormFieldProps) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1 flex items-center gap-1 text-[0.82rem] font-semibold text-brand-ink">
        {label}
        {required && <span className="text-brand-berry">*</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-[0.72rem] text-brand-ink-soft">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-[0.72rem] text-brand-berry">{error}</span>
      )}
    </label>
  );
}

export const inputClass =
  'w-full rounded-[10px] border border-brand-line bg-white px-3 py-2 text-[0.9rem] text-brand-ink outline-none transition focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20';
