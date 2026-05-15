import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להיות לפחות 6 תווים'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    setLoading(false);
    if (error) { toast.error(error.message === 'Invalid login credentials' ? 'אימייל או סיסמה שגויים' : error.message); }
    else { navigate('/'); }
  };

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-brand-700 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl">💰</div>
          <span className="text-white font-bold text-lg">Riki Finance</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">שליטה מלאה<br/>על הכלכלה שלך</h2>
          <p className="text-brand-200 text-sm leading-relaxed">חיבור אוטומטי לחשבון הבנק, פילוח הוצאות חכם ותקציב חודשי — הכל במקום אחד.</p>
        </div>
        <p className="text-brand-300 text-xs">© 2025 Riki Finance</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-700 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">💰</div>
            <h1 className="text-2xl font-bold text-gray-800">כניסה לחשבון</h1>
            <p className="text-gray-400 text-sm mt-1">Riki Finance</p>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">אימייל</label>
                <input type="email" {...register('email')} placeholder="you@example.com" dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50 transition" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">סיסמה</label>
                <input type="password" {...register('password')} placeholder="••••••••" dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50 transition" />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-brand-700 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1 disabled:opacity-60">
                {loading && <Loader2 size={16} className="animate-spin" />}כניסה
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
