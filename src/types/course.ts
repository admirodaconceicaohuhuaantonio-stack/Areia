export type TabId = 'principal' | 'continuar' | 'mais' | 'configuracoes';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface Lesson {
  id: string;
  number: number;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  durationLabel?: string;
}

export interface CourseModule {
  id: string;
  number: number;
  coverKey: CoverKey;
  shortTitle: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'materials' | 'video';
  driveUrl?: string;
  lessons: Lesson[];
}

export interface BonusContent {
  id: string;
  number: number;
  coverKey: CoverKey;
  shortTitle: string;
  title: string;
  description: string;
  highlights?: string[];
  driveUrl: string;
  actionLabel: string;
}

export type CoverKey =
  | 'module-1'
  | 'module-2'
  | 'module-3'
  | 'module-4'
  | 'module-5'
  | 'module-6'
  | 'bonus-main'
  | 'bonus-1'
  | 'bonus-2'
  | 'bonus-3';

export interface LessonProgress {
  lessonId: string;
  moduleId: string;
  currentTime: number;
  duration: number;
  progressPercent: number;
  completed: boolean;
  lastWatchedAt: number;
}

export interface CourseProgressState {
  lessons: Record<string, LessonProgress>;
  completedModules: Record<string, boolean>;
  lastModuleId?: string;
  lastLessonId?: string;
}

export interface AuthSession {
  email: string;
  name: string;
  authenticatedAt: number;
  provider: 'demo' | 'server';
}

export interface CoverOverrideSettings {
  customCovers: Partial<Record<CoverKey, string>>;
  showCoverTextOverlay: boolean;
}
