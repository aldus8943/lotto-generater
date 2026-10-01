import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { LottoGame, StoreBranding } from '../types';
import { sound } from '../utils/sound';
import { X, Printer, Download, Copy, FileText, Receipt, CheckCircle } from 'lucide-react';

interface PrintTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: LottoGame[];
  branding: StoreBranding;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({
  isOpen,
  onClose,
  games,
  branding,
}) => {
  const [viewMode, setViewMode] = useState<'receipt' | 'omr'>('receipt');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  // Generate QR code for the games
  useEffect(() => {
    if (!isOpen || games.length === 0) return;
    const summary = games.map(g => g.numbers.join('-')).join('/');
    const urlPayload = `https://dhlottery.co.kr/?royale_v=${encodeURIComponent(summary)}`;

    QRCode.toDataURL(urlPayload, { width: 140, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then(url => setQrUrl(url))
      .catch(() => {});
  }, [isOpen, games]);

  if (!isOpen) return null;

  // Print trigger
  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    sound.playClick();
    let csv = '게임,번호1,번호2,번호3,번호4,번호5,번호6,합계,홀짝,전략,생성일시\n';
    games.forEach((g, idx) => {
      const label = String.fromCharCode(65 + (idx % 26));
      csv += `${label},${g.numbers.join(',')},${g.stats.sum},${g.stats.oddCount}:${g.stats.evenCount},"${g.strategy}",${g.createdAt}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LottoRoyale_VIP_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Copy to clipboard
  const handleCopy = () => {
    sound.playClick();
    const text = games
      .map((g, idx) => `[${String.fromCharCode(65 + idx)}] ${g.numbers.map(n => n.toString().padStart(2, '0')).join(' ')} (합:${g.stats.sum})`)
      .join('\n');
    navigator.clipboard.writeText(`★ ${branding.storeName} VIP 로또 조합 ★\n${text}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Take up to 5 games for single sheet representation
  const displayGames = games.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl glass-obsidian border border-amber-500/40 p-6 flex flex-col space-y-5 shadow-2xl">
        {/* Header (No-print) */}
        <div className="no-print flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex bg-zinc-800 p-1 rounded-xl border border-zinc-700">
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('receipt');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'receipt' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Receipt size={14} />
                <span>영수증 복권 티켓</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('omr');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'omr' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText size={14} />
                <span>정통 OMR 슬립 카드</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl gold-button text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer size={15} />
              <span>즉시 인쇄</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas Area */}
        <div ref={printRef} className="flex justify-center p-2 sm:p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
          {viewMode === 'receipt' ? (
            /* THERMAL POS RECEIPT STYLE */
            <div className="w-full max-w-[380px] bg-white text-zinc-950 p-6 rounded-lg font-mono shadow-2xl text-xs space-y-4 print-page border border-zinc-300">
              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b-2 border-dashed border-zinc-400 pb-3">
                <div className="text-base font-black tracking-tight">{branding.storeName}</div>
                <div className="text-[11px] text-zinc-700">{branding.branchName} • {branding.phone}</div>
                <div className="text-[10px] text-zinc-600">{branding.address}</div>
                <div className="text-[10px] font-serif italic text-zinc-800 mt-1 font-semibold">"{branding.slogan}"</div>
              </div>

              {/* Transaction Meta */}
              <div className="flex justify-between text-[11px] border-b border-dashed border-zinc-300 pb-2">
                <span>발행: {new Date().toLocaleDateString('ko-KR')}</span>
                <span>제 1180회 로또 6/45</span>
              </div>

              {/* Number Rows A to E */}
              <div className="space-y-2 py-1">
                {displayGames.map((g, idx) => {
                  const label = String.fromCharCode(65 + idx);
                  return (
                    <div key={g.id} className="flex items-center justify-between font-bold text-[13px] border-b border-zinc-100 pb-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 text-center font-extrabold">{label}</span>
                        <span className="text-[11px] font-normal text-zinc-600">자율</span>
                      </div>
                      <div className="tracking-widest font-black text-black">
                        {g.numbers.map(n => n.toString().padStart(2, '0')).join(' ')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing & Barcode */}
              <div className="border-t-2 border-dashed border-zinc-400 pt-3 space-y-2">
                <div className="flex justify-between font-extrabold text-[13px]">
                  <span>금액 (5게임 1세트)</span>
                  <span>₩ {displayGames.length * 1000},000</span>
                </div>

                {/* QR Code and Mock Barcode */}
                <div className="flex items-center justify-between pt-2">
                  {qrUrl && <img src={qrUrl} alt="QR Code" className="w-20 h-20 border border-zinc-300" />}
                  <div className="flex flex-col items-end space-y-1 text-[10px]">
                    <span className="font-mono tracking-wider font-bold">SERIAL: 8392-1180-7219-0021</span>
                    <div className="w-36 h-8 bg-zinc-900 flex items-center justify-center text-white text-[9px] font-mono tracking-widest">
                      |||||||||||||||||||||||||||||||
                    </div>
                    <span className="text-zinc-500 font-mono">VERIFIED BY LOTTO ROYALE VIP</span>
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="text-[10px] text-zinc-600 text-center pt-2 leading-relaxed">
                  {branding.receiptFooter}
                </div>
              </div>
            </div>
          ) : (
            /* AUTHENTIC OMR SLIP STYLE */
            <div className="w-full max-w-[620px] bg-[#FFFBEB] text-zinc-900 p-6 rounded-xl font-sans shadow-2xl text-xs space-y-5 print-page border-2 border-[#D97706]">
              {/* OMR Header */}
              <div className="flex items-center justify-between border-b-2 border-[#D97706] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-[#D97706] text-white font-extrabold rounded text-xs">
                    6/45 OMR
                  </span>
                  <span className="font-extrabold text-base tracking-tight text-[#92400E]">
                    로또 6/45 컴퓨터용 OMR 슬립지
                  </span>
                </div>
                <div className="text-right text-[11px] text-zinc-600 font-mono font-bold">
                  {branding.storeName}
                </div>
              </div>

              {/* 5 Game Rows (A through E) */}
              <div className="flex flex-col space-y-3">
                {displayGames.map((g, gameIdx) => {
                  const label = String.fromCharCode(65 + gameIdx);
                  const numSet = new Set(g.numbers);

                  return (
                    <div key={g.id} className="flex items-center space-x-3 bg-white/70 p-2.5 rounded-lg border border-amber-200">
                      {/* Section Label */}
                      <div className="w-7 h-7 rounded bg-[#92400E] text-white font-black flex items-center justify-center text-sm shadow">
                        {label}
                      </div>

                      {/* 1~45 OMR Grid */}
                      <div className="grid grid-cols-15 gap-1 flex-1">
                        {Array.from({ length: 45 }, (_, i) => i + 1).map(n => {
                          const isMarked = numSet.has(n);
                          return (
                            <div
                              key={n}
                              className={`h-6 text-[10px] flex items-center justify-center font-bold rounded-sm border transition-all ${
                                isMarked
                                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-inner'
                                  : 'bg-white text-zinc-500 border-zinc-300'
                              }`}
                            >
                              {n}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instructions */}
              <div className="flex items-center justify-between text-[11px] text-zinc-600 border-t border-amber-300 pt-3">
                <span>※ 컴퓨터용 사인펜 마킹 완료 상태로 인쇄됩니다.</span>
                <span className="font-bold text-[#92400E]">1인 1회 10만원 초과 구매 불가</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (No-print) */}
        <div className="no-print flex items-center justify-between border-t border-zinc-800 pt-4 flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {isCopied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{isCopied ? '복사됨' : '텍스트 복사'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>CSV/엑셀 저장</span>
            </button>
          </div>

          <div className="text-xs text-zinc-400">
            총 <strong className="text-amber-400">{games.length}</strong>개 조합 준비됨
          </div>
        </div>
      </div>
    </div>
  );
};
