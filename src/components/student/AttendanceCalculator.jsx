"use client";
import React, { useState } from "react";
import {
  Calculator, ShieldCheck, AlertTriangle,
  TrendingUp, TrendingDown, Target,
} from "lucide-react";

const AttendanceCalculator = ({ currentAttended = 0, currentTotal = 0 }) => {
  const [futureAttend, setFutureAttend] = useState(5);
  const [futureMiss,   setFutureMiss]   = useState(0);

  const safeDivide = (a, b) => (b === 0 ? 0 : (a / b) * 100);

  const currentPercent = safeDivide(currentAttended, currentTotal);

  // Scenario: attend X out of next Y (futureAttend + futureMiss)
  const futureTotal     = futureAttend + futureMiss;
  const projAttended    = currentAttended + futureAttend;
  const projTotal       = currentTotal + futureTotal;
  const projPercent     = safeDivide(projAttended, projTotal);
  const percentChange   = (projPercent - currentPercent).toFixed(1);

  // Classes needed to reach exactly 75%
  const hoursTo75 = currentPercent < 75 && currentTotal > 0
    ? Math.ceil((0.75 * currentTotal - currentAttended) / 0.25)
    : 0;

  // Safe-miss buffer
  const canMiss = currentPercent >= 75
    ? Math.floor((currentAttended - 0.75 * currentTotal) / 0.75)
    : 0;

  const isSafe = currentPercent >= 75;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
        <Calculator size={18} className="text-blue-500" /> What-If Calculator
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left — sliders */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Classes I'll attend</span>
              <span className="font-bold text-green-600">{futureAttend}</span>
            </div>
            <input
              type="range" min="0" max="100" value={futureAttend}
              onChange={(e) => setFutureAttend(parseInt(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Classes I'll miss</span>
              <span className="font-bold text-red-500">{futureMiss}</span>
            </div>
            <input
              type="range" min="0" max="100" value={futureMiss}
              onChange={(e) => setFutureMiss(parseInt(e.target.value))}
              className="w-full accent-red-400"
            />
          </div>

          {/* Projected result */}
          <div className={`rounded-xl p-4 ${
            projPercent >= 75 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <div className="text-xs text-slate-500 mb-1">Projected Attendance</div>
            <div className={`text-3xl font-black ${projPercent >= 75 ? "text-green-700" : "text-red-600"}`}>
              {projPercent.toFixed(1)}%
            </div>
            <div className={`text-sm font-semibold flex items-center gap-1 mt-1 ${
              percentChange >= 0 ? "text-green-600" : "text-red-500"
            }`}>
              {percentChange > 0 ? "+" : ""}{percentChange}%
              {percentChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {" "}from current
            </div>
          </div>
        </div>

        {/* Right — insights */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
              <Target size={12} /> Current Status
            </div>
            <div className="text-2xl font-black text-slate-800">{currentPercent.toFixed(1)}%</div>
            <div className="text-sm text-slate-500">
              {currentAttended} attended / {currentTotal} total
            </div>
          </div>

          {isSafe ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-1">
                <ShieldCheck size={16} /> Safe Zone
              </div>
              <div className="text-green-800 text-sm">
                You can miss <span className="font-black text-lg">{canMiss}</span> more classes and stay above 75%
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-1">
                <AlertTriangle size={16} /> Needs Improvement
              </div>
              <div className="text-red-800 text-sm">
                Attend <span className="font-black text-lg">{hoursTo75}</span> consecutive classes to reach 75%
              </div>
            </div>
          )}

          {/* Progress bar toward 75% */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress to 75% target</span>
              <span>{currentPercent.toFixed(1)}% / 75%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all ${
                  isSafe ? "bg-green-500" : currentPercent >= 60 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min((currentPercent / 75) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalculator;
