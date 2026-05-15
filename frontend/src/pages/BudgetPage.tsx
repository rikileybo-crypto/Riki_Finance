import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { BudgetProgress } from '../components/BudgetProgress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { Skeleton } from '../components/ui/Skeleton';
import { useBudgetCategories, useBudgetSummary, useSaveBudgetCategory, useDeleteBudgetCategory } from '../hooks/useBudget';
import { formatCurrency, HEBREW_MONTHS } from '../lib/utils';
import type { BudgetCategory } from '../types';

const PRESET_COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
  '#3b82f6', '#a855f7', '#06b6d4', '#ec4899',
  '#64748b', '#f97316',
];

interface CategoryForm {
  name: string;
  monthly_limit: string;
  keywords: string;
  color: string;
}

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetCategory | null>(null);

  const { data: categories = [], isLoading: catLoading } = useBudgetCategories();
  const { data: summaryData, isLoading: sumLoading } = useBudgetSummary(month, year);
  const save = useSaveBudgetCategory();
  const deleteCategory = useDeleteBudgetCategory();

  const { register, handleSubmit, setValue, watch, reset } = useForm<CategoryForm>({
    defaultValues: { name: '', monthly_limit: '', keywords: '', color: PRESET_COLORS[0] },
  });

  const selectedColor = watch('color');

  const openAdd = () => {
    reset({ name: '', monthly_limit: '', keywords: '', color: PRESET_COLORS[0] });
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: BudgetCategory) => {
    reset({
      name: cat.name,
      monthly_limit: cat.monthly_limit ? String(cat.monthly_limit) : '',
      keywords: (cat.keywords || []).join(', '),
      color: cat.color || PRESET_COLORS[0],
    });
    setEditing(cat);
    setDialogOpen(true);
  };

  const onSubmit = async (data: CategoryForm) => {
    await save.mutateAsync({
      id: editing?.id,
      name: data.name,
      color: data.color,
      monthly_limit: data.monthly_limit ? parseFloat(data.monthly_limit) : undefined,
      keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
    });
    setDialogOpen(false);
  };

  const summary = summaryData?.summary || [];
  const totalSpent = summary.reduce((s, i) => s + i.spent, 0);
  const totalBudget = summary.reduce((s, i) => s + i.limit, 0);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">תקציב</h1>
        <Button onClick={openAdd}>
          <Plus size={16} />
          הוסף קטגוריה
        </Button>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-slate-800 rounded-xl border border-slate-700 w-fit">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="bg-transparent text-slate-200 text-sm focus:outline-none"
        >
          {HEBREW_MONTHS.map((m, i) => (
            <option key={i} value={i + 1} className="bg-slate-800">{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="bg-transparent text-slate-200 text-sm focus:outline-none"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y} className="bg-slate-800">{y}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      {totalBudget > 0 && (
        <div className="mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">סה"כ הוצאות</span>
            <span className="text-slate-200 font-semibold">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalSpent > totalBudget ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {catLoading || sumLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">אין קטגוריות תקציב</h3>
          <p className="text-slate-400 mb-6">הוסף קטגוריות כדי לעקוב אחרי ההוצאות שלך</p>
          <Button onClick={openAdd}>
            <Plus size={16} />
            הוסף קטגוריה
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const sum = summary.find((s) => s.category.id === cat.id) || {
              category: cat, spent: 0, limit: cat.monthly_limit || 0, pct: 0,
            };
            return (
              <div key={cat.id} className="relative group">
                <BudgetProgress summary={sum} />
                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-md bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteCategory.mutate(cat.id)}
                    className="p-1.5 rounded-md bg-slate-700 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'עריכת קטגוריה' : 'הוספת קטגוריה'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>שם קטגוריה</Label>
              <Input {...register('name', { required: true })} placeholder="לדוג': מזון, תחבורה..." />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>תקציב חודשי (₪)</Label>
              <Input {...register('monthly_limit')} type="number" placeholder="0" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>צבע</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue('color', c)}
                    className={`w-7 h-7 rounded-full transition-transform ${selectedColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-800' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>מילות מפתח (לסיווג אוטומטי, מופרדות בפסיק)</Label>
              <Input {...register('keywords')} placeholder="סופרמרקט, מכולת, שוק..." />
            </div>

            <DialogFooter>
              <Button type="submit" loading={save.isPending}>
                {editing ? 'שמור שינויים' : 'הוסף קטגוריה'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                ביטול
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
