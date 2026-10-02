import React from 'react';
import { AvatarConfig } from '../../types/game';

interface AvatarRendererProps {
  avatar: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'idle' | 'jump' | 'celebrate' | 'walking';
  className?: string;
  showShadow?: boolean;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  avatar,
  size = 'md',
  animation = 'idle',
  className = '',
  showShadow = true,
}) => {
  const sizeMap = {
    sm: { w: 48, h: 64, scale: 0.4 },
    md: { w: 96, h: 128, scale: 0.8 },
    lg: { w: 160, h: 210, scale: 1.3 },
    xl: { w: 220, h: 290, scale: 1.8 },
  };

  const { w, h, scale } = sizeMap[size];

  // Animation class helper
  let animClass = '';
  if (animation === 'idle') animClass = 'animate-bounce [animation-duration:2.5s]';
  if (animation === 'jump') animClass = 'animate-pulse';
  if (animation === 'celebrate') animClass = 'animate-[wiggle_1s_ease-in-out_infinite]';

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      <div className={`transition-transform duration-200 ${animClass}`} style={{ transform: `scale(${scale})` }}>
        <svg
          width="120"
          height="160"
          viewBox="0 0 120 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* DEFINITIONS FOR GRADIENTS & 3D LIGHTING */}
          <defs>
            <linearGradient id="headShade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="torsoShade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
            </linearGradient>
            <filter id="brickGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* === 1. LEGS (Blocky Roblox Rectangles) === */}
          <g id="legs">
            {/* Left Leg */}
            <rect x="36" y="98" width="22" height="48" rx="2" fill={avatar.pantsColor} stroke="#0f172a" strokeWidth="2" />
            {/* Left Shoe */}
            <rect x="36" y="136" width="22" height="12" rx="2" fill="#0f172a" />
            {/* Left Leg Highlight */}
            <rect x="38" y="100" width="4" height="42" fill="#fff" opacity="0.15" />

            {/* Right Leg */}
            <rect x="62" y="98" width="22" height="48" rx="2" fill={avatar.pantsColor} stroke="#0f172a" strokeWidth="2" />
            {/* Right Shoe */}
            <rect x="62" y="136" width="22" height="12" rx="2" fill="#0f172a" />
            {/* Right Leg Shadow */}
            <rect x="80" y="100" width="3" height="42" fill="#000" opacity="0.2" />
          </g>

          {/* === 2. TORSO (Roblox Trapezoid / Cube) === */}
          <g id="torso">
            {/* Main Torso */}
            <rect
              x="30"
              y="48"
              width="60"
              height="52"
              rx="3"
              fill={avatar.shirtColor}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            {/* 3D Torso Top bevel */}
            <rect x="30" y="48" width="60" height="52" rx="3" fill="url(#torsoShade)" />

            {/* Neck collar */}
            <rect x="50" y="48" width="20" height="6" rx="2" fill="#0f172a" opacity="0.4" />

            {/* Roblox R Logo / Chest Badge */}
            <rect x="42" y="60" width="14" height="14" rx="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <text x="49" y="71" fontSize="10" fontWeight="900" textAnchor="middle" fill="#0f172a" fontFamily="sans-serif">
              R
            </text>

            {/* Pocket / Belt Line */}
            <line x1="30" y1="94" x2="90" y2="94" stroke="#0f172a" strokeWidth="2" strokeDasharray="3 2" />
          </g>

          {/* === 3. ARMS === */}
          <g id="left-arm">
            <rect
              x="14"
              y="50"
              width="16"
              height="44"
              rx="3"
              fill={avatar.shirtColor}
              stroke="#0f172a"
              strokeWidth="2"
              transform={animation === 'celebrate' ? 'rotate(-25 22 50)' : ''}
            />
            {/* Hand (Skin tone block) */}
            <rect
              x="14"
              y="86"
              width="16"
              height="10"
              rx="2"
              fill={avatar.skinColor}
              stroke="#0f172a"
              strokeWidth="1.5"
              transform={animation === 'celebrate' ? 'rotate(-25 22 50)' : ''}
            />
          </g>

          <g id="right-arm">
            <rect
              x="90"
              y="50"
              width="16"
              height="44"
              rx="3"
              fill={avatar.shirtColor}
              stroke="#0f172a"
              strokeWidth="2"
              transform={animation === 'celebrate' ? 'rotate(25 98 50)' : ''}
            />
            {/* Hand (Skin tone block) */}
            <rect
              x="90"
              y="86"
              width="16"
              height="10"
              rx="2"
              fill={avatar.skinColor}
              stroke="#0f172a"
              strokeWidth="1.5"
              transform={animation === 'celebrate' ? 'rotate(25 98 50)' : ''}
            />
          </g>

          {/* === 4. HEAD (Classic Roblox Blocky Cube) === */}
          <g id="head">
            {/* Head Top Stud (Classic Lego/Roblox stud) */}
            <rect x="52" y="10" width="16" height="6" rx="2" fill={avatar.skinColor} stroke="#0f172a" strokeWidth="1.5" />
            <ellipse cx="60" cy="10" rx="7" ry="2" fill="#fff" opacity="0.3" />

            {/* Head Box */}
            <rect
              x="38"
              y="16"
              width="44"
              height="34"
              rx="4"
              fill={avatar.skinColor}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            {/* 3D shading on head */}
            <rect x="38" y="16" width="44" height="34" rx="4" fill="url(#headShade)" />

            {/* === FACIAL EXPRESSION === */}
            {avatar.expression === 'smile' && (
              <g id="face-smile">
                <circle cx="48" cy="28" r="2.5" fill="#0f172a" />
                <circle cx="72" cy="28" r="2.5" fill="#0f172a" />
                {/* Gentle Smile */}
                <path d="M 52 38 Q 60 44 68 38" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* Rosy Cheeks */}
                <ellipse cx="46" cy="36" rx="3" ry="1.5" fill="#f43f5e" opacity="0.5" />
                <ellipse cx="74" cy="36" rx="3" ry="1.5" fill="#f43f5e" opacity="0.5" />
              </g>
            )}

            {avatar.expression === 'grin' && (
              <g id="face-grin">
                <circle cx="48" cy="27" r="3" fill="#0f172a" />
                <circle cx="72" cy="27" r="3" fill="#0f172a" />
                {/* Big happy grin */}
                <path d="M 50 36 Q 60 46 70 36 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
              </g>
            )}

            {avatar.expression === 'determined' && (
              <g id="face-determined">
                {/* Tilted eyebrows */}
                <line x1="45" y1="24" x2="52" y2="26" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="75" y1="24" x2="68" y2="26" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="49" cy="29" r="2.5" fill="#0f172a" />
                <circle cx="71" cy="29" r="2.5" fill="#0f172a" />
                <path d="M 52 40 L 68 40" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}

            {avatar.expression === 'sparkle' && (
              <g id="face-sparkle">
                {/* Sparkle star eyes */}
                <text x="44" y="32" fontSize="12" fill="#0284c7">✦</text>
                <text x="68" y="32" fontSize="12" fill="#0284c7">✦</text>
                <path d="M 52 38 Q 60 45 68 38" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* === FACE ACCESSORY === */}
            {avatar.faceAccessory === 'sunglasses' && (
              <g id="acc-sunglasses">
                <rect x="42" y="24" width="16" height="11" rx="2" fill="#0f172a" stroke="#ca8a04" strokeWidth="1" />
                <rect x="62" y="24" width="16" height="11" rx="2" fill="#0f172a" stroke="#ca8a04" strokeWidth="1" />
                <line x1="58" y1="28" x2="62" y2="28" stroke="#0f172a" strokeWidth="2" />
                {/* Glare */}
                <line x1="44" y1="26" x2="52" y2="33" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <line x1="64" y1="26" x2="72" y2="33" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              </g>
            )}

            {avatar.faceAccessory === 'glasses' && (
              <g id="acc-glasses">
                <rect x="42" y="24" width="15" height="12" rx="3" fill="#0284c7" fillOpacity="0.2" stroke="#0f172a" strokeWidth="2" />
                <rect x="63" y="24" width="15" height="12" rx="3" fill="#0284c7" fillOpacity="0.2" stroke="#0f172a" strokeWidth="2" />
                <line x1="57" y1="29" x2="63" y2="29" stroke="#0f172a" strokeWidth="2" />
              </g>
            )}

            {avatar.faceAccessory === 'visor' && (
              <g id="acc-visor">
                <path d="M 37 25 Q 60 28 83 25 L 83 31 Q 60 35 37 31 Z" fill="#06b6d4" stroke="#0f172a" strokeWidth="1.5" opacity="0.9" />
              </g>
            )}

            {avatar.faceAccessory === 'bandage' && (
              <g id="acc-bandage">
                <rect x="66" y="34" width="11" height="6" rx="1" fill="#fde047" stroke="#ca8a04" strokeWidth="1" transform="rotate(-15 71 37)" />
                <line x1="71" y1="35" x2="71" y2="39" stroke="#ca8a04" strokeWidth="1" transform="rotate(-15 71 37)" />
              </g>
            )}

            {/* === HEADWEAR === */}
            {avatar.headwear === 'cap' && (
              <g id="hat-cap">
                <path d="M 36 18 Q 60 6 84 18 L 84 21 L 36 21 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="2" />
                {/* Visor bill */}
                <path d="M 34 21 Q 50 16 92 19 L 88 23 L 34 22 Z" fill="#b91c1c" stroke="#0f172a" strokeWidth="1.5" />
                <circle cx="60" cy="11" r="2.5" fill="#facc15" />
              </g>
            )}

            {avatar.headwear === 'police' && (
              <g id="hat-police">
                <path d="M 34 16 L 86 16 L 82 4 L 38 4 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
                <rect x="32" y="16" width="56" height="5" rx="1" fill="#0f172a" />
                {/* Golden Police Badge */}
                <polygon points="60,6 63,12 57,12" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              </g>
            )}

            {avatar.headwear === 'wizard' && (
              <g id="hat-wizard">
                <path d="M 60 -8 L 82 17 L 38 17 Z" fill="#6d28d9" stroke="#0f172a" strokeWidth="2" />
                <ellipse cx="60" cy="17" rx="26" ry="5" fill="#7c3aed" stroke="#0f172a" strokeWidth="1.5" />
                {/* Stars */}
                <text x="56" y="8" fontSize="8" fill="#facc15">★</text>
              </g>
            )}

            {avatar.headwear === 'crown' && (
              <g id="hat-crown">
                <path d="M 36 16 L 40 4 L 50 12 L 60 2 L 70 12 L 80 4 L 84 16 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="40" cy="4" r="2" fill="#ef4444" />
                <circle cx="60" cy="2" r="2" fill="#3b82f6" />
                <circle cx="80" cy="4" r="2" fill="#ef4444" />
              </g>
            )}

            {avatar.headwear === 'headphones' && (
              <g id="hat-headphones">
                {/* Headband */}
                <path d="M 36 28 C 36 8 84 8 84 28" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
                {/* Ear pads */}
                <rect x="32" y="24" width="7" height="15" rx="3" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
                <rect x="81" y="24" width="7" height="15" rx="3" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
              </g>
            )}

            {avatar.headwear === 'catears' && (
              <g id="hat-catears">
                <polygon points="40,16 45,2 52,14" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.5" />
                <polygon points="42,15 45,5 50,13" fill="#fecdd3" />
                <polygon points="80,16 75,2 68,14" fill="#f43f5e" stroke="#0f172a" strokeWidth="1.5" />
                <polygon points="78,15 75,5 70,13" fill="#fecdd3" />
              </g>
            )}
          </g>
        </svg>
      </div>

      {showShadow && (
        <div
          className="mt-1 bg-black/35 rounded-full blur-[2px] transition-all"
          style={{ width: `${w * 0.7}px`, height: `${Math.max(4, h * 0.08)}px` }}
        />
      )}
    </div>
  );
};
