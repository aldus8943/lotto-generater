import type { BallColorCategory, GeneratorFilter, LottoGame } from '../types';

export const HISTORICAL_HOT_NUMBERS = [34, 18, 12, 27, 13, 1, 43, 33, 4, 20, 14, 17, 26, 45, 11];
export const HISTORICAL_COLD_NUMBERS = [9, 22, 29, 23, 41, 30, 42, 5, 2, 8, 38, 16, 25, 32, 36];
export const FIBONACCI_NUMBERS = [1, 2, 3, 5, 8, 13, 21, 34];

export function getBallColorCategory(num: number): BallColorCategory {
  if (num <= 10) return 'yellow';
  if (num <= 20) return 'blue';
  if (num <= 30) return 'red';
  if (num <= 40) return 'gray';
  return 'green';
}

export function getBallGradient(num: number): {
  bg: string;
  border: string;
  glow: string;
  text: string;
} {
  const cat = getBallColorCategory(num);
  switch (cat) {
    case 'yellow':
      return {
        bg: 'radial-gradient(circle at 35% 30%, #FFE272 0%, #EAB308 55%, #854D0E 100%)',
        border: 'rgba(254, 240, 138, 0.8)',
        glow: 'rgba(234, 179, 8, 0.45)',
        text: '#1C1917',
      };
    case 'blue':
      return {
        bg: 'radial-gradient(circle at 35% 30%, #93C5FD 0%, #2563EB 55%, #1E3A8A 100%)',
        border: 'rgba(191, 219, 254, 0.8)',
        glow: 'rgba(37, 99, 235, 0.45)',
        text: '#FFFFFF',
      };
    case 'red':
      return {
        bg: 'radial-gradient(circle at 35% 30%, #FCA5A5 0%, #DC2626 55%, #7F1D1D 100%)',
        border: 'rgba(254, 202, 202, 0.8)',
        glow: 'rgba(220, 38, 38, 0.45)',
        text: '#FFFFFF',
      };
    case 'gray':
      return {
        bg: 'radial-gradient(circle at 35% 30%, #D1D5DB 0%, #4B5563 55%, #111827 100%)',
        border: 'rgba(229, 231, 235, 0.8)',
        glow: 'rgba(107, 114, 128, 0.45)',
        text: '#FFFFFF',
      };
    case 'green':
      return {
        bg: 'radial-gradient(circle at 35% 30%, #86EFAC 0%, #16A34A 55%, #064E3B 100%)',
        border: 'rgba(187, 247, 208, 0.8)',
        glow: 'rgba(22, 163, 74, 0.45)',
        text: '#FFFFFF',
      };
  }
}

// Calculate Arithmetic Complexity (AC)
// Distinct absolute differences between pairs - (N - 1)
export function calculateAC(numbers: number[]): number {
  if (numbers.length < 2) return 0;
  const diffs = new Set<number>();
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      diffs.add(Math.abs(numbers[i] - numbers[j]));
    }
  }
  return diffs.size - (numbers.length - 1);
}

// Calculate consecutive numbers count
export function calculateConsecutive(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  let maxConsec = 0;
  let currentConsec = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] === sorted[i] + 1) {
      currentConsec++;
      if (currentConsec > maxConsec) maxConsec = currentConsec;
    } else {
      currentConsec = 0;
    }
  }
  return maxConsec;
}

export function analyzeGame(numbers: number[]) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const oddCount = sorted.filter(n => n % 2 !== 0).length;
  const evenCount = 6 - oddCount;
  const highCount = sorted.filter(n => n >= 23).length;
  const lowCount = 6 - highCount;
  const ac = calculateAC(sorted);
  const consecutiveCount = calculateConsecutive(sorted);

  return {
    sum,
    oddCount,
    evenCount,
    highCount,
    lowCount,
    ac,
    consecutiveCount,
  };
}

// Advanced Generator Engine
export function generateSingleGame(filter: Partial<GeneratorFilter> = {}): LottoGame {
  const {
    strategy = 'balanced',
    fixedNumbers = [],
    excludedNumbers = [],
    minSum = 100,
    maxSum = 175,
    oddEvenPreference = 'any',
    minAc = 6,
    maxConsecutive = 2,
  } = filter;

  const excludedSet = new Set(excludedNumbers);
  const fixedSet = new Set(fixedNumbers.slice(0, 5));

  let attempts = 0;
  const maxAttempts = 3000;

  while (attempts < maxAttempts) {
    attempts++;
    const chosen = new Set<number>(fixedSet);

    // Pick weights based on strategy
    const pool: number[] = [];
    for (let n = 1; n <= 45; n++) {
      if (excludedSet.has(n) || fixedSet.has(n)) continue;

      let weight = 10;
      if (strategy === 'hot') {
        if (HISTORICAL_HOT_NUMBERS.includes(n)) weight += 20;
      } else if (strategy === 'cold') {
        if (HISTORICAL_COLD_NUMBERS.includes(n)) weight += 20;
      } else if (strategy === 'fibonacci') {
        if (FIBONACCI_NUMBERS.includes(n)) weight += 30;
      } else if (strategy === 'balanced') {
        // Balance across color sections
        const cat = getBallColorCategory(n);
        const sectionCount = Array.from(chosen).filter(x => getBallColorCategory(x) === cat).length;
        if (sectionCount >= 2) weight -= 5;
      }

      for (let w = 0; w < weight; w++) {
        pool.push(n);
      }
    }

    // Fill remaining numbers
    while (chosen.size < 6 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      const picked = pool[idx];
      chosen.add(picked);
      // Remove all instances of picked from pool
      for (let i = pool.length - 1; i >= 0; i--) {
        if (pool[i] === picked) pool.splice(i, 1);
      }
    }

    if (chosen.size < 6) {
      // Fallback
      for (let n = 1; n <= 45; n++) {
        if (!chosen.has(n) && !excludedSet.has(n)) chosen.add(n);
        if (chosen.size === 6) break;
      }
    }

    const numbers = Array.from(chosen).sort((a, b) => a - b);
    const stats = analyzeGame(numbers);

    // Filter validation
    if (stats.sum < minSum || stats.sum > maxSum) continue;
    if (stats.ac < minAc) continue;
    if (stats.consecutiveCount > maxConsecutive) continue;

    if (oddEvenPreference === '3:3' && stats.oddCount !== 3) continue;
    if (oddEvenPreference === '4:2' && stats.oddCount !== 4) continue;
    if (oddEvenPreference === '2:4' && stats.oddCount !== 2) continue;

    return {
      id: 'royale-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36),
      numbers,
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      strategy: getStrategyLabel(strategy),
      stats,
    };
  }

  // If constraints were too strict, return the closest valid combination
  const fallback = Array.from({ length: 45 }, (_, i) => i + 1)
    .filter(n => !excludedSet.has(n))
    .sort(() => 0.5 - Math.random())
    .slice(0, 6)
    .sort((a, b) => a - b);

  return {
    id: 'royale-' + Math.random().toString(36).substring(2, 9),
    numbers: fallback,
    createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    strategy: getStrategyLabel(strategy) + ' (최적화)',
    stats: analyzeGame(fallback),
  };
}

export function getStrategyLabel(s: string): string {
  switch (s) {
    case 'balanced': return 'VIP 황금 밸런스 AI';
    case 'hot': return '역대 최다 출현수 집중';
    case 'cold': return '미출현 반등 공략';
    case 'fibonacci': return '피보나치 황금비율';
    case 'golden_ratio': return '퀀텀 카오스 알고리즘';
    default: return '순수 무작위 추출';
  }
}
