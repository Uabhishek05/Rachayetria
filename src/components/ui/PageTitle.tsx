import { motion } from 'framer-motion';

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='mb-6'
    >
      <h1 className='text-2xl font-bold text-darkPurple md:text-3xl dark:text-slate-100'>{title}</h1>
      {subtitle ? <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>{subtitle}</p> : null}
    </motion.div>
  );
}
