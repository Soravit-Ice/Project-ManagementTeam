import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext({
  notify: () => {},
});

let idCounter = 0;

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(({ title, description, variant = 'default', duration = 3500 }) => {
    idCounter += 1;
    const toast = {
      id: idCounter,
      title,
      description,
      variant,
      duration,
    };
    setItems((prev) => [...prev, toast]);
    window.setTimeout(() => remove(toast.id), duration);
  }, [remove]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 top-6 z-[1000] flex flex-col items-center gap-3 px-4">
        {items.map((toast) => (
          <article
            key={toast.id}
            className={`w-full max-w-sm glass-card px-5 py-4 text-sm text-white shadow-2xl transition toast-enter ${toast.variant === 'error' ? 'border-rose-400/60 bg-rose-500/70' : ''}`}
          >
            <div className="font-semibold text-base">
              {toast.title}
            </div>
            {toast.description && (
              <p className="text-sm text-slate-100/80 mt-1 leading-relaxed">{toast.description}</p>
            )}
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
