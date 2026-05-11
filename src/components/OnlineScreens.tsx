/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Copy, ChevronLeft, LogOut, Check } from 'lucide-react';
import GlassCard from './GlassCard';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface OnlineWaitProps {
  roomCode: string;
  players: any[];
  isHost: boolean;
  onStart: () => void;
  onLeave: () => void;
}

export function OnlineWait({ roomCode, players, isHost, onStart, onLeave }: OnlineWaitProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <GlassCard glow="cyan" className="p-8 text-center">
        <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 font-black">كود الغرفة الخاص بك</div>
        <div className="text-6xl font-black text-cyan tracking-[0.15em] font-display drop-shadow-[0_0_15px_rgba(0,245,255,0.3)] select-all">{roomCode}</div>
        <button 
          onClick={copyCode}
          className="mt-6 flex items-center justify-center gap-2 mx-auto bg-white/5 border border-white/10 rounded-full px-6 py-2.5 text-[11px] font-black text-white/50 hover:text-cyan hover:border-cyan/30 transition-all active:scale-95"
        >
          {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
          {copied ? "تم النسخ" : "نسخ الرابط"}
        </button>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black">المتواجدون</span>
            <span className="bg-cyan/10 text-cyan px-2.5 py-0.5 rounded-lg text-xs font-black">{players.length}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gold/50">
             <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" /> في الانتظار
          </div>
        </div>

        <div className="space-y-2.5">
          {players.map((p, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={p.peerId} 
              className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-4 rounded-2xl group hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan/20 to-pink/20 flex items-center justify-center text-sm font-black border border-white/5 uppercase">
                   {p.name[0]}
                </div>
                <span className="font-black text-white/80">{p.name}</span>
              </div>
              {p.isHost && (
                <span className="text-[9px] bg-gold/20 text-gold border border-gold/30 px-2.5 py-1 rounded-full font-black uppercase tracking-tighter shadow-[0_0_10px_rgba(255,215,0,0.1)]">Host</span>
              )}
            </motion.div>
          ))}
        </div>

        {isHost ? (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            disabled={players.length < 2}
            className="w-full mt-10 py-5 rounded-[2rem] bg-gradient-to-br from-green-500 to-green-700 text-white font-black text-lg shadow-[0_15px_40px_rgba(34,197,94,0.2)] disabled:opacity-30 disabled:grayscale transition-all"
          >
            🚀 انطلاق اللعبة
          </motion.button>
        ) : (
          <div className="mt-10 text-center space-y-4">
             <div className="flex justify-center gap-2">
                {[0.2, 0.4, 0.6].map(d => (
                  <motion.div 
                    key={d}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: d }}
                    className="w-2.5 h-2.5 bg-cyan/40 rounded-full" 
                  />
                ))}
             </div>
             <p className="text-white/30 text-xs font-black tracking-widest uppercase">انتظار المضيف لبدء اللعبة...</p>
          </div>
        )}
      </GlassCard>

      <button 
        onClick={onLeave}
        className="w-full py-5 border border-red-500/20 bg-red-500/5 text-red-500 rounded-[2rem] font-black text-xs flex items-center justify-center gap-3 hover:bg-red-500/10 transition-all active:scale-95"
      >
        <LogOut size={16} /> مغادرة الغرفة
      </button>
    </div>
  );
}
