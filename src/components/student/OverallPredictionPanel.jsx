"use client";
import React from "react";
import { ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";

const OverallPredictionPanel = ({ totalAttended = 0, totalConducted = 0 }) => {
  const percent = totalConducted === 0
    ? 0
    : ((totalAttended / totalConducted) * 100).toFixed(1);

  // How many more classes needed to reach 75%
  const hoursNeededFor75 = percent < 75 && totalConducted > 0
    ? Math.ceil((0.75 * totalConducted - totalAttended) / 0.25)
    : 0;

  // How many can be missed while staying above 75%
  const canMiss = percent >= 75
    ? Math.floor((totalAttended - 0.75 * totalConducted) / 0.75)
    : 0;

  const isSafe = parseFloat(percent) >= 75;
  const isWarning = parseFloat(percent) >= 60 && parseFloat(percent) < 75;

  return (
    <div className={`rounded-xl p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
      isSafe
        ? "bg-green-50 border border-green-200"
        : isWarning
        ? "bg-yellow-50 border border-yellow-200"
        : "bg-red-50 border border-red-200"
    }`}>

      <div className="flex items-center gap-3">
        {isSafe
          ? <ShieldCheck size={28} className="text-green-600" />
          : <AlertTriangle size={28} className={isWarning ? "text-yellow-600" : "text-red-600"} />
        }
        <div>
          <div className={`text-2xl font-black ${
            isSafe ? "text-green-700" : isWarning ? "text-yellow-700" : "text-red-700"
          }`}>
            {percent}%
          </div>
          <div className={`text-sm font-medium ${
            isSafe ? "text-green-600" : isWarning ? "text-yellow-600" : "text-red-600"
          }`}>
            {isSafe
              ? "You're in the Safe Zone 🎉"
              : isWarning
              ? "Warning — Attendance dropping"
              : "Danger — Below minimum threshold"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div className="text-center">
          <div className="font-bold text-slate-700 text-lg">{totalAttended}</div>
          <div className="text-slate-500 text-xs">Attended</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-slate-700 text-lg">{totalConducted}</div>
          <div className="text-slate-500 text-xs">Total</div>
        </div>
        <div className="text-center">
          {isSafe ? (
            <>
              <div className="font-bold text-green-600 text-lg">{canMiss}</div>
              <div className="text-slate-500 text-xs">Can Miss</div>
            </>
          ) : (
            <>
              <div className="font-bold text-red-600 text-lg">{hoursNeededFor75}</div>
              <div className="text-slate-500 text-xs">Need to Attend</div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full md:w-48">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progress</span>
          <span>75% target</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all ${
              isSafe ? "bg-green-500" : isWarning ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
          {/* 75% marker */}
          <div className="absolute top-0 h-full w-0.5 bg-slate-600 opacity-50" style={{ left: "75%" }} />
        </div>
      </div>
    </div>
  );
};

export default OverallPredictionPanel;
