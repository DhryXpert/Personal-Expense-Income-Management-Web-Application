import React from "react";
import CustomTooltip from "./CustomTooltip";
import CustomLegend from "./CustomLegend";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CustomPieChart = ({
  data,
  label,
  totalAmount,
  colors,
  showTextAnchor,
}) => {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <PieChart margin={{ top: 55, bottom: 20 }}>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={110}
          innerRadius={80}
          labelLine={false}
          paddingAngle={5}
          cornerRadius={10}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={CustomTooltip} />
        <Legend content={<CustomLegend/>}  verticalAlign="bottom" align="center" />

        {showTextAnchor && (
          <>
            <text
              x="50%"
              y="50%"
              dy={-10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#666"
              fontSize="14px"
            >
              {label}
            </text>
            <text
              x="50%"
              y="50%"
              dy={15}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#1A1B1D"
              fontSize="24px"
              fontWeight="700"
            >
              {totalAmount}
            </text>
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
