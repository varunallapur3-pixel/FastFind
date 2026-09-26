import React, { useState } from 'react';
import { CATEGORIES } from '../data/mockPlaces';
import { CategoryId } from '../types';
import {
  Compass,
  Smile,
  Coffee,
  Utensils,
  Cross,
  Pill,
  ShoppingCart,
  CreditCard,
  Fuel,
  Car,
  Bed,
  Cake,
  Dumbbell,
  Stethoscope,
  Dog,
  Zap,
  Wrench,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface CategoryGridProps {
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  onAutoNavigateCategory: (id: CategoryId) => void;
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  all: Compass,
  dentist: Smile,
  cafe: Coffee,
  restaurant: Utensils,
  hospital: Cross,
  pharmacy: Pill,
  grocery: ShoppingCart,
  atm: CreditCard,
  petrol: Fuel,
  ev_charging: Zap,
  car_wash: Car,
  mechanic: Wrench,
  hotel: Bed,
  bakery: Cake,
  gym: Dumbbell,
  medical_store: Stethoscope,
  veterinary: Dog,
};

const PRIMARY_CATEGORY_IDS = new Set<CategoryId>([
  'all',
  'dentist',
  'cafe',
  'restaurant',
  'hospital',
  'pharmacy',
]);

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [showAllSecondary, setShowAllSecondary] = useState(false);

  const primaryCategories = CATEGORIES.filter((c) => PRIMARY_CATEGORY_IDS.has(c.id));
  const secondaryCategories = CATEGORIES.filter((c) => !PRIMARY_CATEGORY_IDS.has(c.id));

  return (
    <section className="mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Primary Categories Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Popular Categories
        </h2>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-medium text-brand-400 hover:underline cursor-pointer"
          >
            Show All
          </button>
        )}
      </div>

      {/* Primary Categories - Featured Cards Grid (Mobile Horizontal Scrollable Carousel) */}
      <div className="flex md:grid md:grid-cols-6 gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-none snap-x">
        {primaryCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = CATEGORY_ICONS[cat.id] || Compass;

          return (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setTimeout(() => {
                  document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`snap-start min-w-[140px] md:min-w-0 flex-1 flex flex-col justify-between p-3.5 h-24 rounded-2xl group cursor-pointer border transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-800 border-brand-500 ring-1 ring-brand-500/50 shadow-subtle'
                  : 'bg-[#111827] border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-300 group-hover:text-brand-400'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                {isSelected && <span className="w-2 h-2 rounded-full bg-brand-500" />}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-100 block truncate group-hover:text-brand-400 transition-colors">
                  {cat.label}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1 block">
                  {cat.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Categories Accordion / Expandable Row */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">More Services</span>
          <button
            onClick={() => setShowAllSecondary(!showAllSecondary)}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span>{showAllSecondary ? 'Show Less' : `View All (${secondaryCategories.length})`}</span>
            {showAllSecondary ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Compact Chips for Secondary Categories */}
        <div className="flex flex-wrap gap-2">
          {(showAllSecondary ? secondaryCategories : secondaryCategories.slice(0, 6)).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComponent = CATEGORY_ICONS[cat.id] || Compass;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setTimeout(() => {
                    document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-brand-500 text-brand-300 shadow-subtle'
                    : 'bg-[#111827] border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
