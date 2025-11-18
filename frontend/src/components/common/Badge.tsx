import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    default: 'bg-bg-tertiary text-text-primary',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    info: 'bg-blue-100 text-blue-600',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <span className={classes}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'default' ? 'bg-text-secondary' :
            variant === 'primary' ? 'bg-primary' :
            variant === 'success' ? 'bg-success' :
            variant === 'warning' ? 'bg-warning' :
            variant === 'error' ? 'bg-error' :
            'bg-blue-500'
          }`}
        />
      )}
      {children}
    </span>
  );
};

// Utility function for conversation status badges
export const getStatusBadge = (status: 'active' | 'escalated' | 'resolved') => {
  const config = {
    active: { variant: 'success' as const, label: 'Active', dot: true },
    escalated: { variant: 'warning' as const, label: 'Escalated', dot: true },
    resolved: { variant: 'default' as const, label: 'Resolved', dot: false },
  };

  const { variant, label, dot } = config[status];
  return <Badge variant={variant} dot={dot}>{label}</Badge>;
};

// Utility function for AI confidence badges
export const getConfidenceBadge = (confidence: number) => {
  if (confidence >= 0.85) {
    return <Badge variant="success" dot>High Confidence</Badge>;
  } else if (confidence >= 0.5) {
    return <Badge variant="warning" dot>Medium Confidence</Badge>;
  } else {
    return <Badge variant="error" dot>Low Confidence</Badge>;
  }
};
