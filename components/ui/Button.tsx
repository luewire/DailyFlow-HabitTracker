import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]';

  const variantStyles = {
    primary: 'text-white hover:brightness-110 focus:ring-green-500',
    secondary: 'hover:brightness-110 focus:ring-green-500/30',
    danger: 'text-white hover:brightness-110 focus:ring-red-500',
    ghost: 'hover:brightness-110 focus:ring-green-500/20',
  };

  const variantInline: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent-green)', color: 'var(--bg-primary)' },
    secondary: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' },
    danger: { background: 'var(--accent-red)', color: 'white' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)' },
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{
        ...variantInline[variant],
        focusRingOffset: 'var(--bg-primary)',
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </button>
  );
}
