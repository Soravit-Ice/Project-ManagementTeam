/* Simple button with variants to support glass UI */
const baseStyles =
  'inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60';

const variants = {
  primary:
    'bg-gradient-to-r from-sky-500/90 via-cyan-400/90 to-emerald-400/90 text-slate-900 hover:from-sky-400 hover:to-emerald-300',
  ghost:
    'bg-white/10 text-white border border-white/20 hover:bg-white/15',
  danger:
    'bg-rose-500/90 text-white hover:bg-rose-400/90',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  spinner,
  disabled = false,
  ...props
}) {
  const spinnerNode =
    spinner ?? (
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-100/80 border-r-transparent" />
    );

  return (
    <button
      className={`${baseStyles} ${variants[variant] ?? variants.primary} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          {spinnerNode}
          <span>กำลังดำเนินการ...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
