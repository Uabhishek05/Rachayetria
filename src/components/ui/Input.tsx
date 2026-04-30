import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-gray-700 outline-none ring-primary/30 placeholder:text-gray-400 transition focus:ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500',
        props.className,
      )}
    />
  );
}
