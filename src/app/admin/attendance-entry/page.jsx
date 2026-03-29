import AttendanceEntry from "@/components/lecturer/AttendanceEntry";

export default function AdminAttendancePage() {
  // In a real app, this data comes from your Auth Session (e.g., NextAuth)
  // This represents the Staff/Lecturer currently using the system
  const staffSession = {
    name: "Staff Member",
    branch: "CSE",           // <--- This is the Staff's Branch
    academicYear: "Year 1",   // <--- This is the Staff's Assigned Year
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black uppercase italic text-slate-800">
            Staff Attendance Portal
          </h1>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Logged in as: {staffSession.branch} Instructor ({staffSession.academicYear})
          </p>
        </div>

        {/* We pass the staffSession as the 'user' prop */}
        <AttendanceEntry user={staffSession} />
      </div>
    </main>
  );
}