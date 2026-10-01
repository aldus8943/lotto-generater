import React, { useState } from 'react';
import type { LottoGame } from '../types';
import { LottoBall } from './LottoBall';
import { sound } from '../utils/sound';
import { Trash2, Printer, Download, Sparkles, CheckCircle2, Copy } from 'lucide-react';

interface SavedGamesPanelProps {
  games: LottoGame[];
  onDeleteGame: (id: string) => void;
  onClearAll: () => void;
  onOpenPrintModal: () => void;
}

export const SavedGamesPanel: React.FC<SavedGamesPanelProps> = ({
  games,
  onDeleteGame,
  onClearAll,
  onOpenPrintModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (g: LottoGame) => {
    sound.playClick();
    const text = `[로또로얄 VIP] ${g.numbers.join(', ')} (합:${g.stats.sum})`;
    navigator.clipboard.writeText(text);
    setCopiedId(g.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportCSV = () => {
    sound.playClick();
    let csv = '게임,번호1,번호2,번호3,번호4,번호5,번호6,합계,홀짝,AC,연속번호,전략,저장일시\n';
    games.forEach((g, idx) => {
      const label = String.fromCharCode(65 + (idx % 26));
      csv += `${label},${g.numbers.join(',')},${g.stats.sum},${g.stats.oddCount}:${g.stats.evenCount},${g.stats.ac},${g.stats.consecutiveCount},"${g.strategy}",${g.createdAt}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LottoRoyale_Saved_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-6 rounded-3xl glass-obsidian border border-amber-500/30 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl gold-badge flex items-center justify-center text-amber-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-amber-300">
              VIP Vault & Saved Combinations
            </h2>
            <p className="text-xs text-zinc-400">
              저장된 행운의 번호 조합 총 <strong className="text-amber-400">{games.length}</strong>개 보관 중
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenPrintModal}
            disabled={games.length === 0}
            className="px-4 py-2.5 rounded-xl gold-button text-xs font-extrabold flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Printer size={15} />
            <span>OMR / 영수증 티켓 출력</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={games.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Download size={15} />
            <span>CSV 저장</span>
          </button>

          <button
            onClick={() => {
              if (confirm('저장된 모든 조합을 삭제하시겠습니까?')) {
                onClearAll();
              }
            }}
            disabled={games.length === 0}
            className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 disabled:opacity-40 cursor-pointer"
            title="전체 비우기"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Games List */}
      {games.length === 0 ? (
        <div className="p-16 rounded-3xl glass-obsidian border border-dashed border-zinc-800 flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600">
            <Sparkles size={22} />
          </div>
          <p className="text-sm font-semibold text-zinc-400">보관된 번호가 아직 없습니다.</p>
          <p className="text-xs text-zinc-600">
            3D 물리 추첨기, 스크래치 복권, 또는 빅데이터 생성기에서 번호를 추출하여 보관해보세요!
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {games.map((g, idx) => (
            <div
              key={g.id}
              className="p-4 sm:p-5 rounded-2xl glass-obsidian border border-amber-500/20 hover:border-amber-400/40 transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-300">
                  {idx + 1}
                </div>
                <div className="flex items-center space-x-2">
                  {g.numbers.map(n => (
                    <LottoBall key={n} number={n} size="md" />
                  ))}
                  {g.bonus && (
                    <div className="flex items-center space-x-1.5 ml-1 pl-2 border-l border-zinc-700">
                      <span className="text-xs text-amber-400 font-bold">+</span>
                      <LottoBall number={g.bonus} size="md" isBonus />
                    </div>
                  )}
                </div>
              </div>

              {/* Stats & Meta */}
              <div className="flex items-center space-x-4 text-xs text-zinc-400">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[11px] text-amber-400 font-semibold">{g.strategy}</span>
                  <span className="text-[10px] text-zinc-500">{g.createdAt}</span>
                </div>
                <div className="bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center space-x-2">
                  <span>합: <strong className="text-amber-300">{g.stats.sum}</strong></span>
                  <span>AC: <strong className="text-amber-300">{g.stats.ac}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(g)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                  title="복사"
                >
                  {copiedId === g.id ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onDeleteGame(g.id);
                  }}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 transition-colors cursor-pointer"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
