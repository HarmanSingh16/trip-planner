import { useMemo, useContext } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CurrencyContext } from "../context/CurrencyContext";

const CATEGORY_COLORS = {
  food: "#f59e0b",
  transport: "#3b82f6",
  stay: "#8b5cf6",
  activity: "#10b981",
  accommodation: "#8b5cf6",
  misc: "#6b7280",
};

const CATEGORY_LABELS = {
  food: "Food & Dining",
  transport: "Transport",
  stay: "Accommodation",
  activity: "Activities",
  accommodation: "Accommodation",
  misc: "Miscellaneous",
};

export default function BudgetChart({ categoryBreakdown, tripCurrency }) {
  const { formatCurrency, convert } = useContext(CurrencyContext);

  const data = useMemo(() => {
    return categoryBreakdown.map((item) => ({
      name: CATEGORY_LABELS[item.name] || item.name,
      value: convert(item.value, tripCurrency || "USD"),
      color: CATEGORY_COLORS[item.name] || "#6b7280",
    }));
  }, [categoryBreakdown, convert, tripCurrency]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{entry.name}</p>
          <p className="chart-tooltip-value">{formatCurrency(entry.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <div className="chart-empty" id="budget-chart-empty">
        <p>No expenses yet — add some to see the breakdown!</p>
      </div>
    );
  }

  return (
    <div className="budget-chart" id="budget-chart">
      <h3 className="chart-title">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
