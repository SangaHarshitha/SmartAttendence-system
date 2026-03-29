import React, { useState } from "react";
import {
  Calculator,
  PieChart,
  ShieldCheck,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const AttendanceCalculator = ({ currentAttended = 0, currentTotal = 0 }) => {
  const [futureHours, setFutureHours] = useState(5);

  const safeDivide = (a, b) => (b === 0 ? 0 : (a / b) * 100);

  const currentPercent = safeDivide(currentAttended, currentTotal).toFixed(1);

  const projectedAttended = currentAttended + futureHours;
  const projectedTotal = currentTotal + futureHours;
  const projectedPercent = safeDivide(
    projectedAttended,
    projectedTotal
  ).toFixed(1);

  const percentChange = (projectedPercent - currentPercent).toFixed(1);

  const missedPercent = safeDivide(
    currentAttended,
    currentTotal + futureHours
  ).toFixed(1);

  const buffer75 =
    currentPercent >= 75
      ? Math.floor((currentAttended - 0.75 * currentTotal) / 0.75)
      : 0;

  const isSafe = currentPercent >= 75;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex gap-2 items-center">
          <Calculator size={18} /> What-If Calculator
        </h3>

        <input
          type="range"
          min="1"
          max="150"
          value={futureHours}
          onChange={(e) => setFutureHours(parseInt(e.target.value))}
          className="w-full"
        />

        <div className="mt-4 text-xl font-bold">
          New Percentage: {projectedPercent}%
        </div>

        <div
          className={`text-sm font-bold flex items-center gap-1 ${
            percentChange >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {percentChange > 0 ? "+" : ""}
          {percentChange}%
          {percentChange >= 0 ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex gap-2 items-center">
          <PieChart size={18} /> Insights
        </h3>

        {isSafe ? (
          <div className="text-green-600 font-semibold flex gap-2 items-center">
            <ShieldCheck size={18} />
            You can miss {buffer75} hours safely
          </div>
        ) : (
          <div className="text-red-600 font-semibold flex gap-2 items-center">
            <AlertTriangle size={18} />
            No buffer left
          </div>
        )}

        <div className="mt-3 text-sm">
          If you miss next {futureHours} hours → {missedPercent}%
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalculator;