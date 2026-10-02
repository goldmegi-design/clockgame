import React, { useState } from 'react';
import { StudentProfile, StickerItem, TeacherCoupon } from '../../types/game';
import { sound } from '../../utils/sound';
import { STAGES } from '../../data/curriculum';
import { TeacherCouponModal } from './TeacherCouponModal';
import { storage } from '../../utils/storage';
import { Award, Gift, Sparkles, Star, CheckCircle2, ChevronRight, Lock } from 'lucide-react';

interface StickerBookProps {
  profile: StudentProfile;
  onRefreshProfile: () => void;
  onBackToMap: () => void;
}

export const StickerBook: React.FC<StickerBookProps> = ({
  profile,
  onRefreshProfile,
  onBackToMap,
}) => {
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<TeacherCoupon | null>(null);

  const TARGET_STICKERS = 12;
  const totalStickersCount = profile.stickers.length;
  const progressPercent = Math.min(100, Math.round((totalStickersCount / TARGET_STICKERS) * 100));
  const isEligibleForCoupon = totalStickersCount >= TARGET_STICKERS;

  // Find or generate coupon if eligible
  const handleOpenCoupon = () => {
    sound.playSticker();
    const coupon = storage.generateCouponIfEligible(profile);
    if (coupon) {
      setActiveCoupon(coupon);
    } else if (profile.coupons.length > 0) {
      setActiveCoupon(profile.coupons[profile.coupons.length - 1]);
    }
  };

  const getStickerColor = (grade: StickerItem['grade']) => {
    switch (grade) {
      case 'GOLD':
        return {
          border: 'border-amber-400',
          bg: 'from-amber-400 to-yellow-500',
          shadow: 'shadow-amber-500/40',
          text: 'text-amber-300',
          badge: '🥇 골드',
        };
      case 'SILVER':
        return {
          border: 'border-slate-300',
          bg: 'from-slate-200 to-slate-400',
          shadow: 'shadow-slate-400/30',
          text: 'text-slate-200',
          badge: '🥈 실버',
        };
      case 'BRONZE':
        return {
          border: 'border-amber-700',
          bg: 'from-amber-700 to-orange-800',
          shadow: 'shadow-orange-800/30',
          text: 'text-amber-600',
          badge: '🥉 브론즈',
        };
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-fade-in">
      {/* Top Banner / Breadcrumb */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-brick text-amber-400 flex items-center gap-2.5">
            <Award className="w-8 h-8 text-amber-400" />
            내 디지털 스티커 북
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            시계탑 오비의 6단계(10개 차시)를 탐험하고 획득한 영광의 로블록스 시계 스티커 컬렉션입니다.
          </p>
        </div>

        <button
          onClick={onBackToMap}
          className="brick-btn-yellow px-4 py-2 rounded-xl text-xs font-brick flex items-center gap-1.5"
        >
          오비 지도로 돌아가기
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Target Progress & Teacher Coupon Unlock Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 shadow-xl mb-8 relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="w-full md:w-3/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-400 tracking-wider">
                선생님 보상 교환 달성도
              </span>
              <span className="text-xs text-slate-400">
                (목표: 12개 스티커)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-5 p-1 border border-slate-700 shadow-inner flex items-center">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent >= 20 && (
                  <span className="text-[10px] font-brick text-slate-950">
                    {progressPercent}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-slate-300 mt-2">
              <span>
                현재 획득: <span className="text-amber-400 font-brick text-sm">{totalStickersCount}</span>개
              </span>
              <span>
                {isEligibleForCoupon
                  ? '🎉 목표 12개 달성 완료!'
                  : `🎁 쿠폰 발급까지 ${TARGET_STICKERS - totalStickersCount}개 남음`}
              </span>
            </div>
          </div>

          {/* Coupon Action Button */}
          <div className="w-full md:w-auto flex flex-col items-center">
            {isEligibleForCoupon ? (
              <button
                type="button"
                onClick={handleOpenCoupon}
                className="w-full md:w-auto brick-btn-yellow px-6 py-3.5 rounded-2xl font-brick text-sm flex items-center justify-center gap-2 shadow-lg animate-pulse"
              >
                <Gift className="w-5 h-5 text-slate-950" />
                🎁 [선생님 칭찬 상품 교환권] 열기!
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-400">
                <Lock className="w-4 h-4 text-slate-500" />
                스티커 12개 모으면 쿠폰이 열려요!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Stages & Sticker Slots (6 Stages) */}
      <div className="space-y-6">
        <h2 className="text-lg font-brick text-slate-200 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          스테이지별 획득 스티커 현황 (최대 18개)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STAGES.map((stage) => {
            const stageProgress = profile.stageProgress[stage.id];
            const stageStickers = profile.stickers.filter((s) => s.stageId === stage.id);
            const isCleared = stageProgress?.cleared;

            return (
              <div
                key={stage.id}
                className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-500 transition shadow-md bg-studs"
              >
                {/* Stage Header */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                    <span className="text-amber-400">{stage.lessonRange}</span>
                    {isCleared ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        클리어 ({stageProgress.score}점)
                      </span>
                    ) : (
                      <span className="text-slate-500">도전 전</span>
                    )}
                  </div>
                  <h3 className="text-base font-brick text-white truncate">
                    {stage.id}. {stage.title}
                  </h3>
                </div>

                {/* 3 Sticker Slots per Stage */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  {[0, 1, 2].map((slotIdx) => {
                    const sticker = stageStickers[slotIdx];

                    if (sticker) {
                      const colorStyle = getStickerColor(sticker.grade);
                      return (
                        <div
                          key={`earned-${stage.id}-${slotIdx}`}
                          onClick={() => {
                            sound.playSticker();
                            setSelectedSticker(sticker);
                          }}
                          className={`cursor-pointer group flex flex-col items-center justify-center p-2.5 rounded-xl border-2 ${colorStyle.border} bg-gradient-to-b from-slate-900 to-slate-800 hover:scale-105 transition shadow-lg ${colorStyle.shadow}`}
                        >
                          {/* 3D Roblox Clock Sticker Medal Graphic */}
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${colorStyle.bg} flex items-center justify-center border-2 border-slate-900 shadow-md group-hover:rotate-6 transition`}
                          >
                            <span className="text-xl">⏱️</span>
                          </div>
                          <span className={`text-[10px] font-brick mt-1.5 ${colorStyle.text}`}>
                            {colorStyle.badge}
                          </span>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={`empty-${stage.id}-${slotIdx}`}
                          className="flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50"
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-800/40 flex items-center justify-center text-slate-600">
                            <Lock className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] text-slate-600 font-semibold mt-1.5">
                            미획득
                          </span>
                        </div>
                      );
                    }
                  })}
                </div>

                {/* Score Rule reminder */}
                <div className="text-[11px] text-slate-400 bg-slate-900/70 p-2 rounded-lg text-center">
                  100점: 🥇 3개 | 80점 이상: 🥈 2개 | 통과: 🥉 1개
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticker Detail Popup Modal */}
      {selectedSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 text-center text-white shadow-2xl relative">
            <div className="text-5xl mb-3 animate-bounce">⏱️</div>
            <div className="inline-block px-3 py-1 bg-amber-400 text-slate-950 font-brick text-xs rounded-full mb-2">
              {selectedSticker.grade === 'GOLD'
                ? '골드 로블록스 시계 스티커'
                : selectedSticker.grade === 'SILVER'
                ? '실버 로블록스 시계 스티커'
                : '브론즈 로블록스 시계 스티커'}
            </div>
            <h3 className="text-xl font-brick text-amber-300 mb-1">
              {selectedSticker.name}
            </h3>
            <p className="text-xs text-slate-300 mb-4">{selectedSticker.description}</p>

            <div className="bg-slate-800 p-3 rounded-xl text-xs space-y-1 text-slate-300 text-left mb-5">
              <div>📍 획득 스테이지: {selectedSticker.stageTitle}</div>
              <div>🎯 달성 점수: {selectedSticker.score}점</div>
              <div>📅 획득 일시: {selectedSticker.earnedAt}</div>
            </div>

            <button
              onClick={() => setSelectedSticker(null)}
              className="brick-btn-yellow w-full py-2.5 rounded-xl font-brick text-sm"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}

      {/* Teacher Coupon Modal */}
      {activeCoupon && (
        <TeacherCouponModal
          coupon={activeCoupon}
          profile={profile}
          onClose={() => setActiveCoupon(null)}
          onRedeemSuccess={() => {
            onRefreshProfile();
            setActiveCoupon(null);
          }}
        />
      )}
    </div>
  );
};
