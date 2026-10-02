import { AvatarConfig, DifficultyLevel, StudentProfile, TeacherFeedback, TeacherCoupon, StickerItem } from '../types/game';

const CURRENT_STUDENT_KEY = 'roblox_time_current_student';
const ALL_STUDENTS_KEY = 'roblox_time_all_students';
const TEACHER_FEEDBACK_KEY = 'roblox_time_teacher_feedback';

export const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: '#FACC15', // Classic Lego Yellow
  shirtColor: '#0284C7', // Classic Roblox Blue
  pantsColor: '#1E293B', // Slate pants
  headwear: 'cap',
  faceAccessory: 'sunglasses',
  expression: 'smile',
  name: '브릭탐험가',
};

export const createInitialProfile = (name = '브릭탐험가', difficulty: DifficultyLevel = 'MEDIUM'): StudentProfile => {
  const id = 'student_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  return {
    id,
    name,
    difficulty,
    avatar: { ...DEFAULT_AVATAR, name },
    stageProgress: {},
    stickers: [],
    coupons: [],
    totalPlayTimeSec: 0,
    createdAt: new Date().toISOString(),
  };
};

export const storage = {
  getCurrentProfile(): StudentProfile {
    try {
      const data = localStorage.getItem(CURRENT_STUDENT_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    const newProf = createInitialProfile();
    this.saveCurrentProfile(newProf);
    return newProf;
  },

  saveCurrentProfile(profile: StudentProfile) {
    try {
      localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(profile));

      // Also upsert into ALL_STUDENTS list for teacher overview
      const all = this.getAllStudents();
      const existingIdx = all.findIndex((s) => s.id === profile.id);
      if (existingIdx >= 0) {
        all[existingIdx] = profile;
      } else {
        all.push(profile);
      }
      localStorage.setItem(ALL_STUDENTS_KEY, JSON.stringify(all));
    } catch {}
  },

  getAllStudents(): StudentProfile[] {
    try {
      const data = localStorage.getItem(ALL_STUDENTS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return [];
  },

  switchStudent(id: string): StudentProfile | null {
    const all = this.getAllStudents();
    const found = all.find((s) => s.id === id);
    if (found) {
      localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(found));
      return found;
    }
    return null;
  },

  resetAllProgress(studentId: string): StudentProfile {
    const prof = this.getCurrentProfile();
    if (prof.id === studentId) {
      prof.stageProgress = {};
      prof.stickers = [];
      prof.coupons = [];
      prof.totalPlayTimeSec = 0;
      prof.completedAt = undefined;
      this.saveCurrentProfile(prof);
      return prof;
    }
    return prof;
  },

  getTeacherFeedback(studentId: string): TeacherFeedback | null {
    try {
      const data = localStorage.getItem(`${TEACHER_FEEDBACK_KEY}_${studentId}`);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  },

  saveTeacherFeedback(feedback: TeacherFeedback) {
    try {
      localStorage.setItem(`${TEACHER_FEEDBACK_KEY}_${feedback.studentId}`, JSON.stringify(feedback));
    } catch {}
  },

  redeemCoupon(couponId: string, note?: string): boolean {
    const prof = this.getCurrentProfile();
    const coupon = prof.coupons.find((c) => c.id === couponId);
    if (coupon && !coupon.redeemed) {
      coupon.redeemed = true;
      coupon.redeemedAt = new Date().toLocaleString('ko-KR');
      if (note) coupon.teacherNote = note;
      this.saveCurrentProfile(prof);
      return true;
    }
    return false;
  },

  generateCouponIfEligible(profile: StudentProfile): TeacherCoupon | null {
    const TARGET_STICKERS = 12;
    if (profile.stickers.length >= TARGET_STICKERS) {
      // Check if active or already generated
      const existing = profile.coupons.find((c) => !c.redeemed);
      if (existing) return existing;

      // If already redeemed, check if they earned 18 stickers for a 2nd coupon or just return the latest
      if (profile.coupons.length === 0 || (profile.stickers.length >= 18 && profile.coupons.length < 2)) {
        const newCoupon: TeacherCoupon = {
          id: 'coupon_' + Date.now(),
          couponCode: 'RBX-TIME-' + Math.floor(1000 + Math.random() * 9000),
          studentName: profile.name,
          earnedDate: new Date().toLocaleDateString('ko-KR'),
          redeemed: false,
          targetStickerCount: TARGET_STICKERS,
          currentStickers: profile.stickers.length,
        };
        profile.coupons.push(newCoupon);
        this.saveCurrentProfile(profile);
        return newCoupon;
      }
    }
    return null;
  },
};
