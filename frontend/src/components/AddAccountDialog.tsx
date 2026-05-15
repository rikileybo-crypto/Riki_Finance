import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/Select';
import { useAddAccount } from '../hooks/useAccounts';

const schema = z.object({
  type: z.enum(['leumi', 'max']),
  name: z.string().min(1, 'שם החשבון נדרש'),
  id_or_user: z.string().min(1, 'שדה זה נדרש'),
  password: z.string().min(1, 'סיסמה נדרשת'),
  card_six_digits: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCOUNT_NAMES: Record<string, string> = {
  leumi: 'לאומי ראשי',
  max: 'MAX כרטיס אשראי',
};

const ACCOUNT_COLORS: Record<string, string> = {
  leumi: '#3b82f6',
  max: '#f59e0b',
};

export const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ open, onOpenChange }) => {
  const addAccount = useAddAccount();
  const [selectedType, setSelectedType] = useState<'leumi' | 'max'>('leumi');

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'leumi', name: ACCOUNT_NAMES['leumi'] },
  });

  const onTypeChange = (val: string) => {
    const t = val as 'leumi' | 'max';
    setSelectedType(t);
    setValue('type', t);
    setValue('name', ACCOUNT_NAMES[t]);
  };

  const onSubmit = async (data: FormValues) => {
    const credentials: Record<string, string> = {
      id: data.id_or_user,
      password: data.password,
    };
    if (data.type === 'max' && data.card_six_digits) {
      credentials.card6Digits = data.card_six_digits;
    }

    await addAccount.mutateAsync({
      name: data.name,
      type: data.type,
      color: ACCOUNT_COLORS[data.type],
      credentials,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוספת חשבון בנק</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>סוג חשבון</Label>
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leumi">🏦 בנק לאומי</SelectItem>
                <SelectItem value="max">💳 MAX כרטיס אשראי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>שם החשבון (כינוי)</Label>
            <Input {...register('name')} placeholder="לדוג': לאומי ראשי" />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{selectedType === 'max' ? 'מספר תעודת זהות' : 'מספר משתמש / תעודת זהות'}</Label>
            <Input {...register('id_or_user')} placeholder="000000000" />
            {errors.id_or_user && <p className="text-xs text-red-400">{errors.id_or_user.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>סיסמה</Label>
            <Input {...register('password')} type="password" placeholder="••••••••" />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {selectedType === 'max' && (
            <div className="flex flex-col gap-1.5">
              <Label>6 ספרות אחרונות של הכרטיס (אופציונלי)</Label>
              <Input {...register('card_six_digits')} placeholder="123456" maxLength={6} />
            </div>
          )}

          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-900/20 border border-amber-700/30">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-300 leading-relaxed">
              הפרטים שלך מוצפנים ב-AES-256 לפני שמירה. הפרטים אינם נשמרים כטקסט גלוי בשום מקום במערכת.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" loading={addAccount.isPending}>
              הוסף חשבון
            </Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
