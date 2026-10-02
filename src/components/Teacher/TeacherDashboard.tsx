import React, { useState } from 'react';
import { StudentProfile, TeacherFeedback } from '../../types/game';
import { storage } from '../../utils/storage';
import { STAGES } from '../../data/curriculum';
import { AvatarRenderer } from '../Avatar/AvatarRenderer';
import { sound } from '../../utils/sound';
import {
  FileText,
  Printer,
  Save,
  CheckCircle,
  ArrowLeft,
  Users,
  Award,
  Clock,
  ShieldCheck,
  Star,
  RefreshCw,
} from 'lucide-react';

interface TeacherDashboardProps {
  currentProfile: StudentProfile;
  onBackToGame: () => void;
  onRefreshProfile: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentProfile,
  onBackToGame,
  onRefreshProfile,
}) => {
  const [students, setStudents] = useState<StudentProfile[]>(storage.getAllStudents());
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile>(currentProfile);
  const [showCertificate, setShowCertificate] = useState(false);

  // Teacher feedback form state
  const existingFeedback = storage.getTeacherFeedback(selectedStudent.id);
  const [memo, setMemo] = useState(existingFeedback?.memo || '');
  const [rubric, setRubric] = useState(
    existingFeedback?.rubric || {
      clockReading: '수월함' as const,
      durationCalculation: '보통' as const,
      dailyScheduleAndCalendar: '수월함' as const,
    }
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSelectStudent = (s: StudentProfile) => {
    sound.playBrickSnap();
    setSelectedStudent(s);
    const fb = storage.getTeacherFeedback(s.id);
    setMemo(fb?.memo || '');
    if (fb?.rubric) setRubric(fb.rubric);
  };

  const handleSaveFeedback = () => {
    sound.playCorrect();
    const fb: TeacherFeedback = {
      studentId: selectedStudent.id,
      memo: memo.trim(),
      date: new Date().toLocaleDateString('ko-KR'),
      rubric,
    };
    storage.saveTeacherFeedback(fb);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePrint = () => {
    sound.playBrickSnap();
    window.print();
  };

  // Stats calculation
  const totalStages = STAGES.length;
  const clearedStages = Object.values(selectedStudent.stageProgress).filter((p) => p.cleared).length;
  const totalScore = Object.values(selectedStudent.stageProgress).reduce((acc, cur) => acc + cur.score, 0);
  const avgScore = clearedStages > 0 ? Math.round(totalScore / clearedStages) : 0;
  const totalPlayMinutes = Math.round(selectedStudent.totalPlayTimeSec / 60);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-fade-in text-slate-100">
      {/* Top Bar with Security Admin Badge */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded">
                교사 전용 대시보드 (HAH 성찰 리포트)
              </span>
              <span className="text-slate-500 text-xs font-mono">/admin-r3m9x2</span>
            </div>
            <h1 className="text-2xl font-brick text-amber-400 mt-0.5">
              학습자 분석 & 탐정 수료증 발급
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCertificate(!showCertificate)}
            className="brick-btn-yellow px-4 py-2 rounded-xl text-xs font-brick flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-slate-950" />
            {showCertificate ? '대시보드로 돌아가기' : '📜 탐정 수료증 발급/출력'}
          </button>
        </div>
      </div>

      {!showCertificate ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 no-print">
          {/* Left Column: Student Roster List */}
          <div className="md:col-span-4 bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-brick text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                등록된 학생 목록 ({students.length}명)
              </h3>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {students.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleSelectStudent(st)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center justify-between touch-manipulation active:scale-[0.98] ${
                    selectedStudent.id === st.id
                      ? 'border-amber-400 bg-amber-400/10 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AvatarRenderer avatar={st.avatar} size="sm" showShadow={false} />
                    <div>
                      <div className="text-xs font-bold">{st.name}</div>
                      <div className="text-[10px] text-slate-400">
                        스티커 {st.stickers.length}개 · 클리어 {Object.values(st.stageProgress).filter((p) => p.cleared).length}/6
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded font-bold text-amber-400">
                      {st.difficulty === 'EASY' ? '쉬움' : st.difficulty === 'MEDIUM' ? '보통' : '어려움'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Student's Detailed Report & Feedback Memo */}
          <div className="md:col-span-8 space-y-5">
            {/* Student Overview Header Card */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-xl flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <AvatarRenderer avatar={selectedStudent.avatar} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-brick text-white">{selectedStudent.name}</h2>
                    <span className="text-xs px-2.5 py-0.5 bg-amber-400 text-slate-950 font-bold rounded-full">
                      난이도: {selectedStudent.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    등록일: {new Date(selectedStudent.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>

              {/* 3 Metrics */}
              <div className="flex items-center gap-4">
                <div className="text-center px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="text-[11px] text-slate-400">평균 정답률</div>
                  <div className="text-lg font-brick text-emerald-400">{avgScore}%</div>
                </div>
                <div className="text-center px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="text-[11px] text-slate-400">총 획득 스티커</div>
                  <div className="text-lg font-brick text-amber-400">{selectedStudent.stickers.length}개</div>
                </div>
                <div className="text-center px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="text-[11px] text-slate-400">총 학습 시간</div>
                  <div className="text-lg font-brick text-sky-400">{totalPlayMinutes}분</div>
                </div>
              </div>
            </div>

            {/* Stage-by-Stage Performance Table */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-brick text-slate-200 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                10개 차시별 성취 수준 진단
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold">
                    <tr>
                      <th className="p-2.5 rounded-l-lg">차시 & 스테이지</th>
                      <th className="p-2.5">클리어 여부</th>
                      <th className="p-2.5">점수</th>
                      <th className="p-2.5">획득 스티커</th>
                      <th className="p-2.5 rounded-r-lg">소요 시간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {STAGES.map((stg) => {
                      const prog = selectedStudent.stageProgress[stg.id];
                      return (
                        <tr key={stg.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-bold text-slate-200">
                            <span className="text-amber-400 mr-1.5">[{stg.lessonRange}]</span>
                            {stg.title}
                          </td>
                          <td className="p-2.5">
                            {prog?.cleared ? (
                              <span className="text-emerald-400 font-bold">통과 완료</span>
                            ) : (
                              <span className="text-slate-500">미완료</span>
                            )}
                          </td>
                          <td className="p-2.5 font-brick text-sm">
                            {prog ? `${prog.score}점` : '-'}
                          </td>
                          <td className="p-2.5">
                            {prog?.stickersEarned ? (
                              <span className="text-amber-400 font-bold">
                                {'⭐'.repeat(prog.stickersEarned)} ({prog.stickersEarned}개)
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-2.5 text-slate-400">
                            {prog?.timeSpentSec ? `${Math.round(prog.timeSpentSec)}초` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teacher Feedback Memo & Rubric Assessment Box */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-brick text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                교사 관찰 성찰 메모 & 영역별 루브릭
              </h3>

              {/* Rubric Evaluation Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700">
                  <div className="text-[11px] font-bold text-slate-300 mb-2">1. 시각 읽기 역량</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['수월함', '보통', '지도가 필요함'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setRubric((prev) => ({ ...prev, clockReading: lvl }))}
                        className={`py-1 text-[10px] font-bold rounded-lg transition ${
                          rubric.clockReading === lvl
                            ? 'bg-amber-400 text-slate-950 font-brick'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700">
                  <div className="text-[11px] font-bold text-slate-300 mb-2">2. 시간의 계산 (60분=1시간)</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['수월함', '보통', '지도가 필요함'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setRubric((prev) => ({ ...prev, durationCalculation: lvl }))}
                        className={`py-1 text-[10px] font-bold rounded-lg transition ${
                          rubric.durationCalculation === lvl
                            ? 'bg-amber-400 text-slate-950 font-brick'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700">
                  <div className="text-[11px] font-bold text-slate-300 mb-2">3. 일과 및 달력 개념</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['수월함', '보통', '지도가 필요함'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setRubric((prev) => ({ ...prev, dailyScheduleAndCalendar: lvl }))}
                        className={`py-1 text-[10px] font-bold rounded-lg transition ${
                          rubric.dailyScheduleAndCalendar === lvl
                            ? 'bg-amber-400 text-slate-950 font-brick'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Memo Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  선생님 종합 관찰 메모 (개별화 학습 지도용)
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={3}
                  placeholder="예: 시계의 짧은 바늘과 긴 바늘의 구분을 정확히 이해하고 있으며, 5분 단위 뛰어세기를 통하여 시각을 능숙하게 판독함. 문장제 시간 덧셈 시 차분한 힌트 지도가 유효했음."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between">
                {saveSuccess ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    성찰 메모가 안전하게 저장되었습니다!
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    로컬 저장소(LocalStorage)에 영구 보관됩니다.
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveFeedback}
                  className="brick-btn-yellow px-5 py-2 rounded-xl text-xs font-brick flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  교사 메모 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DETECTIVE CERTIFICATE OF COMPLETION (PRINTABLE) */
        <div className="flex flex-col items-center">
          {/* Certificate Print Controls Bar */}
          <div className="w-full max-w-3xl flex justify-between items-center mb-4 no-print">
            <button
              onClick={() => setShowCertificate(false)}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              ← 리포트로 돌아가기
            </button>
            <button
              onClick={handlePrint}
              className="brick-btn-yellow px-5 py-2.5 rounded-xl font-brick text-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              수료증 인쇄 / PDF 저장
            </button>
          </div>

          {/* Actual Certificate Document (Optimized for Screen & Print) */}
          <div className="w-full max-w-3xl bg-amber-50 text-slate-950 rounded-3xl p-8 md:p-12 shadow-2xl border-8 border-amber-500 relative overflow-hidden print:border-amber-600 print:shadow-none print:w-full print:m-0">
            {/* Ornate Inner Border */}
            <div className="border-4 border-dashed border-amber-300 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center">
              {/* Badge */}
              <div className="w-16 h-16 rounded-2xl bg-amber-400 border-4 border-amber-600 flex items-center justify-center text-3xl shadow-lg mb-3">
                ⏱️
              </div>

              <div className="text-xs font-bold text-amber-700 tracking-widest uppercase mb-1">
                Roblox Math Detective Certificate
              </div>
              <h2 className="text-3xl md:text-4xl font-brick text-slate-900 tracking-wide mb-2">
                시계탑 오비 탈출 명탐정 수료증
              </h2>
              <div className="w-32 h-1 bg-amber-400 rounded-full mb-6" />

              {/* Student Avatar and Name Block */}
              <div className="flex flex-col items-center mb-6">
                <AvatarRenderer avatar={selectedStudent.avatar} size="md" />
                <div className="text-2xl font-brick text-slate-950 mt-2">
                  {selectedStudent.name} 탐험가
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  초등학교 2학년 수학 [시각과 시간] 10차시 전 과정 마스터
                </div>
              </div>

              {/* Statement */}
              <p className="text-sm md:text-base text-slate-800 leading-relaxed max-w-xl mb-6">
                위 학생은 로블록스 시계탑 오비의 6단계(10개 차시) 관문을 용기 있게 돌파하고,
                정각 및 30분 읽기, 60분과 1시간의 관계, 오전과 오후, 하루 24시간 및 달력의 규칙을
                우수한 성적으로 학습하여 본 수료증을 수여합니다.
              </p>

              {/* Summary Stats Grid */}
              <div className="w-full grid grid-cols-3 gap-3 bg-white/80 border border-amber-300 rounded-xl p-3 mb-6">
                <div>
                  <div className="text-[11px] text-slate-500">총 획득 스티커</div>
                  <div className="text-lg font-brick text-amber-600">
                    {selectedStudent.stickers.length}개 획득
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">도전 난이도</div>
                  <div className="text-lg font-brick text-slate-900">
                    {selectedStudent.difficulty}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">평균 정답률</div>
                  <div className="text-lg font-brick text-emerald-600">
                    {avgScore}%
                  </div>
                </div>
              </div>

              {/* Teacher Memo if exists */}
              {memo && (
                <div className="w-full bg-amber-100/60 p-3 rounded-xl border border-amber-300 text-xs text-slate-700 italic mb-6">
                  "선생님 칭찬 말씀: {memo}"
                </div>
              )}

              {/* Signatures & Seal */}
              <div className="w-full flex justify-between items-end mt-4 pt-4 border-t border-amber-200">
                <div className="text-left text-xs text-slate-600">
                  발급 번호: CLK-2026-{selectedStudent.id.slice(-6).toUpperCase()}<br />
                  발급 일자: {new Date().toLocaleDateString('ko-KR')}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs font-bold text-slate-800">
                    로블록스 수학 탐정 학교장<br />
                    담임 교사 확인
                  </div>
                  {/* Stamp Seal */}
                  <div className="w-12 h-12 rounded-full border-2 border-red-600 text-red-600 flex items-center justify-center font-brick text-xs rotate-[-12deg] shadow-sm">
                    인증(印)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
