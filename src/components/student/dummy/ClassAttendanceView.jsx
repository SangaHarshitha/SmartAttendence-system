import React, { useState } from "react";
import RiskBadge from "../../common/RiskBadge";

const ClassAttendanceView = ({
  currentUser,
  allStudents,
  attendanceData,
}) => {
  const [filterMode, setFilterMode] = useState("all");

  const classmates = allStudents.filter(
    (s) => s.branch === currentUser.branch && s.year === currentUser.year
  );

  const calculatePercent = (studentId) => {
    const records = attendanceData.filter(
      (r) => r.studentId === studentId
    );
    const total = records.reduce((a, b) => a + b.totalHours, 0);
    const attended = records.reduce((a, b) => a + b.attendedHours, 0);
    return total === 0 ? 0 : ((attended / total) * 100).toFixed(1);
  };

  const classmatesWithStats = classmates.map((s) => ({
    ...s,
    percentage: calculatePercent(s._id),
  }));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {currentUser.branch} Year {currentUser.year}
      </h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-slate-200">
            <th>Name</th>
            <th>Roll</th>
            <th>%</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {classmatesWithStats.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.rollNo}</td>
              <td>{s.percentage}%</td>
              <td>
                <RiskBadge percent={s.percentage} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassAttendanceView;