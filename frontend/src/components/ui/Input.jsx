export default function Input({
  label,
  error,
  helper,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <label className="flex flex-col gap-2 text-slate-100 text-sm">
      {label && <span className="font-medium text-slate-200">{label}</span>}
      <input
        type={type}
        className={`w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-sky-400/60 focus:bg-white/10 transition ${className}`}
        {...props}
      />
      {helper && !error && <span className="text-xs text-slate-300">{helper}</span>}
      {error && <span className="text-xs text-rose-300">{error}</span>}
    </label>
  );
}
