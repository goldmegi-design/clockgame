/**
 * Game Data Types & Curriculum Structure
 */

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface AvatarConfig {
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  headwear: 'none' | 'cap' | 'police' | 'wizard' | 'crown' | 'headphones' | 'catears';
  faceAccessory: 'none' | 'sunglasses' | 'glasses' | 'visor' | 'bandage';
  expression: 'smile' | 'grin' | 'determined' | 'sparkle';
  name: string;
}

export type StickerGrade = 'GOLD' | 'SILVER' | 'BRONZE';

export interface StickerItem {
  id: string;
  stageId: number;
  stageTitle: string;
  grade: StickerGrade;
  name: string;
  description: string;
  earnedAt: string;
  score: number;
}

export interface TeacherCoupon {
  id: string;
  couponCode: string;
  studentName: string;
  earnedDate: string;
  redeemed: boolean;
  redeemedAt?: string;
  targetStickerCount: number;
  currentStickers: number;
  teacherNote?: string;
}

export interface StageScore {
  score: number; // 0-100
  cleared: boolean;
  attempts: number;
  stickersEarned: number;
  timeSpentSec: number;
  accuracyRate: number; // percentage
  wrongAnswers: number;
  lastPlayedAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  avatar: AvatarConfig;
  stageProgress: Record<number, StageScore>;
  stickers: StickerItem[];
  coupons: TeacherCoupon[];
  totalPlayTimeSec: number;
  completedAt?: string;
  createdAt: string;
}

export interface TeacherFeedback {
  studentId: string;
  memo: string;
  date: string;
  rubric: {
    clockReading: '수월함' | '보통' | '지도가 필요함';
    durationCalculation: '수월함' | '보통' | '지도가 필요함';
    dailyScheduleAndCalendar: '수월함' | '보통' | '지도가 필요함';
  };
}

export interface MissionQuestion {
  id: string;
  type: 'CLOCK_READ' | 'SET_CLOCK' | 'CHOICE' | 'CALCULATE' | 'SCHEDULE_MATCH';
  instruction: string;
  scenario?: string;
  clockTime?: { hour: number; minute: number }; // Target or displayed clock time
  options?: string[]; // Multiple choice options
  correctAnswer: string | number; // Exact answer string or minute
  hintEasy: string;
  hintMedium: string;
  explanation: string;
  timeLimitSec?: number; // for hard mode speed challenges
}

export interface StageDefinition {
  id: number;
  lessonRange: string; // e.g., "1~2차시"
  title: string;
  subTitle: string;
  conceptSummary: string;
  bgGradient: string;
  accentColor: string;
  obbyObstacleType: 'bridge' | 'gears' | 'elevator' | 'laser_maze' | 'puzzle_tower' | 'boss_arena';
  missions: MissionQuestion[];
}
