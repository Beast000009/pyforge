import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, CheckCircle2, Circle, Search, X } from "lucide-react";
import { courseData } from "@/data/courseData";
import type { Module, Section, Subsection } from "@/data/courseData";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  completed: Set<string>;
}

interface SearchResult {
  sub: Subsection;
  sec: Section;
  mod: Module;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "rgba(232,75,34,0.35)",
          color: "hsl(var(--primary))",
          borderRadius: "2px",
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function Sidebar({ activeId, onSelect, completed }: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(courseData.map((m) => m.id))
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(
      courseData.flatMap((m) =>
        m.sections.filter((_, i) => i === 0).map((s) => s.id)
      )
    )
  );
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onFocusSearch() {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    window.addEventListener("focus-search", onFocusSearch);
    return () => window.removeEventListener("focus-search", onFocusSearch);
  }, []);

  const trimmedQuery = query.trim();

  const searchResults: SearchResult[] = trimmedQuery
    ? courseData.flatMap((mod) =>
        mod.sections.flatMap((sec) =>
          sec.subsections
            .filter(
              (sub) =>
                sub.title.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
                sec.title.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
                mod.title.toLowerCase().includes(trimmedQuery.toLowerCase())
            )
            .map((sub) => ({ sub, sec, mod }))
        )
      )
    : [];

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSelect(id: string) {
    onSelect(id);
    setQuery("");
    for (const mod of courseData) {
      for (const sec of mod.sections) {
        for (const sub of sec.subsections) {
          if (sub.id === id) {
            setExpandedModules((prev) => new Set([...prev, mod.id]));
            setExpandedSections((prev) => new Set([...prev, sec.id]));
          }
        }
      }
    }
  }

  function clearSearch() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <aside
      data-testid="sidebar"
      className="w-72 min-w-[288px] max-w-[288px] flex flex-col h-screen overflow-hidden border-r"
      style={{ background: "hsl(var(--sidebar))", borderColor: "hsl(var(--sidebar-border))" }}
    >
      {/* Logo / Header */}
      <div
        className="px-4 py-4 border-b shrink-0"
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded"
            style={{ background: "hsl(var(--primary))", color: "#fff" }}
          >
            OffSec
          </span>
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: "hsl(var(--sidebar-foreground))" }}
          >
            Get Good at Python
          </span>
        </div>
      </div>

      {/* Search */}
      <div
        className="px-3 py-2.5 border-b shrink-0"
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        <div
          className="flex items-center gap-2 rounded px-2.5 py-1.5"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--sidebar-border))" }}
        >
          <Search size={12} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search lessons…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[11px] outline-none placeholder:opacity-40"
            style={{ color: "hsl(var(--sidebar-foreground))" }}
            onKeyDown={(e) => {
              if (e.key === "Escape") clearSearch();
              if (e.key === "Enter" && searchResults.length > 0) {
                handleSelect(searchResults[0].sub.id);
              }
            }}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={11} style={{ color: "hsl(var(--muted-foreground))" }} />
            </button>
          )}
        </div>
      </div>

      {/* Nav tree or search results */}
      <nav className="flex-1 overflow-y-auto py-2 text-sm">
        {trimmedQuery ? (
          searchResults.length > 0 ? (
            <div>
              <p
                className="px-4 pb-1.5 text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </p>
              {searchResults.map(({ sub, sec, mod }) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelect(sub.id)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 transition-colors border-b",
                    activeId === sub.id ? "border-r-2" : "hover:bg-white/5"
                  )}
                  style={
                    activeId === sub.id
                      ? {
                          background: "rgba(232,75,34,0.12)",
                          borderRightColor: "hsl(var(--primary))",
                          color: "hsl(var(--primary))",
                          borderBottomColor: "hsl(var(--sidebar-border))",
                        }
                      : {
                          color: "hsl(var(--sidebar-foreground))",
                          borderBottomColor: "hsl(var(--sidebar-border))",
                        }
                  }
                >
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">
                      {completed.has(sub.id) ? (
                        <CheckCircle2 size={11} style={{ color: "hsl(var(--primary))" }} />
                      ) : (
                        <Circle size={11} style={{ opacity: 0.4 }} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium leading-snug truncate">
                        {highlight(sub.title, trimmedQuery)}
                      </div>
                      <div
                        className="text-[10px] mt-0.5 truncate opacity-60"
                      >
                        {mod.number}. {highlight(mod.title, trimmedQuery)} › {sec.number}. {highlight(sec.title, trimmedQuery)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p
              className="px-4 py-6 text-center text-[11px]"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              No lessons match "{trimmedQuery}"
            </p>
          )
        ) : (
          courseData.map((mod) => (
            <ModuleItem
              key={mod.id}
              mod={mod}
              expanded={expandedModules.has(mod.id)}
              expandedSections={expandedSections}
              activeId={activeId}
              completed={completed}
              onToggleModule={() => toggleModule(mod.id)}
              onToggleSection={toggleSection}
              onSelect={handleSelect}
            />
          ))
        )}
      </nav>
    </aside>
  );
}

function ModuleItem({
  mod,
  expanded,
  expandedSections,
  activeId,
  completed,
  onToggleModule,
  onToggleSection,
  onSelect,
}: {
  mod: Module;
  expanded: boolean;
  expandedSections: Set<string>;
  activeId: string;
  completed: Set<string>;
  onToggleModule: () => void;
  onToggleSection: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const totalSubs = mod.sections.flatMap((s) => s.subsections).length;
  const completedSubs = mod.sections
    .flatMap((s) => s.subsections)
    .filter((sub) => completed.has(sub.id)).length;

  return (
    <div>
      <button
        data-testid={`module-${mod.id}`}
        onClick={onToggleModule}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
        style={{ color: "hsl(var(--sidebar-foreground))" }}
      >
        <span className="shrink-0" style={{ color: "hsl(var(--primary))" }}>
          {expanded ? (
            <ChevronDown size={13} />
          ) : (
            <ChevronRight size={13} />
          )}
        </span>
        <span className="font-semibold text-xs flex-1 leading-snug">
          {mod.number}. {mod.title}
        </span>
        <span
          className="text-[10px] shrink-0 tabular-nums"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {completedSubs}/{totalSubs}
        </span>
      </button>

      {expanded && (
        <div>
          {mod.sections.map((sec) => (
            <SectionItem
              key={sec.id}
              sec={sec}
              expanded={expandedSections.has(sec.id)}
              activeId={activeId}
              completed={completed}
              onToggle={() => onToggleSection(sec.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionItem({
  sec,
  expanded,
  activeId,
  completed,
  onToggle,
  onSelect,
}: {
  sec: Section;
  expanded: boolean;
  activeId: string;
  completed: Set<string>;
  onToggle: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <button
        data-testid={`section-${sec.id}`}
        onClick={onToggle}
        className="w-full flex items-center gap-2 pl-7 pr-4 py-2 text-left hover:bg-white/5 transition-colors"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        <span className="shrink-0">
          {expanded ? (
            <ChevronDown size={11} />
          ) : (
            <ChevronRight size={11} />
          )}
        </span>
        <span className="text-[11px] flex-1 leading-snug font-medium">
          {sec.number}. {sec.title}
        </span>
      </button>

      {expanded && (
        <div>
          {sec.subsections.map((sub) => (
            <SubsectionItem
              key={sub.id}
              sub={sub}
              isActive={activeId === sub.id}
              isCompleted={completed.has(sub.id)}
              onSelect={() => onSelect(sub.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubsectionItem({
  sub,
  isActive,
  isCompleted,
  onSelect,
}: {
  sub: Subsection;
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      data-testid={`subsection-${sub.id}`}
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2 pl-12 pr-4 py-1.5 text-left transition-colors text-[11px] leading-snug",
        isActive
          ? "border-r-2"
          : "hover:bg-white/5"
      )}
      style={
        isActive
          ? {
              background: "rgba(232,75,34,0.12)",
              borderRightColor: "hsl(var(--primary))",
              color: "hsl(var(--primary))",
            }
          : { color: "hsl(var(--muted-foreground))" }
      }
    >
      <span className="shrink-0">
        {isCompleted ? (
          <CheckCircle2
            size={11}
            style={{ color: "hsl(var(--primary))" }}
          />
        ) : (
          <Circle size={11} style={{ opacity: 0.4 }} />
        )}
      </span>
      <span className="flex-1">{sub.number}. {sub.title}</span>
    </button>
  );
}
