import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HEBREW_MONTHS } from '../lib/utils';

interface MonthData {
  month: string;
  הכנסות: number;
  הוצאות: number;
}

interface SpendingBarChartProps {
  data: MonthData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm">
        <p className="text-slate-300 font-medium mb-2">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: ₪{entry.value.toLocaleString('he-IL')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SpendingBarChart: React.FC<SpendingBarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ color: '#94a3b8', fontSize: '13px' }}
        />
        <Bar dataKey="הכנסות" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="הוצאות" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export function buildMonthlyData(transactions: any[], monthCount = 6): MonthData[] {
  const now = new Date();
  const months: MonthData[] = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = HEBREW_MONTHS[d.getMonth()];

    const monthTxns = transactions.filter((tx: any) => tx.date.startsWith(monthKey));
    const income = monthTxns.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
    const expenses = monthTxns.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

    months.push({ month: label, הכנסות: income, הוצאות: expenses });
  }

  return months;
}
