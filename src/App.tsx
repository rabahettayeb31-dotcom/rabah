/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Trophy, Globe, Mic, MicOff, Plus, 
  Trash2, Save, LogOut, ChevronLeft, CirclePlay,
  Sparkles, Users
} from 'lucide-react';
import Background from './components/Background';
import GlassCard from './components/GlassCard';
import CategoryButton from './components/CategoryButton';
import { OnlineWait } from './components/OnlineScreens';
import { CATS, CAT_ORDER, BASE_Q, CULTURE_Q } from './constants';
import { usePeer } from './hooks/usePeer';
import { cn } from './lib/utils';
import { sounds } from './lib/sounds';

type Screen = 'home' | 'game' | 'leaderboard' | 'online' | 'online-create' | 'online-join' | 'online-wait' | 'online-game' | 'players';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeTab, setActiveTab] = useState<Screen>('home');
  const [playersNames, setPlayersNames] = useState<string[]>(['أنت', 'صاحبك 1', 'صاحبك 2']);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentCat, setCurrentCat] = useState('friends');
  const [currentTarget, setCurrentTarget] = useState('');
  const [currentQ, setCurrentQ] = useState<any>(null);
  const [comboMult, setComboMult] = useState(1);
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputCode, setInputCode] = useState('');

  const navigateTo = (to: Screen) => {
    sounds.play('click');
    setScreen(to);
    setActiveTab(to);
  };

  const { 
    isHost, roomCode, players: onlinePlayers, isLoading, 
    createRoom, joinRoom, isMicMuted, toggleMic, sendVote, 
    setQuestion, peer 
  } = usePeer();

  const isOnlineMode = ['online-wait', 'online-game'].includes(screen);
  const currentGamePlayers = useMemo(() => isOnlineMode ? onlinePlayers.map(p => p.name) : playersNames, [isOnlineMode, onlinePlayers, playersNames]);

  useEffect(() => {
    setScores(prev => {
      const next: Record<string, number> = {};
      playersNames.forEach(p => { next[p] = prev[p] || 0; });
      return next;
    });
  }, [playersNames]);

  const showToast = useCallback((msg: string, color: string = 'cyan') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const getNextQuestion = useCallback((catId: string) => {
    if (catId === 'culture') {
      const q = CULTURE_Q[Math.floor(Math.random() * CULTURE_Q.length)];
      return { q: q.q, opts: q.opts, type: 'mcq' };
    }
    const questions = BASE_Q[catId] || BASE_Q.friends;
    return { text: questions[Math.floor(Math.random() * questions.length)], type: 'vote' };
  }, []);

  const handleVote = useCallback((player: string) => {
    const pts = 10 * comboMult;
    setScores(prev => ({ ...prev, [player]: (prev[player] || 0) + pts }));
    
    if (player === lastWinner && player !== '') {
      const newStreak = (streaks[player] || 0) + 1;
      setStreaks(s => ({ ...s, [player]: newStreak }));
      if (newStreak >= 3) {
        if (comboMult < 4) {
          setComboMult(c => c + 1);
          sounds.play('win');
        } else {
          sounds.play('success');
        }
      } else {
        sounds.play('pop');
      }
    } else {
      if (player !== '') {
        setStreaks(s => ({ ...s, [player]: 1 }));
        setLastWinner(player);
        sounds.play('pop');
      }
      setComboMult(1);
    }

    const q = getNextQuestion(currentCat);
    const target = currentGamePlayers[Math.floor(Math.random() * currentGamePlayers.length)];

    if (isOnlineMode && isHost) {
      setQuestion(q);
    }

    setCurrentQ(q);
    setCurrentTarget(target);
  }, [comboMult, lastWinner, streaks, currentCat, isOnlineMode, isHost, setQuestion, currentGamePlayers, getNextQuestion]);

  useEffect(() => {
    if (peer) {
      peer.on('connection', (conn) => {
        conn.on('data', (data: any) => {
          if (data.type === 'VOTE') { handleVote(data.player); showToast(`صوت لـ ${data.player}`, 'pink'); }
          if (data.type === 'QUESTION_UPDATE') { setCurrentQ(data.question); setScreen('online-game'); }
        });
      });
    }
  }, [peer, handleVote, showToast]);

  const startLocalGame = () => {
    sounds.play('swipe');
    setCurrentTarget(playersNames[Math.floor(Math.random() * playersNames.length)]);
    setCurrentQ(getNextQuestion(currentCat));
    setScreen('game');
    setActiveTab('game');
  };

  const startOnlineGame = () => {
    const q = getNextQuestion(currentCat);
    setQuestion(q);
    setCurrentQ(q);
    setCurrentTarget(onlinePlayers[0].name);
    setScreen('online-game');
  };

  return (
    <div className="min-h-screen pb-32">
      <Background />
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50 }} animate={{ y: 20 }} exit={{ y: -50 }} className={cn("fixed top-0 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full text-sm font-black backdrop-blur-xl border border-white/10 shadow-2xl", toast.color === 'cyan' ? "bg-cyan/20 text-cyan" : "bg-pink/20 text-pink")}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 max-w-[500px] mx-auto px-4 pt-10">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-10"
            >
              <div className="text-center py-12 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 bg-cyan/10 blur-3xl -z-10" />
                <h1 className="text-7xl font-[900] bg-gradient-to-br from-white via-white/80 to-white/40 bg-clip-text text-transparent leading-[1.1] pb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  شكون أكثر<br/>واحد؟
                </h1>
                <div className="flex items-center justify-center gap-4 text-white/30">
                  <div className="h-[1px] w-8 bg-current opacity-20" />
                  <p className="font-[600] tracking-[0.2em] uppercase text-[10px] letter-spacing-widest">
                    Social Comparison Game
                  </p>
                  <div className="h-[1px] w-8 bg-current opacity-20" />
                </div>
              </div>

              <GlassCard glow="gold" className="p-8 group hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center text-4xl shadow-inner border border-gold/10">
                    👑
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-white/30 uppercase font-[800] tracking-wider mb-1">المتصدر الحالي</div>
                    <div className="text-gold font-[900] text-3xl tracking-tight">
                      {Object.keys(scores).sort((a,b) => scores[b]-scores[a])[0] || 'في الانتظار'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-[900] text-white">
                      {Math.max(...Object.values(scores) as number[], 0)}
                    </div>
                    <div className="text-[10px] text-gold font-bold uppercase">نقطة</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 shadow-2xl">
                <div className="mb-8">
                  <div className="text-xs font-bold text-white/40 uppercase tracking-widest text-center mb-6">اختر التصنيف</div>
                  <div className="grid grid-cols-3 gap-6">
                    {CAT_ORDER.map(id => (
                      <CategoryButton 
                        key={id} 
                        category={CATS[id]} 
                        isSelected={currentCat === id} 
                        onClick={() => setCurrentCat(id)} 
                      />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={startLocalGame} 
                  className="btn-premium w-full mt-4 py-6 bg-white text-black font-[900] text-xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-[0_25px_60px_rgba(255,255,255,0.2)]"
                >
                  ابدأ اللعب محلياً
                </button>
              </GlassCard>
            </motion.div>
          )}

          {(screen === 'game' || screen === 'online-game') && (
            <motion.div 
              key="game" 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <GlassCard glow="cyan" className="p-10 shadow-3xl">
                <div className="flex justify-between items-center mb-10">
                  <div className="bg-cyan/5 border border-cyan/20 rounded-full px-5 py-2 text-[10px] font-[900] text-cyan tracking-widest uppercase">
                    {CATS[currentCat].label}
                  </div>
                  {comboMult > 1 && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="bg-gold text-black px-5 py-2 rounded-full text-[10px] font-[900] shadow-[0_0_20px_rgba(212,175,55,0.4)] tracking-widest uppercase"
                    >
                      🔥 Combo x{comboMult}
                    </motion.div>
                  )}
                </div>
                
                <div className="bg-black/40 rounded-[2.5rem] p-12 text-center border border-white/[0.03] mb-10 shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <p className="text-3xl font-[900] text-white leading-tight transition-transform duration-500 group-hover:scale-[1.02]">
                    {currentQ?.type === 'mcq' ? currentQ.q : currentQ?.text}
                  </p>
                </div>

                {currentQ?.type === 'mcq' ? (
                  <div className="grid gap-4">
                    {currentQ.opts.map((opt: any, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => {
                          if (opt.c) {
                            sounds.play('success');
                            showToast("إجابة صحيحة! 🎉", 'cyan');
                            handleVote(playersNames[0]);
                          } else {
                            sounds.play('error');
                            showToast("إجابة خاطئة ❌", 'pink');
                            handleVote('');
                          }
                        }}
                        className="w-full bg-white/[0.02] border border-white/[0.05] p-6 rounded-[2rem] hover:bg-cyan/10 hover:border-cyan/30 transition-all text-right font-[800] text-lg text-white/80 hover:text-white"
                      >
                        {opt.t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="bg-pink/5 border border-pink/10 rounded-[2rem] p-6 text-center mb-10 flex flex-col items-center">
                       <span className="text-[10px] text-white/20 uppercase font-black tracking-[3px] mb-2">المستهدف</span>
                       <span className="text-white font-[900] text-3xl tracking-tight">{currentTarget}</span>
                    </div>
                    <div className="grid gap-4">
                      {currentGamePlayers.map(p => (
                        <button 
                          key={p} 
                          onClick={() => { if(isOnlineMode) sendVote(p); handleVote(p); }} 
                          className="group flex justify-between items-center bg-white/[0.02] border border-white/[0.05] p-6 rounded-[2rem] hover:bg-pink/5 hover:border-pink/30 transition-all"
                        >
                          <span className="font-[800] text-lg text-white/70 group-hover:text-white transition-colors">{p}</span>
                          <div className="flex items-center gap-2">
                             <span className="text-gold font-[900] text-xl">{scores[p] || 0}</span>
                             <span className="text-[10px] text-gold/40 font-bold">★</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </GlassCard>
            </motion.div>
          )}

          {screen === 'online' && (
            <motion.div key="online" className="space-y-4 pt-10">
              <button onClick={() => setScreen('online-create')} className="w-full bg-cyan/10 border border-cyan/20 p-8 rounded-[2.5rem] flex items-center justify-between group">
                <div className="text-right">
                  <div className="text-2xl font-black text-cyan group-hover:scale-105 transition-transform origin-right">إنشاء غرفة</div>
                  <div className="text-white/30 text-xs">كن أنت المضيف</div>
                </div>
                <Plus className="text-cyan" />
              </button>
              <button onClick={() => setScreen('online-join')} className="w-full bg-pink/10 border border-pink/20 p-8 rounded-[2.5rem] flex items-center justify-between group">
                <div className="text-right">
                  <div className="text-2xl font-black text-pink group-hover:scale-105 transition-transform origin-right">انضمام بكود</div>
                  <div className="text-white/30 text-xs">ادخل كود صاحبك</div>
                </div>
                <Globe className="text-pink" />
              </button>
            </motion.div>
          )}

          {screen === 'online-create' && (
            <motion.div key="online-create" className="pt-10">
              <GlassCard className="p-10 space-y-6">
                <h2 className="text-2xl font-black text-center">🏠 غرفة جديدة</h2>
                <input value={inputName} onChange={e => setInputName(e.target.value)} placeholder="اسمك" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center font-black outline-none focus:border-cyan" />
                <button onClick={() => { createRoom(inputName); setScreen('online-wait'); }} className="w-full py-5 bg-cyan text-black font-black rounded-[2rem]">إنشاء</button>
                <button onClick={() => setScreen('online')} className="w-full text-white/30 font-bold">إلغاء</button>
              </GlassCard>
            </motion.div>
          )}

          {screen === 'online-join' && (
            <motion.div key="online-join" className="pt-10">
              <GlassCard className="p-10 space-y-4">
                <h2 className="text-2xl font-black text-center">🔗 انضمام</h2>
                <input value={inputName} onChange={e => setInputName(e.target.value)} placeholder="اسمك" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center font-black" />
                <input value={inputCode} onChange={e => setInputCode(e.target.value.toUpperCase())} placeholder="كود الغرفة" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center font-black" />
                <button onClick={() => { joinRoom(inputCode, inputName); setScreen('online-wait'); }} className="w-full py-5 bg-pink text-white font-black rounded-[2rem]">انضم الآن</button>
                <button onClick={() => setScreen('online')} className="w-full text-white/30 font-bold">إلغاء</button>
              </GlassCard>
            </motion.div>
          )}

          {screen === 'online-wait' && <OnlineWait roomCode={roomCode} players={onlinePlayers} isHost={isHost} onStart={startOnlineGame} onLeave={() => setScreen('home')} />}

          {screen === 'leaderboard' && (
            <motion.div key="leaderboard" className="space-y-6">
               <h2 className="text-3xl font-black text-center pt-8">🏆 الترتيب</h2>
               <GlassCard className="p-6 divide-y divide-white/5">
                 {(Object.entries(scores) as [string, number][]).sort((a,b) => b[1]-a[1]).map(([name, s], i) => (
                   <div key={name} className="py-4 flex items-center justify-between">
                     <span className="font-black text-lg">{i+1}. {name}</span>
                     <span className="text-gold font-black text-xl">{s}★</span>
                   </div>
                 ))}
                 {Object.keys(scores).length === 0 && <div className="text-center py-10 opacity-20 font-black">لا توجد نتائج</div>}
               </GlassCard>
               <button onClick={() => setScreen('players')} className="w-full py-5 border border-white/10 rounded-[2rem] font-black opacity-50 hover:opacity-100">تعديل اللاعبين</button>
            </motion.div>
          )}

          {screen === 'players' && (
            <motion.div key="players" className="space-y-6 pt-10">
              <GlassCard className="p-8 space-y-4">
                 <h2 className="text-2xl font-black text-center mb-4">👥 اللاعبون</h2>
                 {playersNames.map((n, i) => (
                   <div key={i} className="flex gap-2">
                     <input value={n} onChange={e => { const copy = [...playersNames]; copy[i] = e.target.value; setPlayersNames(copy); }} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 font-black" />
                     <button onClick={() => setPlayersNames(playersNames.filter((_, idx) => idx !== i))} disabled={playersNames.length <= 2} className="p-4 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={18}/></button>
                   </div>
                 ))}
                 {playersNames.length < 8 && <button onClick={() => setPlayersNames([...playersNames, "لاعب جديد"])} className="w-full py-4 border border-dashed border-white/10 rounded-xl opacity-40 hover:opacity-100 trans">+ إضافة</button>}
                 <button onClick={() => setScreen('home')} className="w-full py-5 bg-cyan text-black font-black rounded-2xl mt-6">حفظ</button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-[50px] border-t border-white/[0.05] px-10 py-8 pb-12 flex justify-around items-center rounded-t-[3rem]">
        {[{ id: 'home', icon: Home, label: 'البداية' }, { id: 'game', icon: CirclePlay, label: 'لعب' }, { id: 'leaderboard', icon: Trophy, label: 'الترتيب' }, { id: 'online', icon: Globe, label: 'أونلاين' }].map(t => (
          <button 
            key={t.id} 
            onClick={() => { 
              navigateTo(t.id as any);
              if (t.id === 'game') startLocalGame();
            }} 
            className={cn(
              "flex flex-col items-center gap-2 transition-all duration-500", 
              activeTab === t.id ? "text-cyan translate-y-[-8px]" : "text-white/20 hover:text-white/40"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
              activeTab === t.id ? "bg-cyan/10 shadow-[0_0_20px_rgba(0,229,255,0.2)] border border-cyan/20" : ""
            )}>
              <t.icon size={22} className={cn(activeTab === t.id && "drop-shadow-[0_0_8px_currentColor]")} />
            </div>
            <span className={cn(
              "text-[10px] font-[800] uppercase tracking-widest transition-opacity duration-500",
              activeTab === t.id ? "opacity-100" : "opacity-0"
            )}>
              {t.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
