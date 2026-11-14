import {
  CourseModule,
  CourseProgressState,
  Lesson,
  LessonProgress,
  LessonStatus,
} from '../types/course';

const PROGRESS_STORAGE_KEY = 'imperio_digital_progress_v1';

const EMPTY_PROGRESS: CourseProgressState = {
  lessons: {},
  completedModules: {},
};

export function loadProgressState(): CourseProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<CourseProgressState>;
    return {
      lessons: parsed.lessons ?? {},
      completedModules: parsed.completedModules ?? {},
      lastModuleId: parsed.lastModuleId,
      lastLessonId: parsed.lastLessonId,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgressState(state: CourseProgressState): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function clearProgressState(): CourseProgressState {
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // Ignore
  }
  return { lessons: {}, completedModules: {} };
}

export function getLessonStatus(progress?: LessonProgress): LessonStatus {
  if (!progress) return 'not_started';
  if (progress.completed) return 'completed';
  if (progress.currentTime > 0 || progress.progressPercent > 0) return 'in_progress';
  return 'not_started';
}

export function getLessonStatusLabel(status: LessonStatus): string {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'in_progress':
      return 'Em andamento';
    default:
      return 'Não iniciada';
  }
}

export function getModuleProgress(
  module: CourseModule,
  state: CourseProgressState
): {
  percent: number;
  completedLessons: number;
  totalLessons: number;
} {
  if (module.type === 'materials') {
    const done = Boolean(state.completedModules[module.id]);
    return {
      percent: done ? 100 : 0,
      completedLessons: done ? 1 : 0,
      totalLessons: 1,
    };
  }

  const totalLessons = module.lessons.length;
  if (totalLessons === 0) {
    return { percent: 0, completedLessons: 0, totalLessons: 0 };
  }

  let completedLessons = 0;
  let sumPercent = 0;

  for (const lesson of module.lessons) {
    const lp = state.lessons[lesson.id];
    if (lp?.completed) {
      completedLessons += 1;
      sumPercent += 100;
    } else if (lp) {
      sumPercent += Math.min(99, Math.max(0, lp.progressPercent));
    }
  }

  const percent = Math.round(sumPercent / totalLessons);
  return { percent, completedLessons, totalLessons };
}

export function getOverallCourseProgress(
  modules: CourseModule[],
  state: CourseProgressState
): {
  percent: number;
  completedItems: number;
  totalItems: number;
} {
  let totalItems = 0;
  let completedItems = 0;
  let totalPercentSum = 0;

  for (const mod of modules) {
    const modStats = getModuleProgress(mod, state);
    totalItems += modStats.totalLessons;
    completedItems += modStats.completedLessons;
    totalPercentSum += modStats.percent;
  }

  const percent = modules.length > 0 ? Math.round(totalPercentSum / modules.length) : 0;
  return { percent, completedItems, totalItems };
}

export interface ContinueWatchingItem {
  module: CourseModule;
  lesson: Lesson;
  progress: LessonProgress;
}

export function getContinueWatchingItems(
  modules: CourseModule[],
  state: CourseProgressState
): ContinueWatchingItem[] {
  const items: ContinueWatchingItem[] = [];

  for (const mod of modules) {
    if (mod.type !== 'video') continue;
    for (const lesson of mod.lessons) {
      const lp = state.lessons[lesson.id];
      if (!lp) continue;
      if (lp.completed) continue;
      if (lp.currentTime <= 0 && lp.progressPercent <= 0) continue;
      items.push({ module: mod, lesson, progress: lp });
    }
  }

  items.sort((a, b) => b.progress.lastWatchedAt - a.progress.lastWatchedAt);
  return items;
}

export function formatPlaybackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const totalSec = Math.floor(seconds);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
