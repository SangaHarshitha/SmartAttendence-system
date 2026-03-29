import React from "react";
import RiskBadge from "../../common/RiskBadge";

const PredictionCard = ({ subject, attended = 0, total = 0 }) => {
  const percent =
    total === 0 ? 0 : ((attended / total) * 100).toFixed(1);

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <h4 className="font-bold">{subject}</h4>
      <p>
        {attended}/{total} Hours
      </p>
      <div className="text-xl font-bold">{percent}%</div>
      <RiskBadge percent={percent} />
    </div>
  );
};

export default PredictionCard;