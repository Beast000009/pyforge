import { useState, useEffect, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { ContentArea } from "@/components/ContentArea";
import { courseData, findSubsectionById, getAllSubsections } from "@/data/courseData";

const queryClient = new QueryClient();

const STORAGE_KEY = "offsec-python-completed";
const ACTIVE_KEY = "offsec-python-active";

function isTyping(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
}

function CoursePage() {
  const defaultId = courseData[0].sections[0].subsections[0].id;

  const [activeId, setActiveId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_KEY) || defaultId;
  });

  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  }, [completed]);

  function markComplete(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleNavigate(id: string) {
    setActiveId(id);
    window.scrollTo(0, 0);
  }

  const navigateBy = useCallback(
    (direction: 1 | -1) => {
      const all = getAllSubsections();
      const idx = all.findIndex((x) => x.subsection.id === activeId);
      const target = all[idx + direction];
      if (target) handleNavigate(target.subsection.id);
    },
    [activeId]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("focus-search"));
        return;
      }
      if (isTyping(e)) return;
      if (e.key === "j" || e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        navigateBy(1);
      } else if (e.key === "k" || e.key === "ArrowLeft" || e.key === "h") {
        e.preventDefault();
        navigateBy(-1);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        markComplete(activeId);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId, navigateBy]);

  const found = findSubsectionById(activeId);
  if (!found) return null;
  const { module, section, subsection } = found;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(var(--background))" }}>
      <Sidebar
        activeId={activeId}
        onSelect={handleNavigate}
        completed={completed}
      />
      <ContentArea
        module={module}
        section={section}
        subsection={subsection}
        completed={completed}
        onMarkComplete={markComplete}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={CoursePage} />
      <Route path="*" component={CoursePage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
