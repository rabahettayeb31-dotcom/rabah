/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function Background() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-[#050508]">
        {/* Layered Atmospheric Glows - Muted but Deep */}
        <div 
          className="absolute inset-0 opacity-10 bg-radial-[at_15%_10%] from-gold/5 via-transparent to-transparent" 
        />
        <div 
          className="absolute inset-0 opacity-10 bg-radial-[at_85%_85%] from-cyan-900/40 via-transparent to-transparent" 
        />
        
        {/* The Structure - Finer Dot Grid */}
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-transparent to-black/60" />
        
        {/* Noise Texture - Finer */}
        <div className="absolute inset-0 mix-blend-overlay opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Deep Floating Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.08, 0.05],
          x: [0, -20, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-[600px] h-[600px] bg-indigo-900/20 blur-[120px] rounded-full -top-40 -right-40"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.06, 0.03],
          y: [0, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute w-[500px] h-[500px] bg-red-900/10 blur-[100px] rounded-full -bottom-40 -left-40"
      />
    </div>
  );
}
