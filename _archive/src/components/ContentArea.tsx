import { CheckCircle2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { ExerciseBox } from "@/components/ExerciseBox";
import { LessonNotes } from "@/components/LessonNotes";
import { getAllSubsections } from "@/data/courseData";
import type { Module, Section, Subsection } from "@/data/courseData";

interface ContentAreaProps {
  module: Module;
  section: Section;
  subsection: Subsection;
  completed: Set<string>;
  onMarkComplete: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function ContentArea({
  module,
  section,
  subsection,
  completed,
  onMarkComplete,
  onNavigate,
}: ContentAreaProps) {
  const all = getAllSubsections();
  const idx = all.findIndex((x) => x.subsection.id === subsection.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const isDone = completed.has(subsection.id);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <header
        className="shrink-0 flex items-center justify-between px-8 py-3 border-b text-xs"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
        }}
      >
        <div
          className="flex items-center gap-2"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          <span>{module.number}. {module.title}</span>
          <span style={{ color: "hsl(var(--border))" }}>/</span>
          <span>{section.number}. {section.title}</span>
          <span style={{ color: "hsl(var(--border))" }}>/</span>
          <span style={{ color: "hsl(var(--foreground))" }}>
            {subsection.number}. {subsection.title}
          </span>
        </div>

        <div
          className="text-xs font-mono"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Get Good at Python: {module.title}
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-10 py-10">
          {/* Page title */}
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {subsection.title}
          </h1>
          <div
            className="text-xs mb-8 font-mono"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {subsection.number} — {section.title}
            {subsection.duration && (
              <span className="ml-3">· {subsection.duration}</span>
            )}
          </div>

          {/* Content blocks */}
          {subsection.content.map((block, i) => {
            if (block.type === "objectives" && block.items) {
              return (
                <div
                  key={i}
                  className="mb-8 rounded-lg border p-5"
                  style={{
                    background: "rgba(96,165,250,0.06)",
                    borderColor: "rgba(96,165,250,0.2)",
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: "#60a5fa" }}
                  >
                    Learning Objectives
                  </p>
                  <ul className="space-y-1.5">
                    {block.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        <span
                          className="mt-1 shrink-0 text-xs"
                          style={{ color: "#60a5fa" }}
                        >
                          {j + 1}.
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            if (block.type === "text" && block.content) {
              return (
                <p
                  key={i}
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "hsl(var(--foreground))", opacity: 0.9 }}
                >
                  {block.content}
                </p>
              );
            }

            if (block.type === "heading" && block.content) {
              return (
                <h2
                  key={i}
                  className="text-lg font-semibold mt-8 mb-3"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  {block.content}
                </h2>
              );
            }

            if (block.type === "code" && block.codeBlock) {
              return (
                <CodeBlock
                  key={i}
                  code={block.codeBlock.code}
                  caption={block.codeBlock.caption}
                />
              );
            }

            if (block.type === "note" && block.content) {
              return (
                <div
                  key={i}
                  className="my-5 flex gap-3 rounded-lg border p-4"
                  style={{
                    background: "rgba(251,191,36,0.07)",
                    borderColor: "rgba(251,191,36,0.25)",
                  }}
                >
                  <AlertCircle
                    size={16}
                    className="shrink-0 mt-0.5"
                    style={{ color: "#fbbf24" }}
                  />
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#fbbf24", opacity: 0.9 }}
                  >
                    {block.content}
                  </p>
                </div>
              );
            }

            return null;
          })}

          {/* Exercises */}
          {subsection.exercises && subsection.exercises.length > 0 && (
            <ExerciseBox exercises={subsection.exercises} subsectionId={subsection.id} />
          )}

          {/* Lesson Notes */}
          <LessonNotes subsectionId={subsection.id} />

          {/* Mark complete + nav */}
          <div className="mt-10 pt-6 border-t flex items-center justify-between" style={{ borderColor: "hsl(var(--border))" }}>
            <button
              data-testid="mark-complete-btn"
              onClick={() => onMarkComplete(subsection.id)}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all"
              style={
                isDone
                  ? {
                      background: "rgba(74,222,128,0.1)",
                      color: "#4ade80",
                      border: "1px solid rgba(74,222,128,0.3)",
                    }
                  : {
                      background: "hsl(var(--primary))",
                      color: "#fff",
                    }
              }
            >
              <CheckCircle2 size={15} />
              {isDone ? "Completed" : "Mark as Complete"}
            </button>

            <div className="flex items-center gap-2">
              {prev && (
                <button
                  data-testid="nav-prev-btn"
                  onClick={() => onNavigate(prev.subsection.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors hover:bg-white/5"
                  style={{ color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
                >
                  <ChevronLeft size={13} />
                  Previous
                </button>
              )}
              {next && (
                <button
                  data-testid="nav-next-btn"
                  onClick={() => onNavigate(next.subsection.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "#fff",
                  }}
                >
                  Next
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
