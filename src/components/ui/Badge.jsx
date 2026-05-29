const VARIANTS = {
  default: 'bg-accent text-primary',
  success: 'bg-primary-light/15 text-primary',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-gray-100 text-text-sub',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        VARIANTS[variant] || VARIANTS.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
