import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LottoBall } from './LottoBall';
import { sound } from '../utils/sound';
import { generateSingleGame } from '../utils/lotto';
import type { LottoGame } from '../types';
import { X, Sparkles, Radio, Trophy, RefreshCw } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  storeName = '로또로얄 VIP 스튜디오',
}) => {
  const [game, setGame] = useState<LottoGame>(() => generateSingleGame());
  const [bonus, setBonus] = useState<number>(7);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // Initialize new broadcast round
  const startNewRound = () => {
    const newG = generateSingleGame({ strategy: 'balanced' });
    let b = Math.floor(Math.random() * 45) + 1;
    while (newG.numbers.includes(b)) {
      b = Math.floor(Math.random() * 45) + 1;
    }
    setGame(newG);
    setBonus(b);
    setRevealedCount(0);
    setIsBroadcasting(false);
  };

  useEffect(() => {
    if (isOpen) {
      startNewRound();
    }
  }, [isOpen]);

  const runLiveSequence = () => {
    if (isBroadcasting) return;
    setIsBroadcasting(true);
    setRevealedCount(0);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedCount(count);

      if (count <= 6) {
        sound.playHeartbeat();
        sound.playBallReveal(count - 1);
      } else if (count === 7) {
        // Bonus ball reveal
        sound.playBallReveal(6);
        sound.playJackpot();
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#FFE272', '#EAB308', '#3B82F6', '#EF4444', '#10B981'],
        });
        clearInterval(interval);
        setIsBroadcasting(false);
      }
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 select-none animate-fadeIn overflow-hidden">
      {/* Dynamic Background Light Rays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-amber-500/10 via-yellow-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-amber-500/30 pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold animate-pulse">
            <Radio size={14} className="text-rose-400" />
            <span>ON AIR LIVE BROADCAST</span>
          </div>
          <span className="text-sm font-semibold text-zinc-300 tracking-wide">
            {storeName} 특별 실시간 추첨 방송
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Cinematic Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto space-y-10">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full gold-badge text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} />
            <span>Golden VIP Live Extraction</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black gold-gradient-text tracking-wider">
            당첨 번호 실시간 개봉
          </h1>
          <p className="text-sm text-zinc-400">
            {revealedCount === 7 ? '🎉 제 1등 공식 당첨 번호 발표 완료!' : '숨막히는 긴장감! 행운의 황금 숫자가 공개됩니다.'}
          </p>
        </div>

        {/* 6 Main Balls Stage */}
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 p-6 rounded-3xl glass-obsidian border-2 border-amber-500/40 shadow-[0_0_80px_rgba(212,175,55,0.25)]">
          {game.numbers.map((num, idx) => {
            const isShown = revealedCount > idx;
            return (
              <div key={idx} className="flex flex-col items-center space-y-3">
                <div
                  className={`transition-all duration-700 transform ${
                    isShown ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-30 blur-sm rotate-45'
                  }`}
                >
                  {isShown ? (
                    <LottoBall number={num} size="2xl" animate={idx === revealedCount - 1} />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-dashed border-amber-500/30 flex items-center justify-center text-zinc-600 font-cinzel text-2xl font-bold">
                      ?
                    </div>
                  )}
                </div>
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                  제 {idx + 1}구
                </span>
              </div>
            );
          })}

          {/* Bonus Ball */}
          <div className="flex items-center space-x-4 pl-4 sm:pl-8 border-l border-amber-500/30">
            <div className="flex flex-col items-center space-y-3">
              <div
                className={`transition-all duration-700 transform ${
                  revealedCount >= 7 ? 'scale-100 opacity-100' : 'scale-75 opacity-30 blur-sm'
                }`}
              >
                {revealedCount >= 7 ? (
                  <LottoBall number={bonus} size="2xl" isBonus animate />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-950/40 border-2 border-dashed border-amber-400/40 flex items-center justify-center text-amber-500/40 font-cinzel text-2xl font-bold">
                    +
                  </div>
                )}
              </div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                보너스
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Tag */}
        {revealedCount === 7 && (
          <div className="flex items-center space-x-2 text-amber-300 font-bold bg-amber-500/20 px-6 py-2 rounded-full border border-amber-400/50 animate-bounce">
            <Trophy size={18} className="text-amber-400" />
            <span>최종 조합 완성! 1등 행운을 축복합니다!</span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 flex items-center justify-between border-t border-zinc-800 pt-4 flex-wrap gap-4">
        <div className="text-xs text-zinc-500 font-mono">
          SYSTEM: 6/45 BROADCAST ENGINE • 1080P/4K HDR READY
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={startNewRound}
            disabled={isBroadcasting}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw size={14} />
            <span>새 번호 준비</span>
          </button>

          <button
            onClick={runLiveSequence}
            disabled={isBroadcasting || revealedCount >= 7}
            className="px-8 py-3 rounded-xl gold-button text-sm font-extrabold uppercase tracking-wider flex items-center space-x-2 cursor-pointer disabled:opacity-40"
          >
            <Radio size={16} />
            <span>{isBroadcasting ? '추첨 방송 진행 중...' : '생방송 추첨 개봉 시작'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
