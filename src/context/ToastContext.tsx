import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import styles from "./ToastContext.module.scss";

interface ToastAction {
  label: string;
  run: () => void;
}

interface ToastNotice {
  id: number;
  message: string;
  action?: ToastAction;
}

const ToastContext = createContext<((message: string, action?: ToastAction) => void) | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const sequence = useRef(0);
  const notify = useCallback((message: string, action?: ToastAction) => {
    setNotice({ id: ++sequence.current, message, action });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {notice && (
        <div className={styles.viewport}>
          <div key={notice.id} className={styles.notice} role="status" aria-live="polite">
            <Check size={19} aria-hidden="true" />
            <span>{notice.message}</span>
            {notice.action && <button type="button" className={styles.action} onClick={() => {
              notice.action?.run();
              setNotice(null);
            }}>{notice.action.label}</button>}
            <button type="button" className={styles.close} aria-label="Dismiss notification" onClick={() => setNotice(null)}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast must be used inside ToastProvider.");
  return notify;
}
