import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200 ${error ? 'ring-2' : ''
          } ${className}`}
        style={{
          background: 'var(--bg-card)',
          borderColor: error ? 'var(--accent-red)' : 'var(--border-subtle)',
          color: 'var(--text-primary)',
          ...(error ? { '--tw-ring-color': 'var(--accent-red)' } : { '--tw-ring-color': 'var(--accent-green)' }),
        } as React.CSSProperties}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--accent-red)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
