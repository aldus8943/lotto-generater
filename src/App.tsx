import { useState, useEffect } from 'react';
import type { LottoGame, StoreBranding } from './types';
import { PhysicsDrum } from './components/PhysicsDrum';
import { ScratchCard } from './components/ScratchCard';
import { NumberGeneratorPanel } from './components/NumberGeneratorPanel';
import { SavedGamesPanel } from './components/SavedGamesPanel';
import { BroadcastModal } from './components/BroadcastModal';
import { BrandingSettingsModal } from './components/BrandingSettingsModal';
import { PrintTicketModal } from './components/PrintTicketModal';
import { SolutionDocsModal } from './components/SolutionDocsModal';
import { sound } from './utils/sound';
import {
  Sparkles,
  Tv,
  Building2,
  Gem,
  Volume2,
  VolumeX,
  Layers,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';

const DEFAULT_BRANDING: StoreBranding = {
  storeName: '골든 잭팟 로또명당',
  branchName: 'VIP 플래그십 본점',
  phone: '02-777-7777',
  slogan: '행운과 품격이 머무는 1등 당첨의 명당',
  address: '서울특별시 강남구 테헤란로 100 로얄빌딩 1층',
  customLogoUrl: '',
  receiptFooter: '※ 당첨금은 지급개시일로부터 1년 이내에 수령하셔야 합니다.',
  licenseKey: 'ROYALE-B2B-VIP-ENTERPRISE-100M',
};

export function App() {
  const [activeTab, setActiveTab] = useState<'drum' | 'scratch' | 'studio' | 'vault'>('drum');
  const [savedGames, setSavedGames] = useState<LottoGame[]>(() => {
    try {
      const stored = localStorage.getItem('lotto_royale_saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [branding, setBranding] = useState<StoreBranding>(() => {
    try {
      const stored = localStorage.getItem('lotto_royale_branding');
      return stored ? JSON.parse(stored) : DEFAULT_BRANDING;
    } catch {
      return DEFAULT_BRANDING;
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Sync saved games to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lotto_royale_saved', JSON.stringify(savedGames));
    } catch {
      // ignore
    }
  }, [savedGames]);

  // Sync branding to localStorage
  const handleSaveBranding = (newBranding: StoreBranding) => {
    setBranding(newBranding);
    try {
      localStorage.setItem('lotto_royale_branding', JSON.stringify(newBranding));
    } catch {
      // ignore
    }
  };

  const handleAddGame = (game: LottoGame) => {
    setSavedGames(prev => [game, ...prev]);
  };

  const handleAddBatchGames = (games: LottoGame[]) => {
    setSavedGames(prev => [...games, ...prev]);
  };

  const handleDeleteGame = (id: string) => {
    setSavedGames(prev => prev.filter(g => g.id !== id));
  };

  const handleClearAll = () => {
    sound.playClick();
    setSavedGames([]);
  };

  return (
    <div className="min-h-screen bg-[#06070B] text-[#E2E4EE] flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      {/* Background Decorative Gold Ambient Fog */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Main Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 glass-obsidian px-4 sm:px-8 py-3.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Store Branding Name */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('drum')}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 p-[1.5px] shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                <div className="w-full h-full bg-[#0D0F17] rounded-[14px] flex items-center justify-center font-cinzel font-black text-amber-300 text-xl">
                  7
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center text-[9px] font-black shadow-md">
                VIP
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-cinzel text-lg sm:text-xl font-black gold-gradient-text tracking-wide">
                  LOTTO ROYALE
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                  ₩100만 원 프리미엄
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                {branding.storeName} ({branding.branchName})
              </span>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Broadcast Trigger */}
            <button
              onClick={() => {
                sound.playClick();
                setIsBroadcastOpen(true);
              }}
              className="px-3 sm:px-4 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg hover:shadow-rose-900/30 cursor-pointer"
            >
              <Tv size={15} className="text-rose-400 animate-pulse" />
              <span className="hidden md:inline">스트리머 방송 모드</span>
              <span className="md:hidden">방송</span>
            </button>

            {/* B2B Branding Engine Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsBrandingOpen(true);
              }}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              title="상업용 매장 브랜딩 설정"
            >
              <Building2 size={16} className="text-amber-400" />
              <span className="hidden lg:inline">매장 브랜딩 설정</span>
            </button>

            {/* Turnkey Solution Docs Manual Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsDocsOpen(true);
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl gold-badge text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              title="100만 원 솔루션 매뉴얼"
            >
              <Gem size={15} />
              <span className="hidden lg:inline">솔루션 가이드</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                const muted = sound.toggleMute();
                setIsMuted(muted);
              }}
              className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-amber-400 transition-colors cursor-pointer"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 flex flex-col space-y-8 flex-1">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-center">
          <div className="flex items-center p-1.5 rounded-2xl glass-obsidian border border-amber-500/30 shadow-2xl max-w-full overflow-x-auto">
            {[
              { id: 'drum', label: '3D 물리 추첨기', icon: Flame, badge: 'PHYSICS' },
              { id: 'scratch', label: 'VIP 골드 스크래치', icon: Award, badge: '24K FOIL' },
              { id: 'studio', label: '빅데이터 생성 스튜디오', icon: Sparkles, badge: 'AI ALGO' },
              { id: 'vault', label: '보관함 & 티켓 인쇄', icon: Layers, badge: `${savedGames.length}` },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(tab.id as typeof activeTab);
                  }}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'gold-button text-black shadow-lg scale-102'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-black text-amber-300' : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="w-full flex justify-center animate-fadeIn">
          {activeTab === 'drum' && (
            <PhysicsDrum onGameCompleted={handleAddGame} />
          )}

          {activeTab === 'scratch' && (
            <ScratchCard onSaveGame={handleAddGame} />
          )}

          {activeTab === 'studio' && (
            <NumberGeneratorPanel onAddGames={handleAddBatchGames} />
          )}

          {activeTab === 'vault' && (
            <SavedGamesPanel
              games={savedGames}
              onDeleteGame={handleDeleteGame}
              onClearAll={handleClearAll}
              onOpenPrintModal={() => setIsPrintOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Floating Bottom Quick Bar */}
      <footer className="w-full border-t border-zinc-800/80 bg-[#07080E]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4 text-xs text-zinc-500">
          <div className="flex items-center space-x-3">
            <span className="font-cinzel font-bold text-amber-400/80">LOTTO ROYALE VIP 6/45</span>
            <span>•</span>
            <span>한화 1,000,000원 상당 상업용 정품 라이선스 솔루션</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <BookOpen size={13} />
              <span>수익화 및 납품 가이드 보기</span>
            </button>
            <span>•</span>
            <span>Copyright 2026. All Rights Reserved.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        storeName={branding.storeName}
      />

      <BrandingSettingsModal
        isOpen={isBrandingOpen}
        onClose={() => setIsBrandingOpen(false)}
        branding={branding}
        onSaveBranding={handleSaveBranding}
      />

      <PrintTicketModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        games={savedGames}
        branding={branding}
      />

      <SolutionDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}

export default App;
