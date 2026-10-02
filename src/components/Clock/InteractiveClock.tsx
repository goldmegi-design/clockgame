import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '../../types/game';
import { sound } from '../../utils/sound';
import { RotateCw, RotateCcw, Plus, Minus } from 'lucide-react';

interface InteractiveClockProps {
  initialHour?: number;
  initialMinute?: number;
  isInteractive?: boolean;
  difficulty?: DifficultyLevel;
  onChange?: (time: { hour: number; minute: number }) => void;
  size?: number;
  highlightHands?: boolean;
}

export const InteractiveClock: React.FC<InteractiveClockProps> = ({
  initialHour = 12,
  initialMinute = 0,
  isInteractive = false,
  difficulty = 'MEDIUM',
  onChange,
  size = 280,
}) => {
  const [hour, setHour] = useState<number>(initialHour);
  const [minute, setMinute] = useState<number>(initialMinute);

  useEffect(() => {
    setHour(initialHour);
    setMinute(initialMinute);
  }, [initialHour, initialMinute]);

  const updateTime = (newH: number, newM: number) => {
    let normalizedM = newM;
    let normalizedH = newH;

    if (normalizedM >= 60) {
      normalizedH += Math.floor(normalizedM / 60);
      normalizedM = normalizedM % 60;
    } else if (normalizedM < 0) {
      const hoursToSubtract = Math.ceil(Math.abs(normalizedM) / 60);
      normalizedH -= hoursToSubtract;
      normalizedM = (normalizedM + hoursToSubtract * 60) % 60;
    }

    normalizedH = ((normalizedH - 1) % 12 + 12) % 12 + 1;

    setHour(normalizedH);
    setMinute(normalizedM);
    sound.playBrickSnap();

    if (onChange) {
      onChange({ hour: normalizedH, minute: normalizedM });
    }
  };

  // Angle calculations:
  // Minute hand: 360 deg / 60 min = 6 deg per minute
  const minuteAngle = minute * 6;
  // Hour hand: 360 deg / 12 hr = 30 deg per hr + 0.5 deg per minute
  const hourAngle = (hour % 12) * 30 + minute * 0.5;

  const radius = size / 2;
  const center = radius;

  // 1 to 12 clock numbers
  const clockNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Helper for clicking on clock numbers to directly set hour or 5-min
  const handleNumberClick = (num: number) => {
    if (!isInteractive) return;
    // Set minute to num * 5 (with 12 as 0)
    const newMin = num === 12 ? 0 : num * 5;
    updateTime(hour, newMin);
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Clock Face SVG */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Roblox Stud Dial Bezel Gradient */}
            <radialGradient id="clockBezel" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#1E293B" />
              <stop offset="93%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#CA8A04" />
            </radialGradient>
            <radialGradient id="clockDial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="88%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </radialGradient>
            <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* 1. Outer Studded Rim (Roblox Brick Style) */}
          <circle
            cx={center}
            cy={center}
            r={radius - 4}
            fill="url(#clockBezel)"
            stroke="#CA8A04"
            strokeWidth="5"
          />

          {/* 12 Outer Stud Dots on Bezel */}
          {clockNumbers.map((num) => {
            const angle = (num * 30 - 90) * (Math.PI / 180);
            const studR = radius - 10;
            const x = center + studR * Math.cos(angle);
            const y = center + studR * Math.sin(angle);
            return (
              <circle
                key={`stud-${num}`}
                cx={x}
                cy={y}
                r="3.5"
                fill="#FACC15"
                stroke="#A16207"
                strokeWidth="1"
              />
            );
          })}

          {/* 2. Clock Dial Face */}
          <circle
            cx={center}
            cy={center}
            r={radius - 18}
            fill="url(#clockDial)"
            stroke="#94A3B8"
            strokeWidth="2"
          />

          {/* 3. Easy Mode: 5-minute Sector / Color Wedges */}
          {difficulty === 'EASY' && (
            <g id="easy-minute-bubbles">
              {clockNumbers.map((num) => {
                const angle = (num * 30 - 90) * (Math.PI / 180);
                const bubbleR = radius - 33;
                const x = center + bubbleR * Math.cos(angle);
                const y = center + bubbleR * Math.sin(angle);
                const minVal = num === 12 ? '00분' : `${num * 5}분`;
                return (
                  <g key={`bubble-${num}`}>
                    <circle cx={x} cy={y} r="10" fill="#FEF08A" stroke="#EAB308" strokeWidth="1" />
                    <text
                      x={x}
                      y={y + 3}
                      fontSize="8"
                      fontWeight="bold"
                      fill="#854D0E"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {minVal}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 4. Minute Tick Marks (60 marks) */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i * 6 - 90) * (Math.PI / 180);
            const is5Min = i % 5 === 0;
            const outerR = radius - 19;
            const innerR = is5Min ? radius - 27 : radius - 23;
            const x1 = center + innerR * Math.cos(angle);
            const y1 = center + innerR * Math.sin(angle);
            const x2 = center + outerR * Math.cos(angle);
            const y2 = center + outerR * Math.sin(angle);

            return (
              <line
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={is5Min ? '#0F172A' : '#94A3B8'}
                strokeWidth={is5Min ? 2.5 : 1}
              />
            );
          })}

          {/* 5. Clock Numbers 1 to 12 with Large Tablet Touch Targets */}
          {clockNumbers.map((num) => {
            const angle = (num * 30 - 90) * (Math.PI / 180);
            const textR = difficulty === 'EASY' ? radius - 50 : radius - 36;
            const x = center + textR * Math.cos(angle);
            const y = center + textR * Math.sin(angle);

            return (
              <g
                key={`num-${num}`}
                onClick={() => handleNumberClick(num)}
                className={isInteractive ? 'cursor-pointer hover:opacity-75 transition active:scale-110' : ''}
              >
                {/* Invisible large touch target circle (finger-friendly >= 44px) */}
                {isInteractive && (
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill="transparent"
                    className="touch-manipulation"
                  />
                )}
                <text
                  x={x}
                  y={y + 6}
                  fontSize={difficulty === 'EASY' ? '14' : '17'}
                  fontWeight="900"
                  fontFamily="'Black Han Sans', 'Jua', sans-serif"
                  fill="#0F172A"
                  textAnchor="middle"
                >
                  {num}
                </text>
              </g>
            );
          })}

          {/* 6. Easy Mode: Guide Extension Rays */}
          {difficulty === 'EASY' && (
            <g id="guide-lines" opacity="0.6">
              {/* Minute guide extension ray */}
              <line
                x1={center}
                y1={center}
                x2={center + (radius - 20) * Math.sin((minuteAngle * Math.PI) / 180)}
                y2={center - (radius - 20) * Math.cos((minuteAngle * Math.PI) / 180)}
                stroke="#0284C7"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              {/* Hour guide extension ray */}
              <line
                x1={center}
                y1={center}
                x2={center + (radius - 20) * Math.sin((hourAngle * Math.PI) / 180)}
                y2={center - (radius - 20) * Math.cos((hourAngle * Math.PI) / 180)}
                stroke="#DC2626"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* 7. HOUR HAND (Short, Fat, Red Brick Shape) */}
          <g transform={`rotate(${hourAngle} ${center} ${center})`} filter="url(#handShadow)">
            {/* Counterbalance tail */}
            <rect
              x={center - 4}
              y={center}
              width="8"
              height="14"
              rx="3"
              fill="#991B1B"
            />
            {/* Hour hand body */}
            <rect
              x={center - 4.5}
              y={center - radius * 0.48}
              width="9"
              height={radius * 0.48}
              rx="4"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="1.5"
            />
            {/* Brick Stud on Hour Hand */}
            <circle cx={center} cy={center - radius * 0.35} r="2.5" fill="#EF4444" />
            {/* Hand Pointer Tip Arrow */}
            <polygon
              points={`${center - 6},${center - radius * 0.48} ${center + 6},${center - radius * 0.48} ${center},${center - radius * 0.55}`}
              fill="#DC2626"
            />
          </g>

          {/* 8. MINUTE HAND (Long, Slender, Blue Brick Shape) */}
          <g transform={`rotate(${minuteAngle} ${center} ${center})`} filter="url(#handShadow)">
            {/* Counterbalance tail */}
            <rect
              x={center - 3.5}
              y={center}
              width="7"
              height="18"
              rx="2.5"
              fill="#0369A1"
            />
            {/* Minute hand body */}
            <rect
              x={center - 3.5}
              y={center - radius * 0.72}
              width="7"
              height={radius * 0.72}
              rx="3"
              fill="#0284C7"
              stroke="#0369A1"
              strokeWidth="1.5"
            />
            {/* Brick Stud on Minute Hand */}
            <circle cx={center} cy={center - radius * 0.5} r="2" fill="#38BDF8" />
            <circle cx={center} cy={center - radius * 0.25} r="2" fill="#38BDF8" />
            {/* Hand Pointer Tip Arrow */}
            <polygon
              points={`${center - 5},${center - radius * 0.72} ${center + 5},${center - radius * 0.72} ${center},${center - radius * 0.79}`}
              fill="#0284C7"
            />
          </g>

          {/* 9. Center Stud & Pin (Golden Roblox Stud) */}
          <circle cx={center} cy={center} r="9" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" />
          <circle cx={center} cy={center} r="5" fill="#FACC15" />
          <text
            x={center}
            y={center + 3}
            fontSize="8"
            fontWeight="bold"
            fill="#713F12"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            R
          </text>
        </svg>
      </div>

      {/* Legend for Hand Recognition */}
      <div className="flex items-center gap-4 mt-3 text-xs font-bold">
        <span className="flex items-center gap-1.5 text-red-400 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
          짧은 바늘: 시
        </span>
        <span className="flex items-center gap-1.5 text-sky-400 bg-sky-950/40 px-2.5 py-1 rounded-lg border border-sky-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
          긴 바늘: 분
        </span>
      </div>

      {/* Interactive Controls (When user needs to adjust/set time) */}
      {isInteractive && (
        <div className="w-full mt-3 flex flex-col items-center gap-2">
          {/* Quick Adjustment Brick Buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => updateTime(hour - 1, minute)}
              className="brick-btn-red px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 touch-manipulation"
            >
              <Minus className="w-3.5 h-3.5" /> 1시간
            </button>
            <button
              type="button"
              onClick={() => updateTime(hour + 1, minute)}
              className="brick-btn-red px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5" /> 1시간
            </button>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <button
              type="button"
              onClick={() => updateTime(hour, minute - 5)}
              className="brick-btn-blue px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 touch-manipulation"
            >
              <RotateCcw className="w-3.5 h-3.5" /> -5분
            </button>
            <button
              type="button"
              onClick={() => updateTime(hour, minute + 5)}
              className="brick-btn-blue px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 touch-manipulation"
            >
              <RotateCw className="w-3.5 h-3.5" /> +5분
            </button>
            <button
              type="button"
              onClick={() => updateTime(hour, minute + 30)}
              className="brick-btn-yellow px-4 py-2 min-h-[42px] rounded-xl text-xs font-bold active:scale-95 touch-manipulation"
            >
              +30분
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            💡 버튼을 누르거나 시계의 숫자를 손가락으로 콕 찍어 바늘을 움직일 수 있어요!
          </p>
        </div>
      )}
    </div>
  );
};
