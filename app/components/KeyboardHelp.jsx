/* global React */
// KeyboardHelp.jsx — Keyboard shortcuts modal + lab-server settings

const { useState: useKH } = React;

function KeyboardHelp({ onClose }) {
  const shortcuts = (window.Keyboard && window.Keyboard.HELP_SHORTCUTS) || [];
  const [serverUrl, setServerUrl] = useKH(window.LabServerClient?.baseUrl || 'http://127.0.0.1:3030');
  const [serverHealth, setServerHealth] = useKH(null);

  async function pingServer(url) {
    try {
      const r = await fetch(url + '/health', { method: 'GET' });
      if (!r.ok) return { ok: false, error: 'HTTP ' + r.status };
      const body = await r.json();
      return { ok: true, sessions: body.sessions?.length || 0 };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  function saveServerUrl() {
    window.LabServerClient.setBaseUrl(serverUrl);
    pingServer(serverUrl).then(setServerHealth);
  }

  return (
    <div
      className="kbd-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 900,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        className="kbd-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '28px 32px',
          minWidth: 340,
          maxWidth: 480,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 24, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
          Keyboard shortcuts
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {shortcuts.map((sc, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: i < shortcuts.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: 'var(--fg2)' }}>{sc.label}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {(sc.keys || []).map((k, j) => (
                  <kbd key={j} style={{
                    background: 'var(--bg3)',
                    border: '1px solid var(--border2)',
                    borderRadius: 4,
                    padding: '2px 7px',
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--fg)',
                    lineHeight: 1.6,
                  }}>
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 20, margin: '28px 0 12px', letterSpacing: '-0.01em' }}>
          Lab-server
        </h2>
        <div style={{ fontSize: 12, color: 'var(--fg3)', marginBottom: 8 }}>
          Local Docker lab orchestrator for network labs. Default: http://127.0.0.1:3030
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://127.0.0.1:3030"
            style={{
              flex: 1,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '7px 10px',
              fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg)',
            }}
          />
          <button
            onClick={saveServerUrl}
            style={{
              background: 'var(--orange)', color: '#fff', border: 'none',
              borderRadius: 6, padding: '7px 14px',
              fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >Save & test</button>
        </div>
        {serverHealth && (
          <div style={{
            marginTop: 8, fontFamily: 'var(--mono)', fontSize: 11.5,
            color: serverHealth.ok ? 'var(--green)' : 'var(--err)',
          }}>
            {serverHealth.ok
              ? `✓ Reachable · ${serverHealth.sessions} active session${serverHealth.sessions === 1 ? '' : 's'}`
              : `✗ Unreachable: ${serverHealth.error}`}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 24,
            width: '100%',
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 7,
            padding: '10px',
            fontFamily: 'var(--sans)',
            fontSize: 13,
            color: 'var(--fg2)',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { KeyboardHelp });
