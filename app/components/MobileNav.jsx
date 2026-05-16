/* global React */
// MobileNav.jsx — Bottom tab nav for mobile (≤768px)

function MobileNav({ page, onNavigate }) {
  const { actions } = window.useStore();

  const tabs = [
    { lbl: 'Home',     ico: '⌂', p: 'home' },
    { lbl: 'Learn',    ico: '▤', p: 'lesson' },
    { lbl: 'Practice', ico: '◉', p: 'practice' },
    { lbl: 'Flags',    ico: '⚑', p: 'flags' },
    { lbl: 'Menu',     ico: '≡', p: 'menu' },
  ];

  function handleTab(t) {
    if (t.p === 'menu') {
      window.dispatchEvent(new CustomEvent('app-action', { detail: 'modal.close' }));
      window.dispatchEvent(new CustomEvent('toggle-drawer'));
    } else {
      actions.setPage(t.p);
      if (onNavigate) onNavigate(t.p);
    }
  }

  return (
    <div className="mobile-bottom-nav">
      {tabs.map(t => (
        <button
          key={t.p}
          className={'mob-tab' + (page === t.p ? ' active' : '')}
          onClick={() => handleTab(t)}
        >
          <span className="ico">{t.ico}</span>
          <span>{t.lbl}</span>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { MobileNav });
