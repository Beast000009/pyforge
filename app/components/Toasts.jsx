/* global React */
// Toasts.jsx — Fixed-position toast notification stack

const { useState: useToast, useEffect: useToastE } = React;

let _toastId = 0;

function Toasts() {
  const [toasts, setToasts] = useToast([]);

  useToastE(() => {
    function onToast(e) {
      const { msg, kind = 'ok' } = e.detail || {};
      const id = ++_toastId;
      setToasts(prev => [...prev, { id, msg, kind }]);
      const duration = kind === 'ok' ? 3000 : 4500;
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    window.addEventListener('toast', onToast);
    return () => window.removeEventListener('toast', onToast);
  }, []);

  function styleForKind(kind) {
    if (kind === 'ok') return {
      background: 'rgba(74,222,128,0.12)',
      border: '1px solid rgba(74,222,128,0.3)',
      color: 'var(--green)',
    };
    if (kind === 'warn') return {
      background: 'rgba(251,191,36,0.12)',
      border: '1px solid rgba(251,191,36,0.3)',
      color: 'var(--amber)',
    };
    if (kind === 'info') return {
      background: 'rgba(96,165,250,0.12)',
      border: '1px solid rgba(96,165,250,0.3)',
      color: '#60a5fa',
    };
    // err
    return {
      background: 'rgba(248,113,113,0.12)',
      border: '1px solid rgba(248,113,113,0.3)',
      color: '#f87171',
    };
  }

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: 24,
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '10px 16px',
          borderRadius: 8,
          fontSize: 12,
          fontFamily: 'var(--mono)',
          maxWidth: 380,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          pointerEvents: 'auto',
          ...styleForKind(t.kind),
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Toasts });
