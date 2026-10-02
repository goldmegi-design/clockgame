import React, { useState } from 'react';
import { AvatarConfig } from '../../types/game';
import { AvatarRenderer } from './AvatarRenderer';
import { sound } from '../../utils/sound';
import { Sparkles, Check, RefreshCw, Smile, User } from 'lucide-react';

interface AvatarCustomizerProps {
  currentAvatar: AvatarConfig;
  onSave: (updated: AvatarConfig) => void;
  onClose?: () => void;
}

const SKIN_COLORS = [
  { name: '클래식 옐로우', value: '#FACC15' },
  { name: '피치 살구', value: '#FED7AA' },
  { name: '브라운 탠', value: '#D97706' },
  { name: '초코 딥', value: '#78350F' },
  { name: '로블록스 사이언', value: '#38BDF8' },
  { name: '크립토 그린', value: '#4ADE80' },
];

const SHIRT_COLORS = [
  { name: '블루 탐험가', value: '#0284C7' },
  { name: '레드 후드', value: '#DC2626' },
  { name: '에메랄드 아카데미', value: '#059669' },
  { name: '바이올렛 사이버', value: '#7C3AED' },
  { name: '골든 브릭', value: '#CA8A04' },
  { name: '미드나잇 블랙', value: '#0F172A' },
];

const PANTS_COLORS = [
  { name: '다크 슬레이트', value: '#1E293B' },
  { name: '데님 블루', value: '#1D4ED8' },
  { name: '화이트 스니커', value: '#E2E8F0' },
  { name: '카고 올리브', value: '#3F6212' },
  { name: '퍼플 조거', value: '#581C87' },
  { name: '레드 브릭', value: '#991B1B' },
];

const HEADWEAR_OPTIONS: { id: AvatarConfig['headwear']; name: string; icon: string }[] = [
  { id: 'none', name: '기본 스터드', icon: '🧱' },
  { id: 'cap', name: '스포티 야구모자', icon: '🧢' },
  { id: 'police', name: '명탐정 모자', icon: '👮' },
  { id: 'wizard', name: '시간 마법사 모자', icon: '🧙' },
  { id: 'crown', name: '황금 시계탑 왕관', icon: '👑' },
  { id: 'headphones', name: '게이밍 헤드셋', icon: '🎧' },
  { id: 'catears', name: '냥냥 브릭 귀', icon: '🐱' },
];

const ACCESSORY_OPTIONS: { id: AvatarConfig['faceAccessory']; name: string; icon: string }[] = [
  { id: 'none', name: '없음', icon: '❌' },
  { id: 'sunglasses', name: '쿨 선글라스', icon: '🕶️' },
  { id: 'glasses', name: '박사님 뿔테안경', icon: '👓' },
  { id: 'visor', name: '사이버 고글', icon: '🥽' },
  { id: 'bandage', name: '오비 모험 반창고', icon: '🩹' },
];

const EXPRESSION_OPTIONS: { id: AvatarConfig['expression']; name: string; icon: string }[] = [
  { id: 'smile', name: '상냥한 미소', icon: '😊' },
  { id: 'grin', name: '장난스런 활짝', icon: '😁' },
  { id: 'determined', name: '탈출 결의', icon: '😎' },
  { id: 'sparkle', name: '반짝반짝 호기심', icon: '🤩' },
];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  currentAvatar,
  onSave,
  onClose,
}) => {
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...currentAvatar });
  const [activeTab, setActiveTab] = useState<'skin' | 'clothes' | 'hat' | 'face'>('clothes');
  const [name, setName] = useState(currentAvatar.name || '브릭탐험가');

  const update = (key: keyof AvatarConfig, val: unknown) => {
    sound.playBrickSnap();
    setAvatar((prev) => ({ ...prev, [key]: val }));
  };

  const handleRandomize = () => {
    sound.playJump();
    const rSkin = SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)].value;
    const rShirt = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)].value;
    const rPants = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)].value;
    const rHead = HEADWEAR_OPTIONS[Math.floor(Math.random() * HEADWEAR_OPTIONS.length)].id;
    const rAcc = ACCESSORY_OPTIONS[Math.floor(Math.random() * ACCESSORY_OPTIONS.length)].id;
    const rExp = EXPRESSION_OPTIONS[Math.floor(Math.random() * EXPRESSION_OPTIONS.length)].id;

    setAvatar((prev) => ({
      ...prev,
      skinColor: rSkin,
      shirtColor: rShirt,
      pantsColor: rPants,
      headwear: rHead,
      faceAccessory: rAcc,
      expression: rExp,
    }));
  };

  const handleSave = () => {
    sound.playCorrect();
    onSave({ ...avatar, name: name.trim() || '브릭탐험가' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 flex items-center justify-between border-b-4 border-amber-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-950/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-brick tracking-wide">로블록스 브릭 아바타 꾸미기</h2>
              <p className="text-xs font-semibold text-slate-800">
                시계탑 오비를 탐험할 나만의 브릭 캐릭터를 완성해보세요!
              </p>
            </div>
          </div>
          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition active:scale-95 shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            랜덤 추천
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900 bg-studs">
          {/* Left Column: Avatar Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/70 p-6 rounded-2xl border-2 border-slate-700 shadow-inner">
            <div className="relative flex flex-col items-center">
              <AvatarRenderer avatar={avatar} size="lg" animation="idle" />

              {/* Name Tag badge */}
              <div className="mt-3 px-4 py-1 bg-amber-400 text-slate-950 font-brick text-sm rounded-lg shadow-md border-2 border-amber-600">
                {name || '브릭탐험가'}
              </div>
            </div>

            {/* Name Input */}
            <div className="w-full mt-5">
              <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                탐험가 이름 (학생 이름)
              </label>
              <input
                type="text"
                value={name}
                maxLength={8}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 입력 (예: 민준, 서연)"
                className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-600 focus:border-amber-400 rounded-xl text-center text-sm font-bold text-white outline-none"
              />
            </div>
          </div>

          {/* Right Column: Customization Tabs & Grids */}
          <div className="md:col-span-7 flex flex-col">
            {/* Category Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-800 rounded-xl mb-4 border border-slate-700">
              <button
                onClick={() => {
                  sound.playBrickSnap();
                  setActiveTab('clothes');
                }}
                className={`py-2.5 min-h-[42px] text-xs font-bold rounded-lg transition touch-manipulation active:scale-95 ${
                  activeTab === 'clothes' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                👕 의상
              </button>
              <button
                onClick={() => {
                  sound.playBrickSnap();
                  setActiveTab('hat');
                }}
                className={`py-2.5 min-h-[42px] text-xs font-bold rounded-lg transition touch-manipulation active:scale-95 ${
                  activeTab === 'hat' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                🧢 모자
              </button>
              <button
                onClick={() => {
                  sound.playBrickSnap();
                  setActiveTab('face');
                }}
                className={`py-2.5 min-h-[42px] text-xs font-bold rounded-lg transition touch-manipulation active:scale-95 ${
                  activeTab === 'face' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                🕶️ 안경/표정
              </button>
              <button
                onClick={() => {
                  sound.playBrickSnap();
                  setActiveTab('skin');
                }}
                className={`py-2.5 min-h-[42px] text-xs font-bold rounded-lg transition touch-manipulation active:scale-95 ${
                  activeTab === 'skin' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                🎨 피부색
              </button>
            </div>

            {/* Tab: Clothes */}
            {activeTab === 'clothes' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2">상의(티셔츠) 색상</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {SHIRT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => update('shirtColor', c.value)}
                        className={`flex items-center gap-2 p-2 rounded-xl border-2 transition ${
                          avatar.shirtColor === c.value
                            ? 'border-amber-400 bg-slate-800'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-md border border-slate-900 shadow-sm"
                          style={{ backgroundColor: c.value }}
                        />
                        <span className="text-xs font-medium text-slate-200 truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2">하의(바지) 색상</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {PANTS_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => update('pantsColor', c.value)}
                        className={`flex items-center gap-2 p-2 rounded-xl border-2 transition ${
                          avatar.pantsColor === c.value
                            ? 'border-amber-400 bg-slate-800'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-md border border-slate-900 shadow-sm"
                          style={{ backgroundColor: c.value }}
                        />
                        <span className="text-xs font-medium text-slate-200 truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Hat */}
            {activeTab === 'hat' && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2">모자 & 헤어 아이템</h4>
                <div className="grid grid-cols-2 gap-2">
                  {HEADWEAR_OPTIONS.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => update('headwear', h.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition ${
                        avatar.headwear === h.id
                          ? 'border-amber-400 bg-amber-400/10 text-white'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-xl">{h.icon}</span>
                      <span className="text-xs font-bold truncate">{h.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Face & Glasses */}
            {activeTab === 'face' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2">얼굴 액세서리 (안경/고글)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCESSORY_OPTIONS.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => update('faceAccessory', acc.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 text-left transition ${
                          avatar.faceAccessory === acc.id
                            ? 'border-amber-400 bg-amber-400/10 text-white'
                            : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-lg">{acc.icon}</span>
                        <span className="text-xs font-bold truncate">{acc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-amber-400" />
                    표정 선택
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPRESSION_OPTIONS.map((exp) => (
                      <button
                        key={exp.id}
                        onClick={() => update('expression', exp.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border-2 text-left transition ${
                          avatar.expression === exp.id
                            ? 'border-amber-400 bg-amber-400/10 text-white'
                            : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-lg">{exp.icon}</span>
                        <span className="text-xs font-bold truncate">{exp.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Skin */}
            {activeTab === 'skin' && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2">피부 브릭 톤</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {SKIN_COLORS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => update('skinColor', s.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                        avatar.skinColor === s.value
                          ? 'border-amber-400 bg-slate-800 shadow'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-lg border-2 border-slate-900 shadow"
                        style={{ backgroundColor: s.value }}
                      />
                      <span className="text-xs font-bold text-slate-200">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t-2 border-slate-800 flex items-center justify-between">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition"
            >
              취소
            </button>
          )}
          <button
            onClick={handleSave}
            className="ml-auto brick-btn-yellow px-6 py-2.5 rounded-xl font-brick text-base flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            이 아바타로 모험 시작하기!
          </button>
        </div>
      </div>
    </div>
  );
};
