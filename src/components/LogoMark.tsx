import React from 'react';
import { cn } from '@/lib/utils';
import { Stethoscope } from 'lucide-react';

export default function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center', className)}>
      <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
    </div>
  );
}
