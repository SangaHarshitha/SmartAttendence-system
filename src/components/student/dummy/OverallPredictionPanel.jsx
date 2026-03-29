import React from "react";

const OverallPredictionPanel = ({
  totalAttended = 0,
  totalConducted = 0,
}) => {
  const percent =
    totalConducted === 0
      ? 0
      : ((totalAttended / totalConducted) * 100).toFixed(1);

  if (percent >= 75) {
    return (
      <div className="bg-green-600 text-white p-6 rounded-xl mb-6">
        ✅ You are in Safe Zone ({percent}%)
      </div>
    );
  }

  return (
    <div className="bg-slate-800 text-white p-6 rounded-xl mb-6">
      ⚠ You need to improve attendance (Current: {percent}%)
    </div>
  );
};

export default OverallPredictionPanel;