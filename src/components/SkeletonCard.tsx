import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-card animate-pulse">
      <div>
        {/* Skeleton Image */}
        <div className="w-full h-44 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />

        {/* Title & Badge */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex-1">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-2" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
          </div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-14 shrink-0" />
        </div>

        {/* Text paragraph */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
