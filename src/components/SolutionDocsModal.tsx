import React from 'react';
import { X, Gem, CheckCircle2, DollarSign, Rocket, Tv, Store, Award } from 'lucide-react';
import { sound } from '../utils/sound';

interface SolutionDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SolutionDocsModal: React.FC<SolutionDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl glass-obsidian border-2 border-amber-500/50 p-6 sm:p-9 flex flex-col space-y-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl gold-badge flex items-center justify-center text-amber-300 shadow-xl">
              <Gem size={26} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-cinzel text-xl sm:text-2xl font-black gold-gradient-text tracking-wide">
                  LottoRoyale VIP Commercial Solution
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase">
                  ₩1,000,000 VALUE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">상업용 턴키 솔루션 가치 제안서 및 수익화 비즈니스 매뉴얼</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 100만 원 상품성 가치 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/25 flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
              <Award size={18} />
              <span>독보적 시각 연출</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              HTML5 Canvas 기반 초정밀 3D 볼 물리 추첨기와 24K 골드 실물 스크래치 복권 연출로 일반 생성기와 차원이 다른 압도적 몰입감 제공.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/25 flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
              <Tv size={18} />
              <span>유튜브/스트리머 방송 모드</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              실시간 방송용 풀스크린 긴장감 연출, 심장박동 음향, 스포트라이트 개봉 연출로 로또 크리에이터에게 즉시 납품 가능.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/25 flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
              <Store size={18} />
              <span>B2B 복권방 턴키 솔루션</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              점포명·슬로건·주소 커스텀 브랜딩, 실제 로또 6/45 OMR 마킹 카드 및 POS 영수증 완벽 출력 엔진 탑재.
            </p>
          </div>
        </div>

        {/* 4대 실전 수익화 비즈니스 모델 */}
        <div className="flex flex-col space-y-3">
          <h3 className="font-cinzel text-base font-bold text-amber-300 flex items-center space-x-2">
            <DollarSign size={18} className="text-amber-400" />
            <span>구매자(바이어)를 위한 4가지 실전 수익화 모델</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400">모델 1: 복권 명당 오프라인 매장 납품</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                전국 로또 복권방 점주에게 태블릿 키오스크용 프리미엄 번호 추천 솔루션으로 납품 (점포당 설치비 100만~150만원 수익).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400">모델 2: 유튜브/치지직 로또 방송 스튜디오</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                매주 토요일 생방송 로또 추첨 콘텐츠 진행. 화면 내 후원 유도, 멤버십 전용 VIP 추천 조합 배포로 월 구독 수익 창출.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400">모델 3: 온라인 VIP 유료 멤버십 사이트</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                도메인을 연결하여 1등 당첨기원 VIP 번호 추출 회원제 서비스 런칭 (월 9,900원~29,900원 유료 결제 연동).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400">모델 4: 크몽/탈잉 턴키 소프트웨어 양도 재판매</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                풀소스코드와 배포 가이드를 포함하여 부업/사업을 준비하는 구매자에게 턴키 패키지로 건당 100만원에 라이선스 판매.
              </p>
            </div>
          </div>
        </div>

        {/* 기술 및 배포 아키텍처 */}
        <div className="p-5 rounded-2xl bg-[#090B10] border border-amber-500/30 flex flex-col space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
            <Rocket size={16} />
            <span>원클릭 배포 & 무설치 독립 실행 (Zero Dependency)</span>
          </div>
          <div className="text-xs text-zinc-400 space-y-2 leading-relaxed">
            <div className="flex items-start space-x-2">
              <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span><strong>무외부 종속성 사운드:</strong> 외부 mp3 링크 없이 Web Audio API로 신디사이징되어 네트워크 차단 환경이나 오프라인에서도 100% 정상 작동합니다.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span><strong>초고속 빌드 & 정적 호스팅:</strong> Vite + React + Tailwind 기반으로 <code className="text-amber-300 bg-zinc-800 px-1.5 py-0.5 rounded">npm run build</code> 한 번으로 dist 폴더가 생성되며 Vercel, Netlify, Cafe24 어디든 1초 만에 무료 배포 가능합니다.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-500">
          <span>LOTTO ROYALE VIP COMMERCIAL LICENSE • ALL RIGHTS RESERVED</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl gold-button text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            확인 및 솔루션 사용 시작
          </button>
        </div>
      </div>
    </div>
  );
};
