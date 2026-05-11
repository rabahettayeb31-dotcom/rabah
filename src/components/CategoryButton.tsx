/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Category } from '../constants';
import { cn } from '../lib/utils';
import { sounds } from '../lib/sounds';

interface CategoryButtonProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

export default function CategoryButton({ category, isSelected, onClick }: CategoryButtonProps) {
  const handleClick = () => {
    sounds.play('click');
    onClick();
  };

  if (category.rect) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={cn(
          "col-span-3 flex items-center gap-5 p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group text-right",
          isSelected 
            ? "bg-gold/10 border-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.1)]" 
            : "bg-obsidian/40 border-white/[0.03] hover:border-white/10"
        )}
      >
        <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/5">
          {category.emoji}
        </div>
        <div className="flex-1">
          <div className={cn("font-[900] text-xl tracking-tight mb-0.5", isSelected ? "text-gold" : "text-white")}>{category.label}</div>
          <div className="text-[10px] text-white/20 uppercase font-black tracking-widest leading-none">ثقافة عامة • خيارات متعددة</div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center p-5 rounded-[2.2rem] border transition-all relative group h-36 justify-center",
        isSelected 
          ? "bg-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.3)]" 
          : "bg-obsidian/40 border-white/[0.03] hover:border-white/10"
      )}
      style={{ borderColor: isSelected ? `${category.color}44` : undefined }}
    >
      <div 
        className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3 transition-all duration-500 group-hover:scale-110"
        style={{ backgroundColor: isSelected ? `${category.color}15` : 'rgba(255,255,255,0.02)' }}
      >
        {category.emoji}
      </div>
      <div className="text-[11px] font-[800] uppercase tracking-wider text-center" style={{ color: isSelected ? category.color : 'rgba(255,255,255,0.3)' }}>
        {category.label}
      </div>
      {isSelected && (
        <motion.div 
          layoutId="cat-indicator" 
          className="absolute -bottom-1 w-8 h-1 rounded-full"
          style={{ backgroundColor: category.color }}
        />
      )}
    </motion.button>
  );
}
