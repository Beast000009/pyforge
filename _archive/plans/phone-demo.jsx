// Phone demo — mobile companion app concept for the OffSec Python course.
// Two toggleable views: lesson reading & captured-flags scoreboard.

const { useState: usePhoneState } = React;

// ── Brand-tinted helpers ─────────────────────────────────────
const OFFSEC_ORANGE = "#e84b22";
const KALI_GREEN    = "#4ade80";
const DARK_BG       = "#0a0d14";
const DARK_CARD     = "#141a27";
const DARK_BORDER   = "#1f2738";
const FG            = "#e8ecf3";
const FG_MUTED      = "#8995a8";

// ── Top app bar (custom, replaces IOSNavBar to match brand) ──
function PhoneBar({ title, subtitle }) {
  return (
    <div style={{
      padding: "10px 18px 12px",
      borderBottom: `1px solid ${DARK_BORDER}`,
      background: "rgba(10,13,20,0.85)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
      }}>
        <span style={{
          background: OFFSEC_ORANGE,
          color: "white",
          padding: "2px 6px",
          borderRadius: 4,
          fontWeight: 700,
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontFamily: "Geist, sans-serif",
        }}>OffSec</span>
        <span style={{ color: FG_MUTED, fontSize: 11, fontWeight: 500 }}>{subtitle}</span>
        <span style={{
          marginLeft: "auto",
          color: FG_MUTED,
          fontSize: 16,
        }}>≡</span>
      </div>
      <div style={{
        fontFamily: "Instrument Serif, Georgia, serif",
        fontSize: 26,
        fontWeight: 400,
        letterSpacing: "-0.015em",
        lineHeight: 1.1,
        color: FG,
      }}>{title}</div>
    </div>
  );
}

// ── Lesson reading view ─────────────────────────────────────
function PhoneLessonView() {
  return (
    <div style={{
      background: DARK_BG,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      color: FG,
      fontFamily: "Geist, sans-serif",
    }}>
      <PhoneBar
        subtitle="Get Good at Python"
        title="Slicing Strings"
      />

      {/* Progress + meta */}
      <div style={{
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: `1px solid ${DARK_BORDER}`,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
        color: FG_MUTED,
      }}>
        <span style={{ color: OFFSEC_ORANGE }}>1.1.3</span>
        <span>·</span>
        <span>~12 min</span>
        <div style={{ flex: 1, height: 3, background: DARK_BORDER, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: "62%", height: "100%", background: OFFSEC_ORANGE, borderRadius: 2 }} />
        </div>
        <span>9/14</span>
      </div>

      {/* Scrolling content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px 24px" }}>
        <div style={{
          background: "rgba(96,165,250,0.08)",
          border: "1px solid rgba(96,165,250,0.2)",
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 16,
        }}>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 9.5,
            color: "#60a5fa",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 6,
          }}>You'll learn to</div>
          <ol style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>
            <li>Slice strings by index</li>
            <li>Use negative indexing</li>
            <li>Step through with [::n]</li>
          </ol>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.65, marginBottom: 12, opacity: 0.92 }}>
          Strings in Python are <em>sequences</em>, which means we can extract sub-strings by index — a technique called slicing.
        </p>

        {/* Code block */}
        <div style={{
          background: "#060a13",
          border: `1px solid ${DARK_BORDER}`,
          borderRadius: 10,
          marginBottom: 14,
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "7px 12px",
            background: DARK_CARD,
            borderBottom: `1px solid ${DARK_BORDER}`,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: FG_MUTED,
          }}>
            <span><span style={{ color: OFFSEC_ORANGE, marginRight: 4 }}>py</span>slice.py</span>
            <span style={{ color: "#fbbf24" }}>read-only on mobile</span>
          </div>
          <pre style={{
            margin: 0,
            padding: "12px 14px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11.5,
            lineHeight: 1.7,
            color: "#c9d1d9",
          }}>
{`>>> `}<span style={{ color: "#ff7b72" }}>name</span>{` = `}<span style={{ color: "#a5d6ff" }}>"kali"</span>
{`>>> `}<span style={{ color: "#ff7b72" }}>name</span>{`[:`}<span style={{ color: "#79c0ff" }}>2</span>{`]`}
<span style={{ color: "#a5d6ff" }}>{`'ka'`}</span>
          </pre>
        </div>

        {/* Lab-on-desktop nudge */}
        <div style={{
          padding: "12px 14px",
          background: "rgba(251,191,36,0.07)",
          borderLeft: `3px solid #fbbf24`,
          borderRadius: "0 8px 8px 0",
          marginBottom: 14,
        }}>
          <div style={{ fontSize: 11.5, color: "#fbbf24", fontWeight: 600, marginBottom: 4 }}>
            ⚠︎ Lab VM is desktop-only
          </div>
          <div style={{ fontSize: 12, color: FG_MUTED, lineHeight: 1.55 }}>
            Tap the link below to email yourself a one-click resume that opens this exact lesson on your laptop.
          </div>
        </div>

        <button style={{
          width: "100%",
          padding: "12px 14px",
          background: OFFSEC_ORANGE,
          color: "white",
          border: "none",
          borderRadius: 10,
          fontFamily: "Geist, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.005em",
          marginBottom: 10,
        }}>
          ✉︎  Send resume link to me
        </button>
        <button style={{
          width: "100%",
          padding: "12px 14px",
          background: "transparent",
          color: FG,
          border: `1px solid ${DARK_BORDER}`,
          borderRadius: 10,
          fontFamily: "Geist, sans-serif",
          fontSize: 14,
          fontWeight: 500,
        }}>
          Mark as complete
        </button>
      </div>

      {/* Bottom navigation */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        borderTop: `1px solid ${DARK_BORDER}`,
        background: "rgba(10,13,20,0.95)",
        backdropFilter: "blur(10px)",
        padding: "6px 0 26px",
      }}>
        {[
          { lbl: "Home",   ico: "⌂", on: false },
          { lbl: "Learn",  ico: "▤", on: true },
          { lbl: "Flags",  ico: "⚑", on: false },
          { lbl: "Notes",  ico: "✎", on: false },
        ].map((tab) => (
          <div key={tab.lbl} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            padding: "6px 0",
            color: tab.on ? OFFSEC_ORANGE : FG_MUTED,
          }}>
            <span style={{ fontSize: 18 }}>{tab.ico}</span>
            <span style={{
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}>{tab.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Flag tracker view ──────────────────────────────────────
function PhoneFlagsView() {
  const flags = [
    { name: "py_version_kali_pwn", diff: "easy", got: true },
    { name: "slice_42",            diff: "easy", got: true },
    { name: "cast_overflow",       diff: "med",  got: true },
    { name: "dict_smash",          diff: "med",  got: true },
    { name: "???????????",         diff: "hard", got: false },
    { name: "???????????",         diff: "hard", got: false },
    { name: "???????????",         diff: "hard", got: false },
  ];

  return (
    <div style={{
      background: DARK_BG,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      color: FG,
      fontFamily: "Geist, sans-serif",
    }}>
      <PhoneBar
        subtitle="Captured Flags"
        title="4 of 12"
      />

      {/* Stats row */}
      <div style={{
        padding: "14px 18px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
        borderBottom: `1px solid ${DARK_BORDER}`,
      }}>
        {[
          { lbl: "Streak", val: "7d", col: KALI_GREEN },
          { lbl: "Easy",   val: "2/4" },
          { lbl: "Medium", val: "2/4", col: "#fbbf24" },
        ].map((s) => (
          <div key={s.lbl} style={{
            background: DARK_CARD,
            border: `1px solid ${DARK_BORDER}`,
            borderRadius: 8,
            padding: "8px 10px",
          }}>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9,
              color: FG_MUTED,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 2,
            }}>{s.lbl}</div>
            <div style={{
              fontFamily: "Instrument Serif, Georgia, serif",
              fontSize: 22,
              color: s.col || FG,
              lineHeight: 1,
            }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Flag list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        {flags.map((f, i) => (
          <div key={i} style={{
            background: f.got
              ? "linear-gradient(135deg, rgba(74,222,128,0.08), transparent)"
              : DARK_CARD,
            border: `1px solid ${f.got ? "rgba(74,222,128,0.25)" : DARK_BORDER}`,
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 8,
            opacity: f.got ? 1 : 0.65,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 13,
                fontWeight: 600,
                color: f.got ? KALI_GREEN : FG_MUTED,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <span>{f.got ? "⚑" : "🔒"}</span>
                <span>{f.name}</span>
              </div>
              <div style={{
                fontSize: 9,
                fontFamily: "JetBrains Mono, monospace",
                padding: "2px 6px",
                borderRadius: 3,
                background: f.diff === "easy" ? "rgba(74,222,128,0.12)" :
                            f.diff === "med"  ? "rgba(251,191,36,0.12)" :
                                                "rgba(232,75,34,0.12)",
                color:      f.diff === "easy" ? KALI_GREEN :
                            f.diff === "med"  ? "#fbbf24" :
                                                OFFSEC_ORANGE,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}>{f.diff}</div>
            </div>
            <div style={{
              fontSize: 11.5,
              color: FG_MUTED,
              fontFamily: "JetBrains Mono, monospace",
            }}>
              {f.got ? `from lab ${(i + 1).toString().padStart(2,"0")}` : `complete a lab to unlock`}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom navigation */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        borderTop: `1px solid ${DARK_BORDER}`,
        background: "rgba(10,13,20,0.95)",
        backdropFilter: "blur(10px)",
        padding: "6px 0 26px",
      }}>
        {[
          { lbl: "Home",   ico: "⌂", on: false },
          { lbl: "Learn",  ico: "▤", on: false },
          { lbl: "Flags",  ico: "⚑", on: true },
          { lbl: "Notes",  ico: "✎", on: false },
        ].map((tab) => (
          <div key={tab.lbl} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            padding: "6px 0",
            color: tab.on ? OFFSEC_ORANGE : FG_MUTED,
          }}>
            <span style={{ fontSize: 18 }}>{tab.ico}</span>
            <span style={{
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}>{tab.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Phone demo wrapper ────────────────────────────────────
function PhoneDemo() {
  const [view, setView] = usePhoneState("lesson");
  return (
    <div className="phone-stage">
      <window.IOSDevice dark={true} width={362} height={750}>
        {view === "lesson" ? <PhoneLessonView /> : <PhoneFlagsView />}
      </window.IOSDevice>
      <div className="phone-toggle">
        <button
          className={view === "lesson" ? "active" : ""}
          onClick={() => setView("lesson")}
        >Lesson</button>
        <button
          className={view === "flags" ? "active" : ""}
          onClick={() => setView("flags")}
        >Flags</button>
      </div>
    </div>
  );
}

Object.assign(window, { PhoneDemo });
