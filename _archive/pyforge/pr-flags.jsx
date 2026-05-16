// pr-flags.jsx — P5: CTF flag tracker / scoreboard

function FlagsPage({ capturedFlags, onReplay }) {
  const starters = window.LAB_STARTERS;
  const entries = Object.entries(starters);
  const got = entries.filter(([, s]) => capturedFlags.has(s.flag));
  const locked = entries.filter(([, s]) => !capturedFlags.has(s.flag));

  const byDiff = { easy: 0, med: 0, hard: 0 };
  const byDiffTotal = { easy: 0, med: 0, hard: 0 };
  for (const [, s] of entries) {
    byDiffTotal[s.diff] = (byDiffTotal[s.diff] || 0) + 1;
    if (capturedFlags.has(s.flag)) byDiff[s.diff] = (byDiff[s.diff] || 0) + 1;
  }

  const captureDate = (flag) => {
    const dates = window.LS.get("offsec-py-flag-dates", {});
    return dates[flag] || null;
  };

  function FlagCard({ labKey, starter, isCaptured }) {
    const date = isCaptured ? captureDate(starter.flag) : null;
    return (
      <div className={"flag-card " + (isCaptured ? "got" : "locked")}>
        <div className="flag-card-head">
          <span className="flag-card-num">#{labKey}</span>
          <span className={"flag-diff " + (starter.diff || "easy")}>{starter.diff || "easy"}</span>
        </div>
        <div className="flag-name">
          <span>{isCaptured ? "⚑" : "🔒"}</span>
          <span style={{ wordBreak: "break-all" }}>
            {isCaptured ? starter.flag : "???????????????????"}
          </span>
        </div>
        <div className="flag-lab">{starter.instructions?.slice(0, 72)}{starter.instructions?.length > 72 ? "…" : ""}</div>
        <div className="flag-foot">
          <span>{isCaptured ? (date ? `captured ${date}` : "captured") : "not yet captured"}</span>
          {isCaptured && (
            <span className="flag-replay" onClick={() => onReplay(labKey)}>replay →</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flags-page">
      <div className="flags-inner">
        <div className="flags-head">
          <h1 className="flags-h1">Captured Flags</h1>
          <div className="flags-stats">
            <div className="flag-stat">
              <div className="lbl">Total</div>
              <div className={"val " + (got.length > 0 ? "green" : "")}>{got.length} / {entries.length}</div>
            </div>
            <div className="flag-stat">
              <div className="lbl">Easy</div>
              <div className="val">{byDiff.easy || 0}/{byDiffTotal.easy || 0}</div>
            </div>
            <div className="flag-stat">
              <div className="lbl">Medium</div>
              <div className="val">{byDiff.med || 0}/{byDiffTotal.med || 0}</div>
            </div>
            <div className="flag-stat">
              <div className="lbl">Hard</div>
              <div className="val">{byDiff.hard || 0}/{byDiffTotal.hard || 0}</div>
            </div>
          </div>
        </div>

        {got.length > 0 && (
          <>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--green)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600 }}>
              ✓ Captured · {got.length}
            </div>
            <div className="flags-grid" style={{ marginBottom: 32 }}>
              {got.map(([k, s]) => <FlagCard key={k} labKey={k} starter={s} isCaptured={true} />)}
            </div>
          </>
        )}

        {locked.length > 0 && (
          <>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--fg3)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>
              🔒 Locked · {locked.length}
            </div>
            <div className="flags-grid">
              {locked.map(([k, s]) => <FlagCard key={k} labKey={k} starter={s} isCaptured={false} />)}
            </div>
          </>
        )}

        {got.length === 0 && locked.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--mono)", fontSize: 12, color: "var(--fg3)" }}>
            No labs found.
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { FlagsPage });
