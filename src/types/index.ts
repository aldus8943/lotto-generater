export type BallColorCategory = 'yellow' | 'blue' | 'red' | 'gray' | 'green';

export interface LottoNumber {
  value: number;
  color: BallColorCategory;
}

export interface LottoGame {
  id: string;
  numbers: number[];
  bonus?: number;
  createdAt: string;
  strategy: string;
  stats: {
    sum: number;
    oddCount: number;
    evenCount: number;
    highCount: number; // 23~45
    lowCount: number;  // 1~22
    ac: number;        // Arithmetic Complexity
    consecutiveCount: number;
  };
}

export interface StoreBranding {
  storeName: string;
  branchName: string;
  phone: string;
  slogan: string;
  address: string;
  customLogoUrl: string;
  receiptFooter: string;
  licenseKey: string;
}

export interface GeneratorFilter {
  count: number;
  strategy: 'balanced' | 'hot' | 'cold' | 'random' | 'fibonacci' | 'golden_ratio';
  fixedNumbers: number[];
  excludedNumbers: number[];
  minSum: number;
  maxSum: number;
  oddEvenPreference: 'any' | '3:3' | '4:2' | '2:4';
  minAc: number;
  maxConsecutive: number;
}
