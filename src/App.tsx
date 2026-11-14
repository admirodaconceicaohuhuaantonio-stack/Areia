import { useCallback, useMemo, useState } from 'react';
import { BonusDetailView } from './components/BonusDetailView';
import { BottomNav } from './components/BottomNav';
import { ContinueWatchingTab } from './components/ContinueWatchingTab';
import { HomeTab } from './components/HomeTab';
import { LoginView } from './components/LoginView';
import { ModuleDetailView } from './components/ModuleDetailView';
import { MoreContentTab } from './components/MoreContentTab';
import { SettingsTab } from './components/SettingsTab';
import { loadCoverSettings, saveCoverSettings } from './config/covers';
import { COURSE_MODULES } from './data/courseData';
import { authService } from './services/authService';
import {
  clearProgressState,
  getContinueWatchingItems,
  loadProgressState,
  saveProgressState,
} from './services/progressService';
import {
  AuthSession,
  CourseModule,
  CourseProgressState,
  CoverOverrideSettings,
  TabId,
} from './types/course';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    authService.getSession()
  );
  const [activeTab, setActiveTab] = useState<TabId>('principal');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(
    undefined
  );
  const [showBonusModule, setShowBonusModule] = useState(false);

  const [progressState, setProgressState] = useState<CourseProgressState>(() =>
    loadProgressState()
  );
  const [coverSettings, setCoverSettings] = useState<CoverOverrideSettings>(() =>
    loadCoverSettings()
  );

  const continueItems = useMemo(
    () => getContinueWatchingItems(COURSE_MODULES, progressState),
    [progressState]
  );

  const activeModule = useMemo(
    () => COURSE_MODULES.find((m) => m.id === selectedModuleId) ?? null,
    [selectedModuleId]
  );

  const handleOpenModule = useCallback(
    (module: CourseModule, lessonId?: string) => {
      setShowBonusModule(false);
      setSelectedModuleId(module.id);
      setSelectedLessonId(lessonId);
      setActiveTab('principal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const handleOpenBonusModule = useCallback(() => {
    setSelectedModuleId(null);
    setSelectedLessonId(undefined);
    setShowBonusModule(true);
    setActiveTab('principal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setSelectedModuleId(null);
    setSelectedLessonId(undefined);
    setShowBonusModule(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleUpdateLessonProgress = useCallback(
    (
      moduleId: string,
      lessonId: string,
      currentTime: number,
      duration: number,
      completed: boolean
    ) => {
      setProgressState((prev) => {
        const existing = prev.lessons[lessonId];
        const progressPercent = completed
          ? 100
          : duration > 0
          ? Math.min(99, Math.max(0, Math.round((currentTime / duration) * 100)))
          : existing?.progressPercent ?? 0;

        const next: CourseProgressState = {
          ...prev,
          lastModuleId: moduleId,
          lastLessonId: lessonId,
          lessons: {
            ...prev.lessons,
            [lessonId]: {
              lessonId,
              moduleId,
              currentTime,
              duration,
              progressPercent,
              completed,
              lastWatchedAt: Date.now(),
            },
          },
        };

        saveProgressState(next);
        return next;
      });
    },
    []
  );

  const handleToggleLessonCompleted = useCallback(
    (moduleId: string, lessonId: string) => {
      setProgressState((prev) => {
        const existing = prev.lessons[lessonId];
        const nextCompleted = !existing?.completed;
        const duration = existing?.duration ?? 0;
        const currentTime = nextCompleted ? duration : existing?.currentTime ?? 0;
        const progressPercent = nextCompleted
          ? 100
          : duration > 0
          ? Math.min(99, Math.round((currentTime / duration) * 100))
          : 0;

        const next: CourseProgressState = {
          ...prev,
          lessons: {
            ...prev.lessons,
            [lessonId]: {
              lessonId,
              moduleId,
              currentTime,
              duration,
              progressPercent,
              completed: nextCompleted,
              lastWatchedAt: Date.now(),
            },
          },
        };

        saveProgressState(next);
        return next;
      });
    },
    []
  );

  const handleToggleModuleCompleted = useCallback(
    (moduleId: string, forceValue?: boolean) => {
      setProgressState((prev) => {
        const current = Boolean(prev.completedModules[moduleId]);
        const nextVal = forceValue !== undefined ? forceValue : !current;
        const next: CourseProgressState = {
          ...prev,
          completedModules: {
            ...prev.completedModules,
            [moduleId]: nextVal,
          },
        };
        saveProgressState(next);
        return next;
      });
    },
    []
  );

  const handleUpdateCoverSettings = useCallback(
    (next: CoverOverrideSettings) => {
      setCoverSettings(next);
      saveCoverSettings(next);
    },
    []
  );

  const handleResetProgress = useCallback(() => {
    const empty = clearProgressState();
    setProgressState(empty);
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setSession(null);
    setSelectedModuleId(null);
    setSelectedLessonId(undefined);
    setShowBonusModule(false);
    setActiveTab('principal');
  }, []);

  // Proteção de rotas internas: exige autenticação antes de exibir o conteúdo
  if (!session) {
    return <LoginView onLoginSuccess={(newSession) => setSession(newSession)} />;
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-24">
        {activeModule ? (
          <ModuleDetailView
            module={activeModule}
            initialLessonId={selectedLessonId}
            progressState={progressState}
            coverSettings={coverSettings}
            onBack={() => {
              setSelectedModuleId(null);
              setSelectedLessonId(undefined);
            }}
            onUpdateLessonProgress={handleUpdateLessonProgress}
            onToggleLessonCompleted={handleToggleLessonCompleted}
            onToggleModuleCompleted={handleToggleModuleCompleted}
          />
        ) : showBonusModule ? (
          <BonusDetailView
            coverSettings={coverSettings}
            onBack={() => setShowBonusModule(false)}
          />
        ) : activeTab === 'principal' ? (
          <HomeTab
            progressState={progressState}
            coverSettings={coverSettings}
            continueItems={continueItems}
            onOpenModule={handleOpenModule}
            onOpenBonusModule={handleOpenBonusModule}
          />
        ) : activeTab === 'continuar' ? (
          <ContinueWatchingTab
            items={continueItems}
            coverSettings={coverSettings}
            onResumeLesson={handleOpenModule}
            onGoToHome={() => handleSelectTab('principal')}
          />
        ) : activeTab === 'mais' ? (
          <MoreContentTab coverSettings={coverSettings} />
        ) : (
          <SettingsTab
            session={session}
            progressState={progressState}
            coverSettings={coverSettings}
            onUpdateCoverSettings={handleUpdateCoverSettings}
            onResetProgress={handleResetProgress}
            onLogout={handleLogout}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        continueWatchingCount={continueItems.length}
      />
    </div>
  );
}
