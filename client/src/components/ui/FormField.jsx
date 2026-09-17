import { useId } from 'react';

export default function FormField({
  label,
  error,
  helperText,
  required,
  children,
  className = '',
}) {
  const id = useId();

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-1"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      {typeof children === 'function'
        ? children({ id, 'aria-invalid': error || undefined, 'aria-describedby': error ? `${id}-error` : undefined })
        : children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{helperText}</p>
      )}
    </div>
  );
}
