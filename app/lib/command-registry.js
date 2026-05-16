window.CommandRegistry = {
  getCommands(dueCount) {
    return [
      { id: "nav.home",      title: "Go to Home",              ctx: "/",     kind: "nav",    action: "page.home" },
      { id: "nav.practice",  title: "Open Practice",           ctx: dueCount > 0 ? dueCount + " due" : "p", kind: "nav", action: "page.practice", badge: dueCount || null },
      { id: "nav.progress",  title: "Open Progress",           ctx: "g",     kind: "nav",    action: "page.progress" },
      { id: "nav.flags",     title: "Open Flag Tracker",       ctx: "/flags",kind: "nav",    action: "page.flags" },
      { id: "lab.toggle",    title: "Toggle Lab pane",         ctx: "⌘\\",   kind: "action", action: "lab.toggle" },
      { id: "theme.toggle",  title: "Toggle dark / light theme",ctx: "t",   kind: "action", action: "theme.toggle" },
      { id: "lesson.mark",   title: "Mark current lesson complete", ctx: "m", kind: "action", action: "lesson.toggle-complete" },
      { id: "help.show",     title: "Keyboard shortcuts",      ctx: "?",     kind: "action", action: "help.toggle" },
      { id: "data.reset",    title: "Reset all progress",      ctx: "",      kind: "danger", action: "store.reset" },
    ];
  }
};
