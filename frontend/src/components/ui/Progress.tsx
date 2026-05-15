import React from 'react';
import * as RadixProgress from '@radix-ui/react-progress';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof RadixProgress.Root> {
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => (
    <RadixProgress.Root
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-700', className)}
      value={value}
      {...props}
    >
      <RadixProgress.Indicator
        className={cn('h-full w-full flex-1 bg-indigo-500 transition-all duration-500', indicatorClassName)}
        style={{ transform: `translateX(${100 - (value ?? 0)}%)` }}
      />
    </RadixProgress.Root>
  )
);
Progress.displayName = 'Progress';
