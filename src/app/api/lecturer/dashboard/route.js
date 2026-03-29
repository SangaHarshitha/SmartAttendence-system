import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MonthlyAttendance from "@/models/MonthlyAttendance";

export async function GET(request) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const branch  = searchParams.get("branch");
    const year    = searchParams.get("year");
    const section = searchParams.get("section");
    const subject = searchParams.get("subject");
    const month   = searchParams.get("month"); // e.g. "2026-03"

    // Build filter — only apply params that were passed
    const filter = {};
    if (branch  && branch  !== "all") filter.branch  = branch;
    if (year    && year    !== "all") filter.year    = year;
    if (section && section !== "all") filter.section = section;
    if (subject && subject !== "all") filter.subject = subject;
    if (month   && month   !== "all") filter.month   = month;

    const records = await MonthlyAttendance.find(filter).lean();

    // ── Per-student aggregation ──
    // Group by rollNo → subject → months
    const studentMap = {};
    for (const r of records) {
      const key = r.rollNo;
      if (!studentMap[key]) {
        studentMap[key] = {
          rollNo:    r.rollNo,
          name:      r.name,
          branch:    r.branch,
          year:      r.year,
          section:   r.section,
          subjects:  {},
          months:    {},
        };
      }

      // Per-subject totals
      if (!studentMap[key].subjects[r.subject]) {
        studentMap[key].subjects[r.subject] = { attended: 0, total: 0 };
      }
      studentMap[key].subjects[r.subject].attended += r.attendedClasses;
      studentMap[key].subjects[r.subject].total    += r.totalClasses;

      // Per-month totals (for trend chart)
      if (!studentMap[key].months[r.month]) {
        studentMap[key].months[r.month] = { attended: 0, total: 0 };
      }
      studentMap[key].months[r.month].attended += r.attendedClasses;
      studentMap[key].months[r.month].total    += r.totalClasses;
    }

    // Build final student list
    const students = Object.values(studentMap).map((s) => {
      // Per-subject percentages
      const subjectPcts = {};
      for (const [subj, c] of Object.entries(s.subjects)) {
        subjectPcts[subj] = c.total > 0
          ? Math.round((c.attended / c.total) * 100)
          : 0;
      }

      // Overall percentage across all subjects
      const allVals = Object.values(subjectPcts);
      const overall = allVals.length > 0
        ? Math.round(allVals.reduce((a, b) => a + b, 0) / allVals.length)
        : 0;

      // Monthly trend (sorted by month string "2026-01", "2026-02" etc.)
      const monthTrend = Object.entries(s.months)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([m, c]) => ({
          month: m,
          pct:   c.total > 0 ? Math.round((c.attended / c.total) * 100) : 0,
          attended: c.attended,
          total:    c.total,
        }));

      // Trend direction: compare last two months
      const trendDir =
        monthTrend.length >= 2
          ? monthTrend[monthTrend.length - 1].pct - monthTrend[monthTrend.length - 2].pct
          : 0;

      return {
        rollNo:     s.rollNo,
        name:       s.name,
        branch:     s.branch,
        year:       s.year,
        section:    s.section,
        subjects:   subjectPcts,
        overall,
        monthTrend,
        trendDir,
      };
    });

    // ── Summary stats ──
    const total    = students.length;
    const onTrack  = students.filter((s) => s.overall >= 75).length;
    const atRisk   = students.filter((s) => s.overall >= 60 && s.overall < 75).length;
    const critical = students.filter((s) => s.overall  < 60).length;
    const avgPct   = total > 0
      ? Math.round(students.reduce((a, s) => a + s.overall, 0) / total)
      : 0;

    // ── Class-wide monthly trend (average across all students per month) ──
    const allMonthMap = {};
    for (const s of students) {
      for (const m of s.monthTrend) {
        if (!allMonthMap[m.month]) allMonthMap[m.month] = { attended: 0, total: 0 };
        allMonthMap[m.month].attended += m.attended;
        allMonthMap[m.month].total    += m.total;
      }
    }
    const classTrend = Object.entries(allMonthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, c]) => ({
        month,
        pct: c.total > 0 ? Math.round((c.attended / c.total) * 100) : 0,
      }));

    // ── Unique months and subjects available in this filter ──
    const monthList   = [...new Set(records.map((r) => r.month))].sort();
    const subjectList = [...new Set(records.map((r) => r.subject))].sort();

    return NextResponse.json({
      students,
      stats:      { total, onTrack, atRisk, critical, avgPct },
      classTrend,
      monthList,
      subjectList,
    });
  } catch (error) {
    console.error("Lecturer dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}