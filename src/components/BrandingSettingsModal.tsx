import React, { useState } from 'react';
import type { StoreBranding } from '../types';
import { sound } from '../utils/sound';
import { X, Building2, Save, RotateCcw, CheckCircle, ShieldCheck } from 'lucide-react';

interface BrandingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: StoreBranding;
  onSaveBranding: (branding: StoreBranding) => void;
}

export const BrandingSettingsModal: React.FC<BrandingSettingsModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSaveBranding,
}) => {
  const [form, setForm] = useState<StoreBranding>(branding);
  const [isSavedAlert, setIsSavedAlert] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof StoreBranding, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playJackpot();
    onSaveBranding(form);
    setIsSavedAlert(true);
    setTimeout(() => {
      setIsSavedAlert(false);
      onClose();
    }, 1200);
  };

  const handleResetDefault = () => {
    sound.playClick();
    const defaults: StoreBranding = {
      storeName: '골든 잭팟 로또명당',
      branchName: 'VIP 플래그십 본점',
      phone: '02-777-7777',
      slogan: '행운과 품격이 머무는 1등 당첨의 명당',
      address: '서울특별시 강남구 테헤란로 100 로얄빌딩 1층',
      customLogoUrl: '',
      receiptFooter: '※ 당첨금은 지급개시일로부터 1년 이내에 수령하셔야 합니다.',
      licenseKey: 'ROYALE-B2B-VIP-ENTERPRISE-100M',
    };
    setForm(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-obsidian border border-amber-500/40 p-6 sm:p-8 flex flex-col space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl gold-badge flex items-center justify-center text-amber-400">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-amber-300">
                B2B Custom Branding Engine
              </h2>
              <p className="text-xs text-zinc-400">판매점 상호 및 영수증/티켓 맞춤 브랜딩 설정</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* License Badge */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck size={20} className="text-amber-400" />
            <div>
              <div className="text-xs font-bold text-amber-300">상업용 라이선스 인증됨</div>
              <div className="text-[11px] font-mono text-zinc-400">{form.licenseKey}</div>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-400 text-black font-extrabold uppercase">
            Turnkey Edition
          </span>
        </div>

        {/* Branding Form */}
        <form onSubmit={handleSave} className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">복권방 상호명 (브랜드)</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={e => handleChange('storeName', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                placeholder="예: 골든 잭팟 로또명당"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">지점명 / 호점</label>
              <input
                type="text"
                value={form.branchName}
                onChange={e => handleChange('branchName', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                placeholder="예: VIP 본점"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">대표 전화번호</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                placeholder="예: 02-777-7777"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">홍보 슬로건 문구</label>
              <input
                type="text"
                value={form.slogan}
                onChange={e => handleChange('slogan', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                placeholder="예: 행운과 품격이 머무는 곳"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">사업장 주소 (영수증에 인쇄됨)</label>
            <input
              type="text"
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
              placeholder="예: 서울특별시 서초구 강남대로 100"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">영수증 하단 안내문</label>
            <textarea
              rows={2}
              value={form.receiptFooter}
              onChange={e => handleChange('receiptFooter', e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400 resize-none"
              placeholder="영수증 맨 아래 인쇄될 법적/영업적 안내문구"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>기본값 복원</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl gold-button text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2 cursor-pointer"
            >
              <Save size={16} />
              <span>브랜딩 설정 저장</span>
            </button>
          </div>
        </form>

        {isSavedAlert && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>상업용 브랜딩 설정이 성공적으로 저장되었습니다!</span>
          </div>
        )}
      </div>
    </div>
  );
};
