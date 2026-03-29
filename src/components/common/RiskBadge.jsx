import React from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const RiskBadge = ({ percent }) => {
  if (percent >= 75)
    return (
      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs flex items-center gap-1">
        <CheckCircle size={12} /> Safe
      </span>
    );

  if (percent >= 65)
    return (
      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs flex items-center gap-1">
        <AlertTriangle size={12} /> Warning
      </span>
    );

  return (
    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs flex items-center gap-1">
      <XCircle size={12} /> Critical
    </span>
  );
};

export default RiskBadge;