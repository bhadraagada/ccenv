import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastState {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now(), message, type })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timeout)
  }, [toast])

  const colorClasses =
    toast?.type === 'success'
      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-50'
      : toast?.type === 'error'
        ? 'bg-red-950/80 border-red-500/60 text-red-50'
        : 'bg-slate-900/80 border-slate-500/60 text-slate-50'

  const dotClasses =
    toast?.type === 'success'
      ? 'bg-emerald-400'
      : toast?.type === 'error'
        ? 'bg-red-400'
        : 'bg-slate-400'

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4">
        {toast && (
          <div
            className={`pointer-events-auto flex items-center gap-2 rounded-md border px-3 py-2 text-xs shadow-lg ${colorClasses}`}
          >
            <span className={`h-2 w-2 rounded-full ${dotClasses}`} />
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
