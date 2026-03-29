"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { RefreshCw, TrendingUp, TrendingDown, Loader2, Minus } from "lucide-react";

/* ── constants ── */
const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" },
  { bg: "#dcfce7", color: "#166534" },
  { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#f3e8ff", color: "#6b21a8" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#e0f2fe", color: "#075985" },
  { bg: "#f1f5f9", color: "#334155" },
];

/* ── helpers ── */
const initials  = (name = "") => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const barColor  = (p) => p >= 75 ? "#16a34a" : p >= 60 ? "#f59e0b" : "#ef4444";
const subjStyle = (p) =>
  p >= 75 ? { borderColor: "#16a34a", color: "#166534", background: "#f0fdf4" }
  : p >= 60 ? { borderColor: "#f59e0b", color: "#92400e", background: "#fffbeb" }
  : { borderColor: "#ef4444", color: "#991b1b", background: "#fff5f5" };
const pillInfo  = (p) =>
  p >= 75 ? { label: "Good",     bg: "#dcfce7", color: "#166534" }
  : p >= 60 ? { label: "At risk", bg: "#fef3c7", color: "#92400e" }
  : { label: "Critical",          bg: "#fee2e2", color: "#991b1b" };

// Format "2026-03" → "Mar 2026"
const fmtMonth = (m) => {
  if (!m) return m;
  const [y, mo] = m.split("-");
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[parseInt(mo) - 1]} ${y}`;
};

/* ════════════════════════════════════════════ */
const LecturerDashboard = ({ user }) => {
  /* filters — pre-filled from staff profile */
  const [selBranch,  setSelBranch]  = useState(user?.branch          || "all");
  const [selYear,    setSelYear]    = useState(user?.academicYear     || "all");
  const [selSection, setSelSection] = useState(user?.assignedSection  || "all");
  const [selSubject, setSelSubject] = useState(
    user?.assignedSubjects?.length === 1 ? user.assignedSubjects[0] : "all"
  );
  const [selMonth,   setSelMonth]   = useState("all");

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /* chart refs */
  const trendRef   = useRef(null);
  const donutRef   = useRef(null);
  const trendInst  = useRef(null);
  const donutInst  = useRef(null);

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        branch:  selBranch,
        year:    selYear,
        section: selSection,
        subject: selSubject,
        month:   selMonth,
      });
      const res = await fetch(`/api/lecturer/dashboard?${qs}`);
      if (!res.ok) throw new Error("Server error");
      setData(await res.json());
    } catch (e) {
      console.error(e);
      setError("Could not load attendance data.");
    }
    setLoading(false);
  }, [selBranch, selYear, selSection, selSubject, selMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── draw charts ── */
  useEffect(() => {
    if (loading || !data) return;
    let cancelled = false;

    (async () => {
      const { Chart, registerables } = await import("chart.js");
      Chart.register(...registerables);
      if (cancelled) return;

      trendInst.current?.destroy();
      donutInst.current?.destroy();

      /* Trend line */
      if (trendRef.current && data.classTrend.length > 0) {
        trendInst.current = new Chart(trendRef.current, {
          type: "line",
          data: {
            labels: data.classTrend.map((t) => fmtMonth(t.month)),
            datasets: [{
              data: data.classTrend.map((t) => t.pct),
              borderColor: "#2563eb",
              backgroundColor: "rgba(37,99,235,0.07)",
              fill: true, tension: 0.4,
              pointRadius: 4, pointBackgroundColor: "#2563eb",
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 10 } } },
              y: {
                min: 50, max: 100,
                grid: { color: "rgba(0,0,0,0.04)" },
                ticks: { font: { size: 10 }, callback: (v) => v + "%" },
              },
            },
          },
        });
      }

      /* Donut */
      if (donutRef.current) {
        const { onTrack, atRisk, critical } = data.stats;
        donutInst.current = new Chart(donutRef.current, {
          type: "doughnut",
          data: {
            labels: [`Good ≥75% (${onTrack})`, `At risk 60–75% (${atRisk})`, `Critical <60% (${critical})`],
            datasets: [{
              data: [onTrack, atRisk, critical],
              backgroundColor: ["#16a34a", "#f59e0b", "#ef4444"],
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: { font: { size: 11 }, boxWidth: 10, padding: 12 },
              },
            },
            cutout: "65%",
          },
        });
      }
    })();

    return () => {
      cancelled = true;
      trendInst.current?.destroy();
      donutInst.current?.destroy();
    };
  }, [loading, data]);

  /* ── styles ── */
  const s = {
    dash:       { minHeight: "100vh", background: "#f4f6fb", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
    topbar:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px 16px", background: "#fff", borderBottom: "1px solid #eaecf0" },
    topTitle:   { fontSize: 19, fontWeight: 700, color: "#111827", letterSpacing: -0.4 },
    topSub:     { fontSize: 12, color: "#6b7280", marginTop: 2 },
    liveBadge:  { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "5px 13px", borderRadius: 20, background: "#dcfce7", color: "#166534" },
    liveDot:    { width: 7, height: 7, borderRadius: "50%", background: "#16a34a" },
    filters:    { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", padding: "12px 28px", background: "#fff", borderBottom: "1px solid #eaecf0" },
    filterLbl:  { fontSize: 12, fontWeight: 500, color: "#6b7280" },
    filterSel:  { fontSize: 13, padding: "6px 12px", borderRadius: 8, border: "1px solid #e0e4ec", background: "#f8f9fb", color: "#111827", cursor: "pointer", fontFamily: "inherit", outline: "none" },
    statsRow:   { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, padding: "20px 28px 0" },
    statCard:   { background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #eaecf0" },
    statLbl:    { fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 },
    statVal:    { fontSize: 28, fontWeight: 700, color: "#111827", lineHeight: 1 },
    statSub:    { fontSize: 11, color: "#9ca3af", marginTop: 4, display: "flex", alignItems: "center", gap: 4 },
    statDot:    { display: "inline-block", width: 7, height: 7, borderRadius: "50%" },
    secTitle:   { fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1.2, padding: "20px 28px 10px" },
    chartRow:   { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, padding: "0 28px 6px" },
    chartCard:  { background: "#fff", border: "1px solid #eaecf0", borderRadius: 14, padding: "16px 18px" },
    chartTitle: { fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 },
    canvasWrap: { position: "relative", height: 180, width: "100%" },
    tableWrap:  { padding: "0 28px 36px", overflowX: "auto" },
    table:      { width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #eaecf0" },
    th:         { textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, padding: "10px 14px", borderBottom: "1px solid #eaecf0", background: "#f8f9fb", whiteSpace: "nowrap" },
    td:         { padding: "11px 14px", color: "#111827", verticalAlign: "middle", borderBottom: "1px solid #f3f4f6" },
    avatar:     { width: 32, height: 32, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginRight: 9, flexShrink: 0 },
    subjRow:    { display: "flex", gap: 5, flexWrap: "wrap" },
    subjChip:   { fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, border: "1px solid" },
    barOuter:   { height: 7, borderRadius: 4, background: "#f0f0f0", width: 88, display: "inline-block", verticalAlign: "middle" },
    barInner:   { height: "100%", borderRadius: 4 },
    barPct:     { fontSize: 12, color: "#6b7280", marginLeft: 7, verticalAlign: "middle", fontWeight: 500 },
    pill:       { display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 20 },
    refreshBtn: { padding: "7px 9px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" },
  };

  /* subjects from staff profile for filter */
  const staffSubjects = user?.assignedSubjects || [];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#f4f6fb" }}>
      <Loader2 size={30} style={{ color: "#2563eb" }} />
      <span style={{ fontSize: 13, color: "#9ca3af" }}>Loading attendance data…</span>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#991b1b" }}>
      {error}
    </div>
  );

  const { students = [], stats = {}, classTrend = [], monthList = [], subjectList = [] } = data || {};

  return (
    <div style={s.dash}>

      {/* ── Top bar ── */}
      <div style={s.topbar}>
        <div>
          <div style={s.topTitle}>Welcome back, {user?.name?.split(" ")[0] || "Lecturer"} 👋</div>
          <div style={s.topSub}>
            {[user?.branch, user?.academicYear && `Year ${user.academicYear}`, user?.assignedSection && `Section ${user.assignedSection}`]
              .filter(Boolean).join(" · ")}
            {selSubject !== "all" ? ` · ${selSubject}` : ""}
            {selMonth   !== "all" ? ` · ${fmtMonth(selMonth)}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={fetchData} style={s.refreshBtn} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <span style={s.liveBadge}><span style={s.liveDot} />Live</span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={s.filters}>
        {/* Subject — from staff's assignedSubjects */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={s.filterLbl}>Subject</span>
          <select style={s.filterSel} value={selSubject} onChange={(e) => setSelSubject(e.target.value)}>
            <option value="all">All Subjects</option>
            {(staffSubjects.length > 0 ? staffSubjects : subjectList).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={s.filterLbl}>Month</span>
          <select style={s.filterSel} value={selMonth} onChange={(e) => setSelMonth(e.target.value)}>
            <option value="all">All Months</option>
            {monthList.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
          </select>
        </div>

        {/* Year */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={s.filterLbl}>Year</span>
          <select style={s.filterSel} value={selYear} onChange={(e) => setSelYear(e.target.value)}>
            <option value="all">All Years</option>
            {["Year 1","Year 2","Year 3","Year 4"].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Branch */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={s.filterLbl}>Branch</span>
          <select style={s.filterSel} value={selBranch} onChange={(e) => setSelBranch(e.target.value)}>
            <option value="all">All Branches</option>
            {["CSE","ECE","MECH","CIVIL","AI","IT"].map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {stats.total > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 13, color: "#6b7280" }}>
            Class avg: <strong style={{ color: "#2563eb" }}>{stats.avgPct}%</strong>
          </span>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div style={s.statsRow}>
        {[
          { label: "Total Students", value: stats.total,    color: "#111827", dot: "#2563eb",  sub: "in current filter" },
          { label: "Avg Attendance", value: (stats.avgPct || 0) + "%", color: "#111827", dot: "#2563eb", sub: "across subjects" },
          { label: "On Track",       value: stats.onTrack,  color: "#16a34a", dot: "#16a34a",  sub: "≥ 75% attendance" },
          { label: "Critical",       value: stats.critical, color: "#ef4444", dot: "#ef4444",  sub: "< 60% attendance" },
        ].map(({ label, value, color, dot, sub }) => (
          <div key={label} style={s.statCard}>
            <div style={s.statLbl}>{label}</div>
            <div style={{ ...s.statVal, color }}>{value}</div>
            <div style={s.statSub}><span style={{ ...s.statDot, background: dot }} />{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div style={s.secTitle}>Attendance overview</div>
      <div style={s.chartRow}>

        {/* Trend line */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            Monthly attendance trend
            {selSubject !== "all" ? ` — ${selSubject}` : ""}
          </div>
          {classTrend.length === 0 ? (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
              No trend data for this filter
            </div>
          ) : (
            <div style={s.canvasWrap}><canvas ref={trendRef} /></div>
          )}
        </div>

        {/* Donut */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}>Student distribution</div>
          <div style={s.canvasWrap}><canvas ref={donutRef} /></div>
        </div>
      </div>

      {/* ── Student table ── */}
      <div style={s.secTitle}>Student records</div>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["#", "Student", "Section", "Subject-wise", "Classes", "Overall", "Trend", "Status"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...s.td, textAlign: "center", padding: "48px", color: "#9ca3af" }}>
                  No students found for this filter
                </td>
              </tr>
            ) : (
              students.map((st, i) => {
                const av   = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const pill = pillInfo(st.overall);
                // classes attended this month or total
                const latestMonth = st.monthTrend[st.monthTrend.length - 1];
                return (
                  <tr key={st.rollNo}>
                    {/* # */}
                    <td style={{ ...s.td, color: "#9ca3af", fontFamily: "monospace", fontSize: 11 }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>

                    {/* Student */}
                    <td style={s.td}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ ...s.avatar, background: av.bg, color: av.color }}>
                          {initials(st.name)}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{st.name}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>{st.rollNo}</div>
                        </div>
                      </div>
                    </td>

                    {/* Section */}
                    <td style={s.td}>
                      <div style={{ fontSize: 12, color: "#374151" }}>{st.section || "—"}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{st.branch} · Yr {st.year}</div>
                    </td>

                    {/* Subject chips */}
                    <td style={s.td}>
                      <div style={s.subjRow}>
                        {Object.entries(st.subjects).length === 0 ? (
                          <span style={{ color: "#9ca3af", fontSize: 12 }}>No records</span>
                        ) : (
                          Object.entries(st.subjects).map(([subj, pct]) => (
                            <span key={subj} style={{ ...s.subjChip, ...subjStyle(pct) }}>
                              {subj}: {pct}%
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Classes attended */}
                    <td style={{ ...s.td, fontSize: 12, color: "#374151" }}>
                      {latestMonth
                        ? <><strong>{latestMonth.attended}</strong><span style={{ color: "#9ca3af" }}>/{latestMonth.total}</span></>
                        : "—"}
                    </td>

                    {/* Overall bar */}
                    <td style={s.td}>
                      <div style={s.barOuter}>
                        <div style={{ ...s.barInner, width: `${st.overall}%`, background: barColor(st.overall) }} />
                      </div>
                      <span style={s.barPct}>{st.overall}%</span>
                    </td>

                    {/* Trend */}
                    <td style={{ ...s.td, textAlign: "center" }}>
                      {st.trendDir > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <TrendingUp size={15} style={{ color: "#16a34a" }} />
                          <span style={{ fontSize: 10, color: "#16a34a" }}>+{st.trendDir}%</span>
                        </div>
                      ) : st.trendDir < 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <TrendingDown size={15} style={{ color: "#ef4444" }} />
                          <span style={{ fontSize: 10, color: "#ef4444" }}>{st.trendDir}%</span>
                        </div>
                      ) : (
                        <Minus size={14} style={{ color: "#9ca3af", margin: "0 auto", display: "block" }} />
                      )}
                    </td>

                    {/* Status */}
                    <td style={s.td}>
                      <span style={{ ...s.pill, background: pill.bg, color: pill.color }}>
                        {pill.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LecturerDashboard;