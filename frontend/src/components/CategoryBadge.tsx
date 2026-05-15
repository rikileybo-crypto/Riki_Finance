import React from 'react';

interface CategoryBadgeProps {
  category?: string;
  color?: string;
  onClick?: () => void;
}

const DEFAULT_COLORS: Record<string, string> = {
  מזון: '#22c55e',
  קניות: '#f59e0b',
  תחבורה: '#3b82f6',
  בידור: '#a855f7',
  בריאות: '#ef4444',
  חינוך: '#06b6d4',
  שירותים: '#64748b',
  אחר: '#94a3b8',
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, color, onClick }) => {
  if (!category) {
    return (
      <span
        onClick={onClick}
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-700 text-slate-400 border border-dashed border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors"
      >
        ללא קטגוריה
      </span>
    );
  }

  const bg = color || DEFAULT_COLORS[category] || '#6366f1';

  return (
    <span
      onClick={onClick}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
      style={{ backgroundColor: `${bg}20`, color: bg, border: `1px solid ${bg}30` }}
    >
      {category}
    </span>
  );
};
