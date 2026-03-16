import React from "react";

const CustomLegend = ({ payload }) => {
  if (!payload || payload.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color || entry.payload?.fill }}
          ></div>
          <span
            className="text-xs font-semibold"
            style={{ color: entry.color || entry.payload?.fill }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CustomLegend;
