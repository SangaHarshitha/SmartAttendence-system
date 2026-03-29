"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Loader2, AlertTriangle, BookOpen, TrendingUp, RefreshCw, Plus, Minus } from "lucide-react";

const pctColor  = (p) => p >= 75 ? "#16a34a" : p >= 60 ? "#f59e0b" : "#ef4444";
const pctBg     = (p) => p >= 75 ? "#f0fdf4" : p >= 60 ? "#fffbeb" : "#fef2f2";
const pctBorder = (p) => p >= 75 ? "#bbf7d0" : p >= 60 ? "#fde68a" : "#fecaca";

const formatMonth = (m) => {
  if (!m) return "";
  const [yr, mn] = m.split("-");
  return new Date(parseInt(yr), parseInt(mn) - 1, 1)
    .toLocaleString("default", { month: "long", year: "numeric" });
};

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/* ── Interactive Predictor ── */
const PredictorCard = ({ attended, total }) => {
  const [extra, setExtra] = useState(0);
  const newPct = (total + extra) > 0
    ? Math.round(((attended + extra) / (total + extra)) * 100)
    : 0;
  const need75 = Math.max(0, Math.ceil((0.75 * total - attended) / 0.25));

  return (
    <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f8f9fb", border: "1px solid #e5e7eb" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
        Predictor — if I attend more classes
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setExtra(Math.max(0, extra - 1))}
          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Minus size={12} />
        </button>
        <div style={{ textAlign: "center", minWidth: 48 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>+{extra}</div>
          <div style={{ fontSize: 10, color: "#9ca3af" }}>classes</div>
        </div>
        <button onClick={() => setExtra(extra + 1)}
          style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plus size={12} />
        </button>
        <div style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: pctBg(newPct), border: `1px solid ${pctBorder(newPct)}` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: pctColor(newPct) }}>{newPct}%</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>{attended + extra}/{total + extra} classes</div>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600,
        color: need75 === 0 ? "#16a34a" : "#f59e0b",
        background: need75 === 0 ? "#f0fdf4" : "#fffbeb",
        border: `1px solid ${need75 === 0 ? "#bbf7d0" : "#fde68a"}`,
        borderRadius: 7, padding: "5px 10px" }}>
        {need75 === 0
          ? `✓ Above 75% — can miss ${Math.floor((4 * attended - 3 * total) / 3)} more`
          : `Need ${need75} consecutive classes to reach 75%`}
      </div>
    </div>
  );
};

/* ════════════════════ MAIN COMPONENT ════════════════════ */
const StudentDashboard = ({ user }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const rawRollNo = user?.rollNo || user?.roll ||
    (typeof window !== "undefined" ? localStorage.getItem("rollNo") : "") || "";
  const rollNo = String(rawRollNo).replace(/^0+(?=\d)/, "");

  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selMonth, setSelMonth] = useState(currentMonthKey());

  // ✅ FIXED loadData — handles { success, data: [...] } response format
  const loadData = useCallback(async () => {
    if (!rollNo) { setError("Roll number not found."); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res  = await fetch(`/api/attendance/monthly?rollNo=${rollNo}`, { headers });
      const data = res.ok ? await res.json() : [];

      // Handle both plain array and { success: true, data: [...] } formats
      const arr = Array.isArray(data) ? data
                : Array.isArray(data?.data) ? data.data
                : [];

      setRecords(arr);

      if (arr.length > 0) {
        // ✅ Always auto-select the most recent month that has data
        const months = [...new Set(arr.map(r => r.month))].sort((a, b) => b.localeCompare(a));
        setSelMonth(months[0]);
      }
    } catch { setError("Failed to load attendance."); }
    setLoading(false);
  }, [rollNo, token]);

  useEffect(() => { loadData(); }, [loadData]);

  const allMonths = [...new Set(records.map(r => r.month))].sort((a, b) => b.localeCompare(a));
  const curRecs   = records.filter(r => r.month === selMonth);

  /* Month stats */
  const mAttended = curRecs.reduce((a, r) => a + (r.attendedClasses || 0), 0);
  const mTotal    = curRecs.reduce((a, r) => a + (r.totalClasses    || 0), 0);
  const mPct      = mTotal > 0 ? Math.round((mAttended / mTotal) * 100) : 0;
  const onTrack   = curRecs.filter(r => r.percentage >= 75).length;
  const atRisk    = curRecs.filter(r => r.percentage >= 60 && r.percentage < 75).length;
  const critical  = curRecs.filter(r => r.percentage  < 60).length;

  /* Overall stats — all months, grouped by subject */
  const subjectTotals = {};
  for (const r of records) {
    if (!subjectTotals[r.subject]) subjectTotals[r.subject] = { attended: 0, total: 0 };
    subjectTotals[r.subject].attended += r.attendedClasses || 0;
    subjectTotals[r.subject].total    += r.totalClasses    || 0;
  }
  const ovAtt = Object.values(subjectTotals).reduce((a, s) => a + s.attended, 0);
  const ovTot = Object.values(subjectTotals).reduce((a, s) => a + s.total,    0);
  const ovPct = ovTot > 0 ? Math.round((ovAtt / ovTot) * 100) : 0;

  const st = {
    wrap:     { minHeight: "100vh", background: "#f4f6fb", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
    topbar:   { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", background: "#fff", borderBottom: "1px solid #eaecf0" },
    body:     { padding: "22px 28px", display: "flex", flexDirection: "column", gap: 20 },
    card:     { background: "#fff", border: "1px solid #eaecf0", borderRadius: 14, padding: "18px 20px" },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
    subGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 },
    monthBtn: (active) => ({
      padding: "8px 18px", borderRadius: 99, fontSize: 12, fontWeight: 600,
      cursor: "pointer", border: "1px solid", transition: "all .15s",
      background: active ? "#2563eb" : "#fff",
      color:      active ? "#fff"    : "#374151",
      borderColor:active ? "#2563eb" : "#d1d5db",
    }),
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Loader2 size={30} style={{ color: "#2563eb" }} />
      <span style={{ fontSize: 14, color: "#9ca3af" }}>Loading attendance…</span>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <AlertTriangle size={32} style={{ color: "#ef4444" }} />
      <span style={{ fontSize: 14, color: "#991b1b" }}>{error}</span>
    </div>
  );

  return (
    <div style={st.wrap}>

      {/* Top bar */}
      <div style={st.topbar}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>My Attendance 📊</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            {user?.name} · {records[0]?.branch || user?.branch} · Roll No: {rollNo}
          </div>
        </div>
        <button onClick={loadData} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}>
          <RefreshCw size={15} />
        </button>
      </div>

      <div style={st.body}>

        {/* Overall attendance card */}
        {records.length > 0 && (
          <div style={{ ...st.card, borderTop: `3px solid ${pctColor(ovPct)}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <TrendingUp size={16} style={{ color: pctColor(ovPct) }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                Overall Attendance — All {allMonths.length} Month{allMonths.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 52, fontWeight: 800, color: pctColor(ovPct), lineHeight: 1 }}>{ovPct}%</div>
              <div>
                <div style={{ height: 12, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${Math.min(ovPct, 100)}%`, background: pctColor(ovPct), borderRadius: 99 }} />
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6b7280", flexWrap: "wrap" }}>
                  <span>Attended: <strong style={{ color: "#111827" }}>{ovAtt}</strong></span>
                  <span>Total: <strong style={{ color: "#111827" }}>{ovTot}</strong></span>
                  <span>Missed: <strong style={{ color: "#ef4444" }}>{ovTot - ovAtt}</strong></span>
                </div>
              </div>
              <div style={{ padding: "10px 18px", borderRadius: 10, background: pctBg(ovPct), border: `1px solid ${pctBorder(ovPct)}`, fontSize: 13, fontWeight: 700, color: pctColor(ovPct), textAlign: "center", whiteSpace: "nowrap" }}>
                {ovPct >= 75 ? "✓ Safe" : ovPct >= 60 ? "⚠ At Risk" : "✗ Critical"}
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(subjectTotals).map(([subj, c]) => {
                const p = c.total > 0 ? Math.round((c.attended / c.total) * 100) : 0;
                return (
                  <div key={subj} style={{ padding: "5px 12px", borderRadius: 8, background: pctBg(p), border: `1px solid ${pctBorder(p)}`, fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: "#111827" }}>{subj}</span>
                    <span style={{ marginLeft: 8, fontWeight: 700, color: pctColor(p) }}>{p}%</span>
                    <span style={{ marginLeft: 6, color: "#9ca3af" }}>{c.attended}/{c.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Month selector */}
        <div style={st.card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Select Month
          </div>
          {allMonths.length === 0 ? (
            <div style={{ fontSize: 13, color: "#9ca3af" }}>No months available yet</div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {allMonths.map(m => (
                <button key={m} style={st.monthBtn(selMonth === m)} onClick={() => setSelMonth(m)}>
                  {formatMonth(m)}{m === currentMonthKey() ? " ●" : ""}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Month stats */}
        {allMonths.length > 0 && (
          <div style={st.statGrid}>
            {[
              { label: "This Month", value: mPct + "%", color: pctColor(mPct), accent: pctColor(mPct), sub: `${mAttended} / ${mTotal} classes` },
              { label: "On Track",   value: onTrack,    color: "#16a34a",      accent: "#16a34a",      sub: "≥ 75% subjects" },
              { label: "At Risk",    value: atRisk,     color: "#f59e0b",      accent: "#f59e0b",      sub: "60–74% subjects" },
              { label: "Critical",   value: critical,   color: "#ef4444",      accent: "#ef4444",      sub: "< 60% subjects" },
            ].map(({ label, value, color, accent, sub }) => (
              <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", border: "1px solid #eaecf0", borderTop: `3px solid ${accent}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Subject cards with predictor */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={15} style={{ color: "#2563eb" }} />
            {formatMonth(selMonth)} — Subject-wise
          </div>
          {curRecs.length === 0 ? (
            <div style={{ ...st.card, textAlign: "center", padding: "40px", color: "#9ca3af" }}>
              No records for {formatMonth(selMonth)}
            </div>
          ) : (
            <div style={st.subGrid}>
              {curRecs.map((r, i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid ${pctBorder(r.percentage)}`, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{r.subject}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: pctColor(r.percentage), background: pctBg(r.percentage), border: `1px solid ${pctBorder(r.percentage)}`, padding: "3px 12px", borderRadius: 99 }}>
                      {r.percentage}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${Math.min(r.percentage, 100)}%`, background: pctColor(r.percentage), borderRadius: 99 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
                    <span>Attended: <strong style={{ color: "#111827" }}>{r.attendedClasses}</strong></span>
                    <span>Total: <strong style={{ color: "#111827" }}>{r.totalClasses}</strong></span>
                    <span>Missed: <strong style={{ color: "#ef4444" }}>{r.totalClasses - r.attendedClasses}</strong></span>
                  </div>
                  <PredictorCard attended={r.attendedClasses} total={r.totalClasses} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* No records at all */}
        {records.length === 0 && (
          <div style={{ ...st.card, textAlign: "center", padding: "64px" }}>
            <BookOpen size={36} style={{ color: "#e5e7eb", margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>No attendance records yet</div>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>Your attendance will appear once your lecturer marks it</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Roll No: <strong>{rollNo}</strong></div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;