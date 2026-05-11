/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'pink' | 'gold' | 'none';
  delay?: number;
}

export default function GlassCard({ children, className, glow = 'none', delay = 0 }: GlassCardProps) {
  const glowClasses = {
    cyan: 'glass-card-glow-cyan',
    pink: 'glass-card-glow-pink',
    gold: 'glass-card-glow-gold',
    none: ''
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.16, 1, 0.3, 1] // Custom refined cubic-bezier
      }}
      className={cn(
        "glass-card",
        glowClasses[glow],
        className
      )}
    >
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* Premium Inner Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  );
}
