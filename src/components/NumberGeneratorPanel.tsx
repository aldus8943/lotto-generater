import React, { useState } from 'react';
import type { GeneratorFilter, LottoGame } from '../types';
import { generateSingleGame } from '../utils/lotto';
import { sound } from '../utils/sound';
import { LottoBall } from './LottoBall';
import { Sparkles, SlidersHorizontal, Plus, Trash2, CheckCircle2, Copy, BookmarkPlus } from 'lucide-react';

interface NumberGeneratorPanelProps {
  onAddGames: (games: LottoGame[]) => void;
}

export const NumberGeneratorPanel: React.FC<NumberGeneratorPanelProps> = ({ onAddGames }) => {
  const [count, setCount] = useState<number>(5);
  const [strategy, setStrategy] = useState<GeneratorFilter['strategy']>('balanced');
  const [fixedNumbers, setFixedNumbers] = useState<number[]>([]);
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([]);
  const [oddEvenPreference, setOddEvenPreference] = useState<GeneratorFilter['oddEvenPreference']>('any');
  const [minSum, setMinSum] = useState<number>(100);
  const [maxSum, setMaxSum] = useState<number>(175);
  const [minAc, setMinAc] = useState<number>(6);
  const [maxConsecutive, setMaxConsecutive] = useState<number>(2);

  const [showFilterSettings, setShowFilterSettings] = useState<boolean>(false);
  const [numberSelectMode, setNumberSelectMode] = useState<'none' | 'fixed' | 'excluded'>('none');
  const [generatedList, setGeneratedList] = useState<LottoGame[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toggle number in fixed / excluded set
  const handleGridNumberClick = (n: number) => {
    sound.playClick();
    if (numberSelectMode === 'fixed') {
      if (fixedNumbers.includes(n)) {
        setFixedNumbers(fixedNumbers.filter(x => x !== n));
      } else {
        if (fixedNumbers.length >= 5) {
          alert('고정수는 최대 5개까지 지정할 수 있습니다.');
          return;
        }
        setFixedNumbers([...fixedNumbers, n].sort((a, b) => a - b));
        setExcludedNumbers(excludedNumbers.filter(x => x !== n));
      }
    } else if (numberSelectMode === 'excluded') {
      if (excludedNumbers.includes(n)) {
        setExcludedNumbers(excludedNumbers.filter(x => x !== n));
      } else {
        if (excludedNumbers.length >= 35) {
          alert('제외수는 최대 35개까지 지정 가능합니다.');
          return;
        }
        setExcludedNumbers([...excludedNumbers, n].sort((a, b) => a - b));
        setFixedNumbers(fixedNumbers.filter(x => x !== n));
      }
    }
  };

  const handleGenerate = () => {
    sound.playClick();
    const results: LottoGame[] = [];
    const filter: GeneratorFilter = {
      count,
      strategy,
      fixedNumbers,
      excludedNumbers,
      minSum,
      maxSum,
      oddEvenPreference,
      minAc,
      maxConsecutive,
    };

    for (let i = 0; i < count; i++) {
      results.push(generateSingleGame(filter));
    }

    setGeneratedList(results);
    sound.playJackpot();
  };

  const handleCopy = (g: LottoGame) => {
    sound.playClick();
    const text = `[로또로얄 VIP 추천] ${g.numbers.join(', ')} (합:${g.stats.sum}, 홀짝:${g.stats.oddCount}:${g.stats.evenCount})`;
    navigator.clipboard.writeText(text);
    setCopiedId(g.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSaveAll = () => {
    if (generatedList.length === 0) return;
    sound.playClick();
    onAddGames(generatedList);
    alert(`${generatedList.length}개 조합이 VIP 보관함에 성공적으로 저장되었습니다.`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6">
      {/* Configuration Card */}
      <div className="p-6 rounded-3xl glass-obsidian border border-amber-500/30 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-amber-300">
                VIP Combinatorial Algorithm Studio
              </h2>
              <p className="text-xs text-zinc-400">통계적 빅데이터와 수학적 필터를 적용한 고품격 번호 추출기</p>
            </div>
          </div>

          <button
            onClick={() => setShowFilterSettings(!showFilterSettings)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              showFilterSettings
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>고급 필터 설정</span>
          </button>
        </div>

        {/* Strategy Buttons */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">추출 알고리즘 전략</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'balanced', label: 'VIP 황금 밸런스 AI', desc: '역대 출현율 & 색상 밸런스 최적화' },
              { id: 'hot', label: '역대 최다 출현수', desc: '1위~15위 핫넘버 집중 공략' },
              { id: 'cold', label: '미출현 반등 패턴', desc: '출현 주기 긴 미출현수 타깃' },
              { id: 'fibonacci', label: '피보나치 황금비율', desc: '자연계 수열 법칙 적용' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  setStrategy(item.id as GeneratorFilter['strategy']);
                }}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  strategy === item.id
                    ? 'gold-badge border-amber-400 shadow-lg text-amber-200'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-bold text-amber-300">{item.label}</div>
                <div className="text-[11px] text-zinc-500 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Fixed / Exclude Number Badges & Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Fixed Numbers */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">고정수 지정 (반드시 포함)</span>
              <button
                onClick={() => setNumberSelectMode(numberSelectMode === 'fixed' ? 'none' : 'fixed')}
                className="text-xs text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>{numberSelectMode === 'fixed' ? '선택창 닫기' : '번호 선택'}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 min-h-[32px] flex-wrap">
              {fixedNumbers.length === 0 ? (
                <span className="text-xs text-zinc-500">지정된 고정수 없음</span>
              ) : (
                fixedNumbers.map(n => (
                  <span
                    key={n}
                    onClick={() => handleGridNumberClick(n)}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-pointer hover:bg-emerald-900"
                  >
                    {n} ×
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Excluded Numbers */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-400">제외수 지정 (절대 미포함)</span>
              <button
                onClick={() => setNumberSelectMode(numberSelectMode === 'excluded' ? 'none' : 'excluded')}
                className="text-xs text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>{numberSelectMode === 'excluded' ? '선택창 닫기' : '번호 선택'}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 min-h-[32px] flex-wrap">
              {excludedNumbers.length === 0 ? (
                <span className="text-xs text-zinc-500">지정된 제외수 없음</span>
              ) : (
                excludedNumbers.map(n => (
                  <span
                    key={n}
                    onClick={() => handleGridNumberClick(n)}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40 cursor-pointer hover:bg-rose-900"
                  >
                    {n} ×
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 1~45 Number Picker Grid */}
        {numberSelectMode !== 'none' && (
          <div className="p-4 rounded-2xl bg-[#090B10] border border-amber-500/40 flex flex-col space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                {numberSelectMode === 'fixed' ? '🎯 고정할 번호를 클릭하세요 (최대 5개)' : '🚫 제외할 번호를 클릭하세요 (최대 35개)'}
              </span>
              <button
                onClick={() => {
                  if (numberSelectMode === 'fixed') setFixedNumbers([]);
                  else setExcludedNumbers([]);
                }}
                className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>선택 비우기</span>
              </button>
            </div>

            <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
              {Array.from({ length: 45 }, (_, i) => i + 1).map(n => {
                const isFixed = fixedNumbers.includes(n);
                const isExcluded = excludedNumbers.includes(n);
                let btnStyle = 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700';

                if (isFixed) {
                  btnStyle = 'bg-emerald-500 text-black font-extrabold border-emerald-300 shadow-md scale-105';
                } else if (isExcluded) {
                  btnStyle = 'bg-rose-600/80 text-white font-extrabold border-rose-400 line-through opacity-60';
                }

                return (
                  <button
                    key={n}
                    onClick={() => handleGridNumberClick(n)}
                    className={`py-2 text-xs rounded-xl font-bold border transition-all cursor-pointer ${btnStyle}`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsible Advanced Filters */}
        {showFilterSettings && (
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-700/60 grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fadeIn">
            {/* Odd/Even */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs text-zinc-300 font-semibold">홀짝 비율</label>
              <select
                value={oddEvenPreference}
                onChange={e => setOddEvenPreference(e.target.value as GeneratorFilter['oddEvenPreference'])}
                className="w-full bg-zinc-800 text-amber-300 rounded-xl px-3 py-2 text-xs border border-zinc-700 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="any">자유 (통계상 모든 비율 허용)</option>
                <option value="3:3">3:3 (가장 높은 당첨 확률)</option>
                <option value="4:2">4:2 (홀수 우세)</option>
                <option value="2:4">2:4 (짝수 우세)</option>
              </select>
            </div>

            {/* Sum Range */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                <span>총합 구간</span>
                <span className="text-amber-400 font-bold">{minSum} ~ {maxSum}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="80"
                  max="140"
                  value={minSum}
                  onChange={e => setMinSum(parseInt(e.target.value))}
                  className="w-1/2 accent-amber-400 cursor-pointer"
                />
                <input
                  type="range"
                  min="141"
                  max="210"
                  value={maxSum}
                  onChange={e => setMaxSum(parseInt(e.target.value))}
                  className="w-1/2 accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* AC / Consecutive */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                <span>최소 AC값 / 최대 연속번호</span>
                <span className="text-amber-400 font-bold">AC {minAc}이상 / {maxConsecutive}개 이하</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={minAc}
                  onChange={e => setMinAc(parseInt(e.target.value))}
                  className="bg-zinc-800 text-amber-300 rounded-xl px-2 py-1.5 text-xs border border-zinc-700"
                >
                  <option value={5}>AC 5 이상</option>
                  <option value={6}>AC 6 이상 (권장)</option>
                  <option value={7}>AC 7 이상 (최고)</option>
                </select>
                <select
                  value={maxConsecutive}
                  onChange={e => setMaxConsecutive(parseInt(e.target.value))}
                  className="bg-zinc-800 text-amber-300 rounded-xl px-2 py-1.5 text-xs border border-zinc-700"
                >
                  <option value={1}>연속번호 불허 (0개)</option>
                  <option value={2}>최대 2연속 (권장)</option>
                  <option value={3}>최대 3연속</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Button Row */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          {/* Quantity Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400">생성 게임 수:</span>
            {[1, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => {
                  sound.playClick();
                  setCount(n);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  count === n
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {n}게임 {n === 5 && '(1세트)'}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            className="px-8 py-3.5 rounded-2xl gold-button text-sm font-extrabold uppercase tracking-wider flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles size={18} />
            <span>VIP 조합 {count}게임 일괄 추출</span>
          </button>
        </div>
      </div>

      {/* Generated Results Area */}
      {generatedList.length > 0 && (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-cinzel text-base font-bold text-amber-300">
              Generated VIP Sets ({generatedList.length})
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 rounded-xl gold-badge text-amber-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <BookmarkPlus size={15} />
                <span>전체 보관함에 담기</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            {generatedList.map((g, idx) => (
              <div
                key={g.id}
                className="p-4 sm:p-5 rounded-2xl glass-obsidian border border-amber-500/20 hover:border-amber-400/50 transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                {/* Game Label & Balls */}
                <div className="flex items-center space-x-4">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center font-bold text-xs text-amber-400">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {g.numbers.map(n => (
                      <LottoBall key={n} number={n} size="md" />
                    ))}
                  </div>
                </div>

                {/* Game Analytics Pill */}
                <div className="flex items-center space-x-3 text-xs text-zinc-400 bg-zinc-900/60 px-3.5 py-1.5 rounded-xl border border-zinc-800">
                  <span>합: <strong className="text-amber-300">{g.stats.sum}</strong></span>
                  <span>홀짝: <strong className="text-amber-300">{g.stats.oddCount}:{g.stats.evenCount}</strong></span>
                  <span>고저: <strong className="text-amber-300">{g.stats.highCount}:{g.stats.lowCount}</strong></span>
                  <span>AC: <strong className="text-amber-300">{g.stats.ac}</strong></span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(g)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                    title="번호 복사"
                  >
                    {copiedId === g.id ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onAddGames([g]);
                      alert('조합이 보관함에 저장되었습니다.');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    보관
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
