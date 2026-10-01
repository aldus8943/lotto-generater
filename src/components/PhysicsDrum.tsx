import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { getBallColorCategory, analyzeGame } from '../utils/lotto';
import { sound } from '../utils/sound';
import { LottoBall } from './LottoBall';
import type { LottoGame } from '../types';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, Award } from 'lucide-react';

interface BallParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  vRot: number;
  colorCategory: string;
  isDrawn: boolean;
}

interface PhysicsDrumProps {
  onGameCompleted?: (game: LottoGame) => void;
}

export const PhysicsDrum: React.FC<PhysicsDrumProps> = ({ onGameCompleted }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isBlowing, setIsBlowing] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [bonusNumber, setBonusNumber] = useState<number | null>(null);
  const [airSpeed, setAirSpeed] = useState<number>(1.2);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());

  // Ball physics internal state in ref for 60fps loop
  const ballsRef = useRef<BallParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isSuctionActiveRef = useRef<boolean>(false);
  const drawnCountRef = useRef<number>(0);

  // Initialize balls
  const initBalls = useCallback((width: number, height: number) => {
    const balls: BallParticle[] = [];
    const r = Math.min(width, height) * 0.038;
    const centerX = width / 2;
    const centerY = height * 0.55;

    for (let i = 1; i <= 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (Math.min(width, height) * 0.28);
      balls.push({
        id: i,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: r,
        angle: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        colorCategory: getBallColorCategory(i),
        isDrawn: false,
      });
    }
    ballsRef.current = balls;
  }, []);

  // Setup canvas and run physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 580);
    let height = (canvas.height = Math.min(width * 0.88, 520));

    initBalls(width, height);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 580;
      height = canvas.height = Math.min(width * 0.88, 520);
      initBalls(width, height);
    };

    window.addEventListener('resize', handleResize);

    const drumRadius = Math.min(width, height) * 0.44;
    const drumCenterX = width / 2;
    const drumCenterY = height * 0.55;
    const suctionX = drumCenterX;
    const suctionY = drumCenterY - drumRadius + 20;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.032);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Drum Acrylic Dome & Golden Metallic Frame
      // Golden Base Ring
      const gradBase = ctx.createLinearGradient(drumCenterX - drumRadius, drumCenterY, drumCenterX + drumRadius, drumCenterY);
      gradBase.addColorStop(0, '#785311');
      gradBase.addColorStop(0.3, '#E5B842');
      gradBase.addColorStop(0.5, '#FFF2A3');
      gradBase.addColorStop(0.7, '#D4AF37');
      gradBase.addColorStop(1, '#573C09');

      // Glass sphere background fill
      const glassGrad = ctx.createRadialGradient(
        drumCenterX - drumRadius * 0.3,
        drumCenterY - drumRadius * 0.3,
        drumRadius * 0.1,
        drumCenterX,
        drumCenterY,
        drumRadius
      );
      glassGrad.addColorStop(0, 'rgba(30, 36, 52, 0.55)');
      glassGrad.addColorStop(0.7, 'rgba(15, 18, 28, 0.75)');
      glassGrad.addColorStop(1, 'rgba(8, 10, 16, 0.95)');

      ctx.beginPath();
      ctx.arc(drumCenterX, drumCenterY, drumRadius, 0, Math.PI * 2);
      ctx.fillStyle = glassGrad;
      ctx.fill();

      // Golden Rim
      ctx.lineWidth = 6;
      ctx.strokeStyle = gradBase;
      ctx.stroke();

      // Inner glow ring
      ctx.beginPath();
      ctx.arc(drumCenterX, drumCenterY, drumRadius - 4, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 235, 150, 0.4)';
      ctx.stroke();

      // Top Suction Funnel
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(suctionX - 35, suctionY - 35);
      ctx.lineTo(suctionX + 35, suctionY - 35);
      ctx.lineTo(suctionX + 22, suctionY + 5);
      ctx.lineTo(suctionX - 22, suctionY + 5);
      ctx.closePath();
      ctx.fillStyle = isSuctionActiveRef.current ? 'rgba(255, 215, 0, 0.35)' : 'rgba(212, 175, 55, 0.15)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isSuctionActiveRef.current ? '#FFE272' : '#997321';
      ctx.stroke();

      if (isSuctionActiveRef.current) {
        // Suction vortex glow
        const suctionGlow = ctx.createRadialGradient(suctionX, suctionY, 2, suctionX, suctionY, 50);
        suctionGlow.addColorStop(0, 'rgba(255, 235, 150, 0.8)');
        suctionGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = suctionGlow;
        ctx.beginPath();
        ctx.arc(suctionX, suctionY, 50, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Air Blower Jet Lines (upward air currents)
      if (isBlowing) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 235, 160, 0.12)';
        ctx.lineWidth = 1.5;
        for (let j = 0; j < 5; j++) {
          const jetX = drumCenterX - 60 + j * 30 + Math.sin(time * 0.005 + j) * 10;
          const jetStartY = drumCenterY + drumRadius - 20;
          const jetHeight = 70 + Math.sin(time * 0.01 + j) * 35;
          ctx.beginPath();
          ctx.moveTo(jetX, jetStartY);
          ctx.lineTo(jetX + (Math.random() - 0.5) * 6, jetStartY - jetHeight);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Physics Update for balls
      const balls = ballsRef.current;
      const gravity = 180; // px / s^2

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        if (b.isDrawn) continue;

        // Apply forces
        b.vy += gravity * dt;

        // Blower force: upward air jet from the bottom
        if (isBlowing) {
          const distFromCenter = Math.abs(b.x - drumCenterX);
          if (distFromCenter < drumRadius * 0.85) {
            // Turbulence & upward draft
            const upwardBoost = (drumCenterY + drumRadius - b.y) * 4.8 * airSpeed;
            b.vy -= (upwardBoost + Math.random() * 80) * dt;
            b.vx += (Math.random() - 0.5) * 65 * airSpeed * dt;
          }
        }

        // Suction force when draw is active
        if (isSuctionActiveRef.current) {
          const dxS = suctionX - b.x;
          const dyS = suctionY - b.y;
          const distS = Math.sqrt(dxS * dxS + dyS * dyS);
          if (distS < drumRadius * 0.7) {
            const pull = (1 - distS / (drumRadius * 0.7)) * 550;
            b.vx += (dxS / distS) * pull * dt;
            b.vy += (dyS / distS) * pull * dt;
          }
        }

        // Damping / Air Drag
        b.vx *= 0.992;
        b.vy *= 0.992;

        // Position update
        b.x += b.vx * dt * 60 * 0.016;
        b.y += b.vy * dt * 60 * 0.016;
        b.angle += b.vRot;

        // Spherical boundary collision
        const dx = b.x - drumCenterX;
        const dy = b.y - drumCenterY;
        const distCenter = Math.sqrt(dx * dx + dy * dy);
        const maxDist = drumRadius - b.radius - 3;

        if (distCenter > maxDist) {
          const normalX = dx / distCenter;
          const normalY = dy / distCenter;
          b.x = drumCenterX + normalX * maxDist;
          b.y = drumCenterY + normalY * maxDist;

          // Elastic bounce
          const dot = b.vx * normalX + b.vy * normalY;
          b.vx = (b.vx - 1.85 * dot * normalX) * 0.78;
          b.vy = (b.vy - 1.85 * dot * normalY) * 0.78;

          // Sound effect on hard bounce (throttled)
          if (Math.abs(dot) > 80 && Math.random() < 0.08) {
            sound.playBounce(Math.abs(dot) / 250);
          }
        }
      }

      // Ball-to-ball collisions
      for (let i = 0; i < balls.length; i++) {
        const b1 = balls[i];
        if (b1.isDrawn) continue;
        for (let j = i + 1; j < balls.length; j++) {
          const b2 = balls[j];
          if (b2.isDrawn) continue;

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            b1.x -= nx * overlap;
            b1.y -= ny * overlap;
            b2.x += nx * overlap;
            b2.y += ny * overlap;

            // Collision impulse
            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;

            b1.vx -= p * nx * 0.85;
            b1.vy -= p * ny * 0.85;
            b2.vx += p * nx * 0.85;
            b2.vy += p * ny * 0.85;
          }
        }
      }

      // 3. Render balls with realistic colors & numbers
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        if (b.isDrawn) continue;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);

        // Ball Base Colors
        let fillColor1 = '#FFE272';
        let fillColor2 = '#D97706';

        if (b.colorCategory === 'blue') {
          fillColor1 = '#93C5FD';
          fillColor2 = '#1D4ED8';
        } else if (b.colorCategory === 'red') {
          fillColor1 = '#FCA5A5';
          fillColor2 = '#B91C1C';
        } else if (b.colorCategory === 'gray') {
          fillColor1 = '#E5E7EB';
          fillColor2 = '#374151';
        } else if (b.colorCategory === 'green') {
          fillColor1 = '#86EFAC';
          fillColor2 = '#047857';
        }

        // 3D Sphere gradient
        const ballGrad = ctx.createRadialGradient(
          -b.radius * 0.35,
          -b.radius * 0.35,
          b.radius * 0.1,
          0,
          0,
          b.radius
        );
        ballGrad.addColorStop(0, fillColor1);
        ballGrad.addColorStop(0.7, fillColor2);
        ballGrad.addColorStop(1, '#111827');

        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.fill();

        // Ball Gloss highlight
        ctx.beginPath();
        ctx.ellipse(-b.radius * 0.3, -b.radius * 0.3, b.radius * 0.45, b.radius * 0.25, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Number Circle Badge in the center
        ctx.beginPath();
        ctx.arc(0, 0, b.radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.fill();

        // Number text
        ctx.font = `900 ${Math.floor(b.radius * 0.65)}px Outfit, sans-serif`;
        ctx.fillStyle = '#0F172A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.id.toString(), 0, 1);

        ctx.restore();
      }

      // 4. Glass Sphere Foreground Reflection (Curved shine)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(
        drumCenterX - drumRadius * 0.28,
        drumCenterY - drumRadius * 0.35,
        drumRadius * 0.48,
        drumRadius * 0.26,
        -Math.PI / 6,
        0,
        Math.PI * 2
      );
      const specGrad = ctx.createLinearGradient(
        drumCenterX - drumRadius * 0.5,
        drumCenterY - drumRadius * 0.5,
        drumCenterX,
        drumCenterY
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specGrad;
      ctx.fill();

      // Bottom Golden Turbine Stand
      const standWidth = drumRadius * 1.2;
      const standY = drumCenterY + drumRadius - 8;
      const standGrad = ctx.createLinearGradient(drumCenterX - standWidth / 2, standY, drumCenterX + standWidth / 2, standY);
      standGrad.addColorStop(0, '#3A2B0E');
      standGrad.addColorStop(0.5, '#E5B842');
      standGrad.addColorStop(1, '#2E2209');

      ctx.fillStyle = standGrad;
      ctx.beginPath();
      ctx.roundRect(drumCenterX - standWidth / 2, standY, standWidth, 24, [0, 0, 12, 12]);
      ctx.fill();
      ctx.strokeStyle = '#FFE272';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [initBalls, isBlowing, airSpeed]);

  // Draw 1 Single Ball
  const drawOneBall = useCallback(() => {
    if (drawnCountRef.current >= 7) return;

    isSuctionActiveRef.current = true;
    sound.playSuction();

    setTimeout(() => {
      // Find eligible balls still inside
      const eligible = ballsRef.current.filter(b => !b.isDrawn);
      if (eligible.length === 0) return;

      // Pick one randomly
      const picked = eligible[Math.floor(Math.random() * eligible.length)];
      picked.isDrawn = true;

      const currentDrawnCount = drawnCountRef.current;
      drawnCountRef.current += 1;

      if (currentDrawnCount < 6) {
        sound.playBallReveal(currentDrawnCount);
        setDrawnNumbers(prev => [...prev, picked.id]);
      } else {
        // 7th ball is the Bonus ball
        sound.playBallReveal(6);
        setBonusNumber(picked.id);

        // Celebrate!
        setTimeout(() => {
          sound.playJackpot();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#FFE272', '#EAB308', '#3B82F6', '#EF4444', '#10B981'],
          });
        }, 500);
      }

      isSuctionActiveRef.current = false;
    }, 600);
  }, []);

  // Sequence to auto-draw all 7 balls (6 + bonus)
  const startAutoDraw = useCallback(() => {
    if (isDrawing || drawnCountRef.current >= 7) return;
    setIsDrawing(true);
    sound.playClick();

    let step = drawnCountRef.current;
    const interval = setInterval(() => {
      if (step >= 7) {
        clearInterval(interval);
        setIsDrawing(false);
        return;
      }
      drawOneBall();
      step++;
      if (step >= 7) {
        clearInterval(interval);
        setIsDrawing(false);
      }
    }, 1500);
  }, [isDrawing, drawOneBall]);

  // Reset Drum
  const resetDrum = useCallback(() => {
    sound.playClick();
    drawnCountRef.current = 0;
    setDrawnNumbers([]);
    setBonusNumber(null);
    setIsDrawing(false);
    isSuctionActiveRef.current = false;

    // Reset ball statuses
    ballsRef.current.forEach(b => {
      b.isDrawn = false;
      b.vx = (Math.random() - 0.5) * 5;
      b.vy = (Math.random() - 0.5) * 5;
    });
  }, []);

  // Notify parent when full game completed
  useEffect(() => {
    if (drawnNumbers.length === 6 && onGameCompleted) {
      const sorted = [...drawnNumbers].sort((a, b) => a - b);
      const game: LottoGame = {
        id: 'drum-' + Date.now().toString(36),
        numbers: sorted,
        bonus: bonusNumber ?? undefined,
        createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        strategy: '3D 물리 추첨기 실시간 추출',
        stats: analyzeGame(sorted),
      };
      onGameCompleted(game);
    }
  }, [drawnNumbers, bonusNumber, onGameCompleted]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-6">
      {/* Top Title & Status Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2 rounded-xl glass-obsidian-subtle border border-amber-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs uppercase tracking-widest text-amber-300 font-cinzel font-bold">
            Kinetic Air-Suction Physics Engine v2.4
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const muted = sound.toggleMute();
              setIsMuted(muted);
            }}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 transition-colors"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="text-xs text-zinc-400">
            추첨 진행: <span className="text-amber-400 font-bold">{drawnNumbers.length}/6</span>
            {bonusNumber ? ' + 보너스 완료' : ''}
          </div>
        </div>
      </div>

      {/* Main Physics Canvas Area */}
      <div className="relative w-full aspect-[16/11] max-h-[500px] flex items-center justify-center rounded-2xl overflow-hidden glass-obsidian gold-glow p-2">
        <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />

        {/* Ambient Overlay Vignette */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.85)]" />

        {/* Floating Air-Blower Status Tag */}
        <div className="absolute bottom-4 left-6 pointer-events-none flex items-center space-x-2 text-xs text-amber-200/80 bg-black/60 px-3 py-1.5 rounded-full border border-amber-500/30 backdrop-blur-md">
          <Sparkles size={14} className="text-amber-400 animate-spin" />
          <span>초정밀 공압 터빈: {airSpeed.toFixed(1)}x RPM</span>
        </div>
      </div>

      {/* Result Display Rail */}
      <div className="w-full p-5 rounded-2xl glass-obsidian border border-amber-500/30 flex flex-col items-center justify-center space-y-3">
        <div className="text-xs font-cinzel text-amber-300 tracking-widest uppercase flex items-center space-x-2">
          <Award size={16} className="text-amber-400" />
          <span>VIP Live Extraction Rail</span>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-3 min-h-[56px] py-1">
          {drawnNumbers.length === 0 ? (
            <div className="text-sm text-zinc-500 tracking-wider">
              '추첨 시작' 버튼을 누르면 물리 엔진에 의해 공이 추첨됩니다.
            </div>
          ) : (
            drawnNumbers.map((num, idx) => (
              <div key={idx} className="flex items-center space-x-1 animate-scale-up">
                <LottoBall number={num} size="lg" animate={idx === drawnNumbers.length - 1} />
              </div>
            ))
          )}

          {bonusNumber && (
            <div className="flex items-center space-x-3 ml-2 pl-3 border-l border-amber-500/30">
              <span className="text-xl font-bold text-amber-400">+</span>
              <LottoBall number={bonusNumber} size="lg" isBonus />
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="w-full flex items-center justify-between flex-wrap gap-4 px-2">
        <div className="flex items-center space-x-3">
          <button
            onClick={startAutoDraw}
            disabled={isDrawing || drawnNumbers.length >= 6}
            className="px-6 py-3 rounded-xl gold-button flex items-center space-x-2 text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play size={18} fill="currentColor" />
            <span>{isDrawing ? '추첨 진행 중...' : '자동 연속 추첨 (6+1구)'}</span>
          </button>

          <button
            onClick={drawOneBall}
            disabled={isDrawing || (drawnNumbers.length >= 6 && bonusNumber !== null)}
            className="px-4 py-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 text-sm font-semibold border border-amber-500/30 transition-all cursor-pointer disabled:opacity-40"
          >
            1구씩 수동 추첨
          </button>

          <button
            onClick={resetDrum}
            className="p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-all cursor-pointer"
            title="초기화"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Speed / Blower Toggle */}
        <div className="flex items-center space-x-4 bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800">
          <span className="text-xs text-zinc-400">송풍 강도</span>
          <input
            type="range"
            min="0.5"
            max="2.2"
            step="0.1"
            value={airSpeed}
            onChange={e => setAirSpeed(parseFloat(e.target.value))}
            className="w-24 accent-amber-400 cursor-pointer"
          />
          <button
            onClick={() => setIsBlowing(!isBlowing)}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
              isBlowing ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {isBlowing ? '송풍 ON' : '송풍 OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};
