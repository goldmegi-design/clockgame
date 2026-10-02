import React, { useState, useEffect, useRef } from 'react';
import { StageDefinition, StudentProfile, DifficultyLevel, StickerItem } from '../../types/game';
import { InteractiveClock } from '../Clock/InteractiveClock';
import { AvatarRenderer } from '../Avatar/AvatarRenderer';
import { sound } from '../../utils/sound';
import { storage } from '../../utils/storage';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Clock,
  Heart,
  ChevronLeft,
} from 'lucide-react';

interface StageRunnerProps {
  stage: StageDefinition;
  profile: StudentProfile;
  onStageComplete: (score: number, stickersEarned: number) => void;
  onExit: () => void;
}

export const StageRunner: React.FC<StageRunnerProps> = ({
  stage,
  profile,
  onStageComplete,
  onExit,
}) => {
  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentTimeSet, setCurrentTimeSet] = useState<{ hour: number; minute: number }>({
    hour: 12,
    minute: 0,
  });
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'wrong' | null;
    message: string;
  }>({ status: null, message: '' });

  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [stageCleared, setStageCleared] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [earnedStickersCount, setEarnedStickersCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  // Boss HP for Stage 6
  const [bossHp, setBossHp] = useState(100);

  // Speed timer for HARD mode
  const [timeLeft, setTimeLeft] = useState(40);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentMission = stage.missions[missionIndex];
  const isLastMission = missionIndex === stage.missions.length - 1;

  // Track overall elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hard mode per-mission timer
  useEffect(() => {
    if (profile.difficulty === 'HARD' && !stageCleared) {
      setTimeLeft(35);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [missionIndex, profile.difficulty, stageCleared]);

  const handleTimeOut = () => {
    sound.playWrong();
    setFeedback({
      status: 'wrong',
      message: '⏰ 시간이 초과되었습니다! 다시 한 번 차근차근 풀어보세요.',
    });
  };

  const handleSelectOption = (opt: string) => {
    sound.playBrickSnap();
    setSelectedAnswer(opt);
  };

  const handleVerifyAnswer = () => {
    setTotalAttempts((prev) => prev + 1);

    let isCorrect = false;
    if (currentMission.type === 'SET_CLOCK') {
      const targetStr = `${currentTimeSet.hour}:${currentTimeSet.minute < 10 ? '0' : ''}${currentTimeSet.minute}`;
      // Normalized matching: target might be "9:30" or "09:30"
      const parts = String(currentMission.correctAnswer).split(':');
      const targetH = parseInt(parts[0], 10);
      const targetM = parseInt(parts[1], 10);
      isCorrect = currentTimeSet.hour === targetH && currentTimeSet.minute === targetM;
    } else {
      isCorrect = selectedAnswer === currentMission.correctAnswer;
    }

    if (isCorrect) {
      sound.playCorrect();
      setCorrectCount((prev) => prev + 1);

      // If Stage 6 (Boss fight), reduce boss HP
      if (stage.id === 6) {
        sound.playBossHit();
        const damage = Math.round(100 / stage.missions.length);
        setBossHp((prev) => Math.max(0, prev - damage));
      }

      setFeedback({
        status: 'correct',
        message: `정답입니다! 🎉 ${currentMission.explanation}`,
      });
    } else {
      sound.playWrong();
      setFeedback({
        status: 'wrong',
        message: `아쉬워요! 다시 확인해보세요. 💡 힌트: ${
          profile.difficulty === 'EASY' ? currentMission.hintEasy : currentMission.hintMedium
        }`,
      });
    }
  };

  const handleNextMission = () => {
    sound.playJump();
    setSelectedAnswer(null);
    setShowHint(false);
    setFeedback({ status: null, message: '' });

    if (isLastMission) {
      finishStage();
    } else {
      setMissionIndex((prev) => prev + 1);
    }
  };

  const finishStage = () => {
    // Calculate final score
    const totalMissions = stage.missions.length;
    // Score based on correct count vs total attempts
    const rawScore = Math.max(60, Math.round((correctCount / Math.max(correctCount, totalAttempts)) * 100));
    setFinalScore(rawScore);

    // Sticker distribution rules:
    // 100점: 🥇 3개
    // 80점 이상: 🥈 2개
    // 80점 미만: 🥉 1개
    let stickersCount = 1;
    let stickerGrade: StickerItem['grade'] = 'BRONZE';

    if (rawScore >= 100) {
      stickersCount = 3;
      stickerGrade = 'GOLD';
    } else if (rawScore >= 80) {
      stickersCount = 2;
      stickerGrade = 'SILVER';
    }

    setEarnedStickersCount(stickersCount);
    setStageCleared(true);

    // Create and save stickers into profile
    const newStickers: StickerItem[] = [];
    for (let i = 0; i < stickersCount; i++) {
      newStickers.push({
        id: `stk_${stage.id}_${Date.now()}_${i}`,
        stageId: stage.id,
        stageTitle: stage.title,
        grade: stickerGrade,
        name: `${stage.title} 마스터 스티커 #${i + 1}`,
        description: `${stage.lessonRange} 오비 미션 완수 (${rawScore}점 달성)`,
        earnedAt: new Date().toLocaleDateString('ko-KR'),
        score: rawScore,
      });
    }

    // Update storage
    const currentProf = storage.getCurrentProfile();
    currentProf.stageProgress[stage.id] = {
      score: rawScore,
      cleared: true,
      attempts: totalAttempts,
      stickersEarned: stickersCount,
      timeSpentSec: timeSpent,
      accuracyRate: Math.round((correctCount / Math.max(1, totalAttempts)) * 100),
      wrongAnswers: totalAttempts - correctCount,
      lastPlayedAt: new Date().toISOString(),
    };
    currentProf.stickers.push(...newStickers);
    currentProf.totalPlayTimeSec += timeSpent;
    storage.saveCurrentProfile(currentProf);

    // Sound and confetti
    sound.playVictory();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
    });

    onStageComplete(rawScore, stickersCount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-fade-in">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border-2 border-slate-700 rounded-2xl px-4 py-2.5 mb-3 shadow-lg flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onExit}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition active:scale-95 touch-manipulation"
            title="나가기"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[11px] font-bold text-amber-400">
              {stage.lessonRange} · 스테이지 {stage.id}
            </span>
            <h2 className="text-sm md:text-base font-brick text-white">{stage.title}</h2>
          </div>
        </div>

        {/* Obby Platform Progress Tracker */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">오비 발판</span>
          <div className="flex items-center gap-1.5">
            {stage.missions.map((m, idx) => (
              <div
                key={m.id}
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center font-brick text-xs transition-all ${
                  idx === missionIndex
                    ? 'border-amber-400 bg-amber-400 text-slate-950 scale-110 shadow'
                    : idx < missionIndex
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-slate-700 bg-slate-800 text-slate-500'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty / Timer indicator */}
        <div className="flex items-center gap-2">
          {profile.difficulty === 'HARD' && (
            <div className="flex items-center gap-1 text-xs font-mono font-bold bg-red-950 text-red-400 px-2.5 py-1 rounded-xl border border-red-800">
              <Clock className="w-3.5 h-3.5" />
              {timeLeft}초
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {profile.difficulty === 'EASY'
              ? '🟢 쉬움'
              : profile.difficulty === 'MEDIUM'
              ? '🟡 보통'
              : '🔴 마스터'}
          </div>
        </div>
      </div>

      {/* Stage 6 Final Boss Room Special Banner (Slim for landscape) */}
      {stage.id === 6 && !stageCleared && (
        <div className="bg-red-950/60 border-2 border-red-600 rounded-2xl p-2.5 px-4 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="text-2xl animate-bounce">😈</div>
            <div>
              <div className="text-[10px] font-bold text-red-400">시계탑 최종 수호자</div>
              <h3 className="text-sm font-brick text-white">시계탑 마왕 볼트론</h3>
            </div>
          </div>
          {/* Boss HP Bar */}
          <div className="w-40 text-right">
            <div className="flex justify-between text-[11px] font-bold text-red-300 mb-0.5">
              <span>HP</span>
              <span>{bossHp}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-red-800">
              <div
                className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all duration-300"
                style={{ width: `${bossHp}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Mission Screen or Victory Modal */}
      {!stageCleared ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-5 shadow-2xl relative overflow-hidden bg-studs">
          {/* Left: Clock Stage or Visual Math Sandbox */}
          <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            {/* Visual Avatar standing on the obby platform */}
            <div className="w-full flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <AvatarRenderer avatar={profile.avatar} size="sm" animation="idle" />
                <span className="text-xs font-bold text-slate-300">{profile.name}</span>
              </div>
              <span className="text-xs text-amber-400 font-brick">
                미션 {missionIndex + 1} / {stage.missions.length}
              </span>
            </div>

            {/* If mission is clock-based, show interactive clock */}
            {(currentMission.type === 'CLOCK_READ' || currentMission.type === 'SET_CLOCK') && (
              <InteractiveClock
                initialHour={currentMission.clockTime?.hour || 12}
                initialMinute={currentMission.clockTime?.minute || 0}
                isInteractive={currentMission.type === 'SET_CLOCK'}
                difficulty={profile.difficulty}
                onChange={setCurrentTimeSet}
                size={230}
              />
            )}

            {/* Non-clock choice or calculation illustration */}
            {currentMission.type !== 'CLOCK_READ' && currentMission.type !== 'SET_CLOCK' && (
              <div className="w-full flex flex-col items-center justify-center py-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border-2 border-amber-400 flex items-center justify-center text-4xl mb-3 shadow-inner">
                  {stage.id === 3 ? '🏫' : stage.id === 4 ? '⏱️' : stage.id === 5 ? '📅' : '⚡'}
                </div>
                <div className="text-xs font-bold text-amber-300 max-w-xs">
                  {currentMission.scenario}
                </div>
              </div>
            )}
          </div>

          {/* Right: Question, Choice Options & Verification */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              {/* Question Box */}
              <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-3.5 mb-3">
                <span className="text-[11px] font-bold text-amber-400 tracking-wider block mb-1">
                  [오비 미션 {missionIndex + 1}]
                </span>
                <h3 className="text-sm md:text-base font-bold text-white leading-snug">
                  {currentMission.instruction}
                </h3>
                {currentMission.scenario && (
                  <p className="text-[11px] text-slate-400 mt-1.5 bg-slate-900/60 p-2 rounded-xl">
                    💬 {currentMission.scenario}
                  </p>
                )}
              </div>

              {/* Multiple Choice Options (If applicable) */}
              {currentMission.options && (
                <div className="space-y-2 mb-3">
                  {currentMission.options.map((opt, i) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={feedback.status === 'correct'}
                      className={`w-full p-3 min-h-[46px] rounded-xl border-2 text-left font-bold text-xs md:text-sm transition flex items-center justify-between touch-manipulation active:scale-[0.98] ${
                        selectedAnswer === opt
                          ? 'border-amber-400 bg-amber-400/20 text-white shadow-md'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 text-xs flex items-center justify-center font-brick shrink-0">
                          {i + 1}
                        </span>
                        <span>{opt}</span>
                      </span>
                      {selectedAnswer === opt && (
                        <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Set Clock display for SET_CLOCK mission */}
              {currentMission.type === 'SET_CLOCK' && (
                <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700 text-center mb-3">
                  <span className="text-[11px] text-slate-400">내가 맞춘 시각</span>
                  <div className="text-xl font-brick text-amber-400 mt-0.5">
                    {currentTimeSet.hour}시 {currentTimeSet.minute < 10 ? '0' : ''}
                    {currentTimeSet.minute}분
                  </div>
                </div>
              )}

              {/* Hint Accordion */}
              {showHint && (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-2.5 text-xs text-amber-200 mb-3 animate-fade-in flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">탐험 힌트: </span>
                    {profile.difficulty === 'EASY'
                      ? currentMission.hintEasy
                      : currentMission.hintMedium}
                  </div>
                </div>
              )}

              {/* Feedback Alert */}
              {feedback.status && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold mb-3 flex items-start gap-2 animate-fade-in ${
                    feedback.status === 'correct'
                      ? 'bg-emerald-950/60 border border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-500 text-rose-300'
                  }`}
                >
                  {feedback.status === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 py-2.5 min-h-[46px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-700 active:scale-95 touch-manipulation"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  힌트 보기
                </button>

                {feedback.status === 'correct' ? (
                  <button
                    type="button"
                    onClick={handleNextMission}
                    className="flex-1 brick-btn-green py-2.5 min-h-[46px] rounded-xl font-brick text-sm flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
                  >
                    <span>{isLastMission ? '오비 클리어 & 스티커 받기!' : '다음 발판으로 점프!'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyAnswer}
                    disabled={currentMission.type !== 'SET_CLOCK' && !selectedAnswer}
                    className="flex-1 brick-btn-yellow py-2.5 min-h-[46px] rounded-xl font-brick text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 touch-manipulation"
                  >
                    <span>정답 확인하기!</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STAGE CLEARED VICTORY SCREEN */
        <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden animate-fade-in bg-studs">
          <div className="flex flex-col items-center">
            <AvatarRenderer avatar={profile.avatar} size="lg" animation="celebrate" />

            <h2 className="text-3xl font-brick text-amber-400 mt-4 tracking-wide">
              🎉 스테이지 {stage.id} 오비 탈출 성공!
            </h2>
            <p className="text-sm text-slate-300 mt-1">{stage.title}</p>

            {/* Score & Stickers Awarded Card */}
            <div className="w-full max-w-md bg-slate-950/80 border-2 border-slate-700 rounded-2xl p-5 my-6">
              <div className="text-xs text-slate-400 mb-1">최종 평가 점수</div>
              <div className="text-4xl font-brick text-amber-400">{finalScore}점</div>

              {/* Sticker Award Box */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-300 mb-2">
                  획득한 로블록스 시계 스티커
                </span>
                <div className="flex items-center gap-3">
                  {Array.from({ length: earnedStickersCount }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center p-3 rounded-2xl bg-amber-400/10 border-2 border-amber-400 animate-bounce [animation-duration:1.5s]"
                    >
                      <span className="text-3xl">⏱️</span>
                      <span className="text-[10px] font-brick text-amber-400 mt-1">
                        {finalScore >= 100 ? '🥇 골드' : finalScore >= 80 ? '🥈 실버' : '🥉 브론즈'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  {finalScore >= 100
                    ? '100점 완벽 통과! 골드 스티커 3개를 획득했습니다!'
                    : finalScore >= 80
                    ? '80점 이상 우수 통과! 실버 스티커 2개를 획득했습니다!'
                    : '오비 통과 완료! 브론즈 스티커 1개를 획득했습니다!'}
                </p>
              </div>
            </div>

            {/* Exit / Next Actions */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <button
                onClick={onExit}
                className="brick-btn-yellow px-6 py-3 rounded-xl font-brick text-sm flex items-center gap-2"
              >
                오비 지도로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
