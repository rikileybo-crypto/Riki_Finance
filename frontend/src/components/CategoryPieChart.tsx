import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../lib/utils';

interface PieEntry {
  name: string;
  value: number;
  color: string;
}

interface CategoryPieChartProps {
  data: PieEntry[];
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#06b6d4', '#ec4899'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm">
        <p className="text-slate-300 font-medium">{entry.name}</p>
        <p style={{ color: entry.payload.color }}>{formatCurrency(entry.value)}</p>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        אין נתונים להצגה
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={entry.color || COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value, entry: any) => (
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>
              {value} — {formatCurrency(entry.payload.value)}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
