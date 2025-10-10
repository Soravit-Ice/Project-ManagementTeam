import Card from '../ui/Card.jsx';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full space-y-8 text-center text-slate-100">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold text-glow">{title}</h1>
          {subtitle && <p className="text-base text-slate-200/80">{subtitle}</p>}
        </div>
        <Card className="p-10 text-left space-y-6">
          {children}
        </Card>
      </div>
    </div>
  );
}
