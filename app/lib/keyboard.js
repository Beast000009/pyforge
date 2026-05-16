const SHORTCUTS = [
  { combo: "meta+k",          action: "palette.toggle",         label: "Command palette",      keys: ["⌘K"] },
  { combo: "ctrl+k",          action: "palette.toggle",         label: null },
  { combo: "meta+\\",         action: "lab.toggle",             label: "Toggle Lab pane",      keys: ["⌘\\"] },
  { combo: "ctrl+\\",         action: "lab.toggle",             label: null },
  { combo: "meta+shift+enter",action: "lab.run",                label: "Run lab code",         keys: ["⌘⇧↵"] },
  { combo: "ctrl+shift+enter",action: "lab.run",                label: null },
  { combo: "j",               action: "lesson.next",            label: "Next lesson",          keys: ["j","→"] },
  { combo: "arrowright",      action: "lesson.next",            label: null },
  { combo: "k",               action: "lesson.prev",            label: "Previous lesson",      keys: ["k","←"] },
  { combo: "arrowleft",       action: "lesson.prev",            label: null },
  { combo: "m",               action: "lesson.toggle-complete", label: "Toggle complete",       keys: ["m"] },
  { combo: "p",               action: "page.practice",          label: "Open Practice",        keys: ["p"] },
  { combo: "g",               action: "page.progress",          label: "Open Progress",        keys: ["g"] },
  { combo: "t",               action: "theme.toggle",           label: "Toggle dark/light",    keys: ["t"] },
  { combo: "?",               action: "help.toggle",            label: "Keyboard shortcuts",   keys: ["?"] },
  { combo: "escape",          action: "modal.close",            label: "Close",                keys: ["Esc"] },
];

// Only shortcuts WITH keys[] are shown in the help modal
const HELP_SHORTCUTS = SHORTCUTS.filter(s => s.keys);

function comboMatches(e, combo) {
  const parts = combo.split("+");
  const key = parts[parts.length - 1];
  const needsMeta  = parts.includes("meta");
  const needsCtrl  = parts.includes("ctrl");
  const needsShift = parts.includes("shift");
  return (
    e.key.toLowerCase() === key &&
    (needsMeta  ? e.metaKey  : !e.metaKey) &&
    (needsCtrl  ? e.ctrlKey  : !e.ctrlKey) &&
    (needsShift ? e.shiftKey : !e.shiftKey)
  );
}

function isTyping(e) {
  return ["INPUT","TEXTAREA"].includes(e.target?.tagName) || e.target?.isContentEditable;
}

function initKeyboard() {
  window.addEventListener("keydown", function(e) {
    for (const s of SHORTCUTS) {
      if (!comboMatches(e, s.combo)) continue;
      const needsMod = s.combo.includes("meta") || s.combo.includes("ctrl");
      if (!needsMod && isTyping(e)) continue;
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("app-action", { detail: s.action }));
      break;
    }
  });
}

window.Keyboard = { HELP_SHORTCUTS, init: initKeyboard };
