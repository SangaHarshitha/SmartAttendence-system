"use client";
import React from "react";
import RiskBadge from "../common/RiskBadge";
import { TrendingUp } from "lucide-react";

const PredictionCard = ({
  subject,
  attended = 0,
  total = 0,
  mid1, mid2, sem, assign,
  hasMarks = false,
}) => {
  const percent = total === 0 ? 0 : ((attended / total) * 100).toFixed(1);

  // Quick marks summary for preview
  const examTypes = [
    { key: "Mid-1",      data: mid1,   max: 30  },
    { key: "Mid-2",      data: mid2,   max: 30  },
    { key: "Sem",        data: sem,    max: 60  },
    { key: "Assign",     data: assign, max: 10  },
  ];
  const enteredMarks = examTypes.filter((e) => e.data?.marks != null);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-300 transition-all group">
      {/* Top */}
      <div className="p-5">
        <h4 className="font-bold text-slate-800 text-base mb-3 truncate" title={subject}>
          {subject}
        </h4>

        {/* Attendance bar */}
        {total > 0 ? (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{attended}/{total} hrs</span>
              <span className="font-semibold text-slate-700">{percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percent >= 75 ? "bg-green-500" : percent >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <div className="mt-2">
              <RiskBadge percent={percent} />
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 mb-3">No attendance data</div>
        )}

        {/* Marks preview pills */}
        {enteredMarks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {enteredMarks.map(({ key, data, max }) => (
              <span
                key={key}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  (data.marks / (data.maxMarks || max)) >= 0.6
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {key}: {data.marks}/{data.maxMarks || max}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Click to view marks hint */}
      <div className={`px-5 py-2.5 border-t text-xs font-medium flex items-center gap-1.5 transition-colors ${
        hasMarks
          ? "border-blue-100 bg-blue-50 text-blue-600 group-hover:bg-blue-100"
          : "border-slate-100 bg-slate-50 text-slate-400"
      }`}>
        <TrendingUp size={12} />
        {hasMarks ? "Click to view full marks" : "No marks recorded yet"}
      </div>
    </div>
  );
};

export default PredictionCard;