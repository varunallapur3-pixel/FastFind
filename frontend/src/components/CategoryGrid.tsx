import React from 'react';
import { CATEGORIES } from '../data/mockPlaces';
import { CategoryId } from '../types';
import { Star } from 'lucide-react';

interface CategoryGridProps {
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  onAutoNavigateCategory: (id: CategoryId) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onSelectCategory,
  onAutoNavigateCategory,
}) => {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-xs text-[#b9cacb] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00dbe9] animate-pulse" />
          <span>INSTANT CATEGORY NODES (CLICK FOR TOP-RATED MATCH)</span>
        </h2>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-mono text-[#00dbe9] hover:underline"
          >
            RESET ALL
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onAutoNavigateCategory(cat.id);
              }}
              className={`glass-card relative flex flex-col justify-between p-4 h-32 rounded-xl group cursor-pointer border transition-all duration-300 ${
                isSelected
                  ? 'border-[#00dbe9] bg-[#00dbe9]/10 shadow-[0_0_20px_rgba(0,219,233,0.3)] scale-[1.02]'
                  : 'border-white/10 hover:border-[#00dbe9]/60 hover:bg-white/5'
              }`}
            >
              {/* Top Row Icon */}
              <div className="flex items-center justify-between">
                <span className={`material-symbols-outlined text-2xl ${cat.iconColor} group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </span>

                <div className="flex items-center text-[10px] font-mono text-[#a9f900] bg-[#a9f900]/10 px-1.5 py-0.5 rounded border border-[#a9f900]/30 opacity-80 group-hover:opacity-100">
                  <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                  <span>TOP</span>
                </div>
              </div>

              {/* Bottom Label */}
              <div>
                <span className="font-mono text-xs font-bold tracking-widest text-[#e5e2e1] group-hover:text-[#00dbe9] block transition-colors">
                  {cat.label}
                </span>
                <span className="text-[10px] font-mono text-[#849495] line-clamp-1 mt-0.5">
                  {cat.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
