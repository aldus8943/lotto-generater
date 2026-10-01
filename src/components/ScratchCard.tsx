import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { generateSingleGame } from '../utils/lotto';
import { sound } from '../utils/sound';
import { LottoBall } from './LottoBall';
import type { LottoGame } from '../types';
import { Sparkles, Eye, RefreshCw, BookmarkCheck } from 'lucide-react';

interface ScratchCardProps {
  onSaveGame?: (game: LottoGame) => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ onSaveGame }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScratchingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [game, setGame] = useState<LottoGame>(() => generateSingleGame({ strategy: 'balanced' }));
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [scratchedPercent, setScratchedPercent] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Initialize scratch foil canvas with metallic 24K Gold pattern
  const initFoilCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 540);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 240);

    ctx.globalCompositeOperation = 'source-over';

    // Metallic gold foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#785311');
    grad.addColorStop(0.2, '#FFE382');
    grad.addColorStop(0.4, '#D4AF37');
    grad.addColorStop(0.6, '#FFF2B2');
    grad.addColorStop(0.8, '#AA8210');
    grad.addColorStop(1, '#573C09');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle brushed metallic horizontal lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y + (Math.random() - 0.5) * 2);
      ctx.lineTo(width, y + (Math.random() - 0.5) * 2);
      ctx.stroke();
    }

    // Embossed Gold Hologram Stamp in center
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // VIP Seal border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 160, height / 2 - 45, 320, 90, 16);
    ctx.stroke();

    ctx.font = 'bold 22px Cinzel, serif';
    ctx.fillStyle = '#261C02';
    ctx.fillText('ROYAL VIP SCRATCH', width / 2, height / 2 - 10);

    ctx.font = '500 13px Pretendard, sans-serif';
    ctx.fillStyle = '#42330B';
    ctx.fillText('동전이나 마우스로 긁어 행운의 6자리를 확인하세요', width / 2, height / 2 + 18);
    ctx.restore();

    setScratchedPercent(0);
    setIsRevealed(false);
  }, []);

  useEffect(() => {
    initFoilCanvas();
    window.addEventListener('resize', initFoilCanvas);
    return () => window.removeEventListener('resize', initFoilCanvas);
  }, [initFoilCanvas, game]);

  // Scratch action
  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };

    // Play subtle sound throttle
    if (Math.random() < 0.25) {
      sound.playScratch();
    }
  };

  // Calculate percentage of foil removed
  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let transparentCount = 0;
      const totalPixels = pixels.length / 4;

      // Sample 1 out of every 16 pixels for speed
      for (let i = 3; i < pixels.length; i += 64) {
        if (pixels[i] < 32) {
          transparentCount += 16;
        }
      }

      const percent = Math.min(100, Math.round((transparentCount / totalPixels) * 100));
      setScratchedPercent(percent);

      if (percent >= 55) {
        revealAll();
      }
    } catch {
      // ignore
    }
  };

  const revealAll = () => {
    setIsRevealed(true);
    sound.playJackpot();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF', '#10B981'],
    });

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setScratchedPercent(100);
  };

  const newCard = () => {
    sound.playClick();
    setIsSaved(false);
    const newG = generateSingleGame({ strategy: 'balanced' });
    setGame(newG);
  };

  const handleSave = () => {
    sound.playClick();
    if (onSaveGame) {
      onSaveGame(game);
      setIsSaved(true);
    }
  };

  // Mouse / Touch handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isScratchingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    lastPointRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    scratchAt(lastPointRef.current.x, lastPointRef.current.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratchingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    scratchAt(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerUp = () => {
    isScratchingRef.current = false;
    lastPointRef.current = null;
    checkScratchPercentage();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-6">
      {/* Scratch Ticket Container */}
      <div className="relative w-full rounded-3xl p-1 bg-gradient-to-br from-amber-300 via-amber-600 to-yellow-200 gold-glow shadow-2xl">
        <div className="w-full bg-[#0D0F17] rounded-[22px] p-6 sm:p-8 flex flex-col space-y-6">
          {/* Header Certificate Branding */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-cinzel font-black text-black shadow-lg">
                7
              </div>
              <div>
                <h3 className="font-cinzel font-extrabold text-amber-300 text-lg tracking-wider">
                  ROYALE GOLD CERTIFICATE
                </h3>
                <p className="text-xs text-zinc-400">대한민국 로또 6/45 프리미엄 스크래치 복권</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block">SERIAL NO.</span>
              <span className="text-xs font-mono font-bold text-amber-400/90">{game.id.toUpperCase()}</span>
            </div>
          </div>

          {/* Hidden Content Area & Scratch Foil Overlay */}
          <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-b from-[#161925] to-[#0A0C12] border-2 border-amber-500/40 flex items-center justify-center select-none shadow-inner">
            {/* The Lucky Numbers Behind Foil */}
            <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-4 p-4 z-0">
              {game.numbers.map((num, i) => (
                <div key={i} className="flex flex-col items-center space-y-1">
                  <LottoBall number={num} size="lg" animate={isRevealed} />
                  <span className="text-[10px] text-zinc-400 font-medium">제 {i + 1}구</span>
                </div>
              ))}
            </div>

            {/* Canvas Scratch Foil Layer */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{ touchAction: 'none' }}
              className={`absolute inset-0 z-10 w-full h-full cursor-crosshair transition-opacity duration-700 ${
                isRevealed ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
            />
          </div>

          {/* Ticket Footer Analysis Info */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
            <div className="flex items-center space-x-3">
              <span>합계: <strong className="text-amber-300">{game.stats.sum}</strong></span>
              <span>홀짝: <strong className="text-amber-300">{game.stats.oddCount}:{game.stats.evenCount}</strong></span>
              <span>AC값: <strong className="text-amber-300">{game.stats.ac}</strong></span>
            </div>
            <div className="flex items-center space-x-1 text-amber-400 font-semibold">
              <Sparkles size={14} />
              <span>긁은 비율: {scratchedPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center flex-wrap gap-3">
        <button
          onClick={revealAll}
          disabled={isRevealed}
          className="px-5 py-2.5 rounded-xl gold-button flex items-center space-x-2 text-xs uppercase font-bold tracking-wider disabled:opacity-40 cursor-pointer"
        >
          <Eye size={16} />
          <span>즉시 전체 개봉</span>
        </button>

        <button
          onClick={handleSave}
          disabled={!isRevealed || isSaved}
          className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center space-x-2 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
        >
          <BookmarkCheck size={16} />
          <span>{isSaved ? '보관함 저장 완료' : '이 조합 보관함에 저장'}</span>
        </button>

        <button
          onClick={newCard}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center space-x-2 text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw size={16} />
          <span>새 복권 발급</span>
        </button>
      </div>
    </div>
  );
};
