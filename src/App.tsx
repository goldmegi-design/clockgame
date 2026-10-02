/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentProfile, StageDefinition, DifficultyLevel } from './types/game';
import { storage } from './utils/storage';
import { sound } from './utils/sound';
import { STAGES } from './data/curriculum';
import { AvatarRenderer } from './components/Avatar/AvatarRenderer';
import { AvatarCustomizer } from './components/Avatar/AvatarCustomizer';
import { StageRunner } from './components/Stages/StageRunner';
import { StickerBook } from './components/Stickers/StickerBook';
import { TeacherCouponModal } from './components/Stickers/TeacherCouponModal';
import { TeacherDashboard } from './components/Teacher/TeacherDashboard';

import heroImg from './assets/images/roblox_clock_tower_hero_1790898936027.jpg';
import bossImg from './assets/images/roblox_obby_stage_boss_1790898948284.jpg';

import {
  Volume2,
  VolumeX,
  Award,
  Sparkles,
  Play,
  Lock,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Settings,
  HelpCircle,
  RotateCcw,
  Tablet,
  X,
} from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile>(() => storage.getCurrentProfile());
  const [activeView, setActiveView] = useState<'MAP' | 'STAGE' | 'STICKERS' | 'ADMIN'>('MAP');
  const [activeStage, setActiveStage] = useState<StageDefinition | null>(null);

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [activeCouponModal, setActiveCouponModal] = useState(false);
  const [showPortraitTip, setShowPortraitTip] = useState(false);

  // Tablet orientation check
  useEffect(() => {
    const checkOrientation = () => {
      // If width < height and width < 1024, user is holding tablet/device in portrait
      if (window.innerWidth < window.innerHeight && window.innerWidth < 1024) {
        setShowPortraitTip(true);
      } else {
        setShowPortraitTip(false);
      }
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Hash-based admin routing support (e.g. #admin-r3m9x2)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin-r3m9x2' || window.location.pathname.includes('admin-r3m9x2')) {
        setActiveView('ADMIN');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const refreshProfile = () => {
    setProfile(storage.getCurrentProfile());
  };

  const handleSoundToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playJump();
  };

  const handleStartStage = (stage: StageDefinition) => {
    sound.playJump();
    setActiveStage(stage);
    setActiveView('STAGE');
  };

  const handleStageComplete = () => {
    refreshProfile();
    // Check if new coupon unlocked
    const p = storage.getCurrentProfile();
    if (p.stickers.length >= 12 && p.coupons.length === 0) {
      storage.generateCouponIfEligible(p);
      setActiveCouponModal(true);
    }
  };

  const handleSaveAvatar = (updatedAvatar: StudentProfile['avatar']) => {
    const updated = { ...profile, avatar: updatedAvatar, name: updatedAvatar.name };
    storage.saveCurrentProfile(updated);
    setProfile(updated);
    setShowCustomizer(false);
  };

  const handleChangeDifficulty = (level: DifficultyLevel) => {
    sound.playCorrect();
    const updated = { ...profile, difficulty: level };
    storage.saveCurrentProfile(updated);
    setProfile(updated);
    setShowDifficultyModal(false);
  };

  const totalStickersCount = profile.stickers.length;
  const isCouponReady = totalStickersCount >= 12;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* 1. TOP BAR (Roblox Stud Header) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b-4 border-amber-500 shadow-xl px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Wordmark Zone */}
          <div
            onClick={() => {
              sound.playJump();
              setActiveView('MAP');
            }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center font-brick text-slate-950 text-xl shadow-md">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-400">초등 2학년 수학</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-semibold">10차시 완결</span>
              </div>
              <h1 className="text-base md:text-lg font-brick text-white tracking-wide leading-none">
                로블록스 시계탑 오비 탈출
              </h1>
            </div>
          </div>

          {/* Controls & Nav Links Zone */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Student Avatar Button */}
            <button
              onClick={() => {
                sound.playBrickSnap();
                setShowCustomizer(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-amber-400 rounded-xl transition"
            >
              <AvatarRenderer avatar={profile.avatar} size="sm" showShadow={false} />
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-white truncate max-w-[80px]">{profile.name}</div>
                <div className="text-[9px] text-amber-400 font-semibold">캐릭터 꾸미기</div>
              </div>
            </button>

            {/* Difficulty Badge/Selector */}
            <button
              onClick={() => {
                sound.playBrickSnap();
                setShowDifficultyModal(true);
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${
                profile.difficulty === 'EASY' ? 'bg-emerald-400' : profile.difficulty === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-500'
              }`} />
              <span className="hidden sm:inline">난이도:</span>
              <span>{profile.difficulty === 'EASY' ? '쉬움' : profile.difficulty === 'MEDIUM' ? '보통' : '마스터'}</span>
            </button>

            {/* Sticker Book Button */}
            <button
              onClick={() => {
                sound.playSticker();
                setActiveView('STICKERS');
              }}
              className={`relative px-3 py-1.5 rounded-xl font-brick text-xs flex items-center gap-1.5 transition ${
                activeView === 'STICKERS'
                  ? 'brick-btn-yellow'
                  : 'bg-slate-800 hover:bg-slate-700 border-2 border-amber-400/50 text-amber-300'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>스티커 북</span>
              <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded-full font-bold text-[10px]">
                {totalStickersCount}
              </span>
              {isCouponReady && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleSoundToggle}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* TABLET PORTRAIT REMINDER BANNER (Shown only if held vertically on a tablet/mobile) */}
      {showPortraitTip && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs md:text-sm font-bold flex items-center justify-between border-b-2 border-amber-600 shadow-md">
          <div className="flex items-center gap-2">
            <Tablet className="w-4 h-4 rotate-90" />
            <span>
              💡 <strong>태블릿 가로 모드 권장:</strong> 태블릿을 가로로 돌려주시면 시계 조작판과 발판이 한눈에 쏙 들어옵니다!
            </span>
          </div>
          <button
            onClick={() => setShowPortraitTip(false)}
            className="p-1 hover:bg-amber-600/30 rounded-lg text-slate-950 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col justify-start">
        {/* VIEW: STAGE OBBY RUNNER */}
        {activeView === 'STAGE' && activeStage && (
          <StageRunner
            stage={activeStage}
            profile={profile}
            onStageComplete={handleStageComplete}
            onExit={() => {
              setActiveView('MAP');
              setActiveStage(null);
            }}
          />
        )}

        {/* VIEW: STICKER BOOK */}
        {activeView === 'STICKERS' && (
          <StickerBook
            profile={profile}
            onRefreshProfile={refreshProfile}
            onBackToMap={() => setActiveView('MAP')}
          />
        )}

        {/* VIEW: TEACHER DASHBOARD */}
        {activeView === 'ADMIN' && (
          <TeacherDashboard
            currentProfile={profile}
            onBackToGame={() => setActiveView('MAP')}
            onRefreshProfile={refreshProfile}
          />
        )}

        {/* VIEW: MAIN OBBY MAP & HERO */}
        {activeView === 'MAP' && (
          <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-6 space-y-6 animate-fade-in">
            {/* Hero Banner with Generated Roblox Clock Tower Art (Optimized for Tablet Landscape) */}
            <div className="relative rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl bg-slate-900">
              <div className="relative h-44 md:h-52 w-full overflow-hidden">
                <img
                  src={heroImg}
                  alt="로블록스 시계탑 오비 탈출"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter brightness-90 contrast-105 transform hover:scale-105 transition duration-1000"
                />
                {/* Gradient Scrim for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

                {/* Hero Overlay Content */}
                <div className="absolute bottom-4 left-5 right-5 flex flex-col md:flex-row items-start md:items-end justify-between gap-3">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-brick text-xs rounded-lg shadow">
                        초등 2학년 수학 '시각과 시간' 10차시 완결
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900/80 border border-amber-400/50 text-amber-300 font-bold text-[10px] rounded-lg">
                        📱 태블릿 가로모드 최적화
                      </span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-brick text-white drop-shadow-md">
                      시계탑 마왕을 물리치고 탈출하라!
                    </h2>
                    <p className="text-xs text-slate-200 mt-1 font-medium drop-shadow line-clamp-2 md:line-clamp-none">
                      정각, 30분, 5분 단위, 오전/오후, 1시간=60분, 하루 24시간 달력까지!
                      블록 발판을 점프하여 12개 스티커를 모으고 🎁 선생님 상품 교환권을 받으세요.
                    </p>
                  </div>

                  {/* Character Showcase in Hero */}
                  <div className="flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-2xl border-2 border-amber-400/70 shadow-lg">
                    <AvatarRenderer avatar={profile.avatar} size="sm" animation="jump" />
                    <div>
                      <div className="text-[10px] font-bold text-amber-300">내 탐험가</div>
                      <div className="text-xs font-brick text-white">{profile.name}</div>
                      <button
                        onClick={() => setShowCustomizer(true)}
                        className="text-[10px] text-slate-300 underline hover:text-amber-300 active:scale-95"
                      >
                        캐릭터 꾸미기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Difficulty Selection Quick Cards */}
            <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-5 shadow-lg bg-studs">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-brick text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    학습 수준별 3단계 난이도 설정
                  </h3>
                  <p className="text-xs text-slate-400">
                    학생의 개별 학습 수준에 맞는 모드를 선택하여 자신감 있게 문제를 해결하세요.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Easy */}
                <div
                  onClick={() => handleChangeDifficulty('EASY')}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition ${
                    profile.difficulty === 'EASY'
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-lg'
                      : 'border-slate-800 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-brick text-emerald-400 text-sm">🟢 쉬움 (다 수준)</span>
                    {profile.difficulty === 'EASY' && <span className="text-xs font-bold text-emerald-400">선택됨</span>}
                  </div>
                  <div className="text-xs font-bold text-slate-200">초보 브릭 탐험가</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    시계 바늘 가이드 보조선, 5분 눈금 알록달록 색상, 친절한 직관적 힌트 제공
                  </p>
                </div>

                {/* Medium */}
                <div
                  onClick={() => handleChangeDifficulty('MEDIUM')}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition ${
                    profile.difficulty === 'MEDIUM'
                      ? 'border-amber-400 bg-amber-950/40 shadow-lg'
                      : 'border-slate-800 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-brick text-amber-400 text-sm">🟡 보통 (나 수준)</span>
                    {profile.difficulty === 'MEDIUM' && <span className="text-xs font-bold text-amber-400">선택됨</span>}
                  </div>
                  <div className="text-xs font-bold text-slate-200">숙련 브릭 아카데미</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    초등 2학년 정규 성취기준 표준 문항 및 기본 힌트
                  </p>
                </div>

                {/* Hard */}
                <div
                  onClick={() => handleChangeDifficulty('HARD')}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition ${
                    profile.difficulty === 'HARD'
                      ? 'border-rose-400 bg-rose-950/40 shadow-lg'
                      : 'border-slate-800 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-brick text-rose-400 text-sm">🔴 어려움 (가 수준)</span>
                    {profile.difficulty === 'HARD' && <span className="text-xs font-bold text-rose-400">선택됨</span>}
                  </div>
                  <div className="text-xs font-bold text-slate-200">마스터 타워 방탈출</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    복합 문장제 문제, 경과 시간 계산, 35초 스피드 타이머 챌린지
                  </p>
                </div>
              </div>
            </div>

            {/* 6 Stages Obby Course Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-brick text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
                    오비(Obby) 탈출 6단계 코스
                  </h3>
                  <p className="text-xs text-slate-400">
                    각 스테이지를 밟고 올라가며 시계탑 정상의 마왕에게 도전하세요!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STAGES.map((stage, idx) => {
                  const progress = profile.stageProgress[stage.id];
                  const isCleared = progress?.cleared;
                  const isBoss = stage.id === 6;

                  return (
                    <div
                      key={stage.id}
                      className={`relative rounded-3xl border-3 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xl ${
                        isCleared
                          ? 'border-emerald-500/70 bg-gradient-to-b from-slate-900 to-slate-950'
                          : isBoss
                          ? 'border-amber-400 bg-gradient-to-b from-slate-900 to-slate-950'
                          : 'border-slate-700 bg-slate-900 hover:border-amber-400/80'
                      }`}
                    >
                      {/* Top Accent bar */}
                      <div
                        className="h-2 w-full"
                        style={{ backgroundColor: stage.accentColor }}
                      />

                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          {/* Lesson badge */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-amber-400 border border-slate-700">
                              {stage.lessonRange}
                            </span>
                            {isCleared && (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                                <CheckCircle className="w-4 h-4" />
                                {progress.score}점 클리어
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-lg font-brick text-white mb-1">
                            {stage.id}. {stage.title}
                          </h4>
                          <p className="text-xs text-slate-400 mb-3">
                            {stage.subTitle}
                          </p>

                          {/* Concept Box */}
                          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed mb-4">
                            💡 <span className="font-semibold">{stage.conceptSummary}</span>
                          </div>
                        </div>

                        {/* Stage Footer & Play CTA */}
                        <div>
                          {isCleared && (
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
                              <span>획득 스티커:</span>
                              <span className="font-brick text-amber-400">
                                {'⭐'.repeat(progress.stickersEarned)} ({progress.stickersEarned}개)
                              </span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartStage(stage)}
                            className={`w-full py-3 rounded-xl font-brick text-sm flex items-center justify-center gap-2 transition ${
                              isBoss
                                ? 'brick-btn-red text-white'
                                : isCleared
                                ? 'brick-btn-green text-white'
                                : 'brick-btn-yellow text-slate-950'
                            }`}
                          >
                            <span>{isCleared ? '다시 도전하기' : isBoss ? '파이널 보스전 시작!' : '오비 탈출 시작!'}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. FOOTER ZONE */}
      <footer className="bg-slate-900 border-t-2 border-slate-800 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>초등학교 2학년 수학 '시각과 시간' 10차시 오비 탈출 교육용 웹 앱</span>
            <span className="mx-2">·</span>
            <span>100% 무료 로컬 저장소 구동</span>
          </div>

          {/* Teacher Secret Admin Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playBrickSnap();
                setActiveView('ADMIN');
              }}
              className="text-slate-400 hover:text-amber-400 text-xs flex items-center gap-1 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              선생님 전용 관리실 (/admin-r3m9x2)
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Avatar Customizer Modal */}
      {showCustomizer && (
        <AvatarCustomizer
          currentAvatar={profile.avatar}
          onSave={handleSaveAvatar}
          onClose={() => setShowCustomizer(false)}
        />
      )}

      {/* 2. Difficulty Selector Modal */}
      {showDifficultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-brick text-amber-400 mb-2">학습 난이도 변경</h3>
            <p className="text-xs text-slate-300 mb-5">
              학생의 학습 진행 상황에 따라 난이도를 언제든지 변경할 수 있습니다.
            </p>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleChangeDifficulty('EASY')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-center justify-between ${
                  profile.difficulty === 'EASY'
                    ? 'border-emerald-400 bg-emerald-950/50 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="text-sm font-brick text-emerald-400">🟢 쉬움 (다 수준)</div>
                  <div className="text-xs text-slate-400 mt-0.5">시계 바늘 가이드 보조선 및 직관적 힌트</div>
                </div>
                {profile.difficulty === 'EASY' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleChangeDifficulty('MEDIUM')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-center justify-between ${
                  profile.difficulty === 'MEDIUM'
                    ? 'border-amber-400 bg-amber-950/50 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="text-sm font-brick text-amber-400">🟡 보통 (나 수준)</div>
                  <div className="text-xs text-slate-400 mt-0.5">일반 2학년 성취기준 표준 문항</div>
                </div>
                {profile.difficulty === 'MEDIUM' && <CheckCircle className="w-5 h-5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleChangeDifficulty('HARD')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-center justify-between ${
                  profile.difficulty === 'HARD'
                    ? 'border-rose-400 bg-rose-950/50 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="text-sm font-brick text-rose-400">🔴 어려움 (가 수준)</div>
                  <div className="text-xs text-slate-400 mt-0.5">복합 문장제 & 35초 스피드 타이머 미션</div>
                </div>
                {profile.difficulty === 'HARD' && <CheckCircle className="w-5 h-5 text-rose-400" />}
              </button>
            </div>

            <button
              onClick={() => setShowDifficultyModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 3. Teacher Coupon Modal (Direct Trigger) */}
      {activeCouponModal && profile.coupons.length > 0 && (
        <TeacherCouponModal
          coupon={profile.coupons[profile.coupons.length - 1]}
          profile={profile}
          onClose={() => setActiveCouponModal(false)}
          onRedeemSuccess={() => {
            refreshProfile();
            setActiveCouponModal(false);
          }}
        />
      )}
    </div>
  );
}
