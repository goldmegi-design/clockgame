import React, { useState } from 'react';
import { TeacherCoupon, StudentProfile } from '../../types/game';
import { AvatarRenderer } from '../Avatar/AvatarRenderer';
import { storage } from '../../utils/storage';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, Gift, X, Sparkles, KeyRound } from 'lucide-react';

interface TeacherCouponModalProps {
  coupon: TeacherCoupon;
  profile: StudentProfile;
  onClose: () => void;
  onRedeemSuccess: () => void;
}

export const TeacherCouponModal: React.FC<TeacherCouponModalProps> = ({
  coupon,
  profile,
  onClose,
  onRedeemSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [teacherNote, setTeacherNote] = useState('');

  const handleTeacherApprove = () => {
    // Default PIN: 1234 or teacher confirmation
    if (pin === '1234' || pin === '0000' || pin.trim() === '') {
      const ok = storage.redeemCoupon(coupon.id, teacherNote.trim() || '시계탑 오비 탈출 성실히 완료!');
      if (ok) {
        sound.playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        onRedeemSuccess();
      }
    } else {
      sound.playWrong();
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 to-amber-100 rounded-3xl p-1 shadow-2xl border-4 border-amber-400">
        {/* Golden Sparkle Glow Effect */}
        <div className="absolute -top-4 -right-4 bg-amber-400 text-slate-950 p-2.5 rounded-2xl shadow-xl flex items-center gap-1 border-2 border-amber-600 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-900" />
          <span className="text-xs font-brick">공식 인증 쿠폰</span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 bg-white/80 rounded-full transition shadow"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Coupon Card Container */}
        <div className="p-6 md:p-8 flex flex-col items-center text-center text-slate-900 bg-white rounded-[22px] border-2 border-dashed border-amber-300">
          {/* Header Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-100 border border-amber-400 rounded-full text-amber-900 text-xs font-bold mb-4">
            <Gift className="w-4 h-4 text-amber-600" />
            목표 스티커 {coupon.targetStickerCount}개 달성 축하 선물!
          </div>

          <h2 className="text-2xl md:text-3xl font-brick text-amber-600 tracking-wide mb-1">
            🎁 선생님 칭찬 상품 교환권
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            초등학교 2학년 시각과 시간 10차시 오비 마스터 인증
          </p>

          {/* Student Profile & Avatar Showcase */}
          <div className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-around mb-6 border-2 border-amber-400 shadow-md">
            <AvatarRenderer avatar={profile.avatar} size="md" animation="celebrate" />
            <div className="text-left">
              <div className="text-xs text-amber-300 font-semibold">용감한 브릭 탐험가</div>
              <div className="text-xl font-brick text-white">{profile.name}</div>
              <div className="text-xs text-slate-300 mt-1">
                모은 스티커: <span className="text-amber-400 font-bold">{coupon.currentStickers}개</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                쿠폰 번호: {coupon.couponCode}
              </div>
            </div>
          </div>

          {/* Status Display */}
          {coupon.redeemed ? (
            /* REDEEMED STAMP */
            <div className="w-full bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 flex flex-col items-center">
              <div className="flex items-center gap-2 text-emerald-700 font-brick text-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                상품 수령 완료! 참 잘했어요!
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                선생님 확인 일시: {coupon.redeemedAt || '방금 전'}
              </p>
              {coupon.teacherNote && (
                <div className="mt-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
                  💌 선생님 메시지: "{coupon.teacherNote}"
                </div>
              )}
            </div>
          ) : (
            /* UNREDEEMED - WAITING FOR TEACHER */
            <div className="w-full space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
                👉 <span className="font-bold">이 화면을 선생님께 보여드리고</span> 상품(칭찬 스티커, 간식, 학용품 등)을 선물로 받으세요!
              </div>

              {!showPinInput ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playBrickSnap();
                    setShowPinInput(true);
                  }}
                  className="w-full brick-btn-yellow py-3.5 rounded-2xl font-brick text-base flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  [선생님 전용] 상품 전달 확인하기
                </button>
              ) : (
                <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      선생님 승인 확인 (기본 비밀번호: 1234)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPinInput(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      닫기
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="비밀번호 1234"
                      className="w-28 px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-center text-sm font-mono font-bold outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={teacherNote}
                      onChange={(e) => setTeacherNote(e.target.value)}
                      placeholder="칭찬 한마디 (선택)"
                      className="flex-1 px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  {pinError && (
                    <p className="text-xs text-red-600 font-bold">
                      비밀번호가 올바르지 않습니다. (기본값: 1234)
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleTeacherApprove}
                    className="w-full brick-btn-green py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    [상품 전달 완료] 승인 도장 찍기
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer note */}
          <p className="text-[11px] text-slate-400 mt-5">
            발급일: {coupon.earnedDate} · 로블록스 수학 탐정 아카데미
          </p>
        </div>
      </div>
    </div>
  );
};
