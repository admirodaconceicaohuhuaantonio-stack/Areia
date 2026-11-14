import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ExternalLink,
  FolderOpen,
  PlayCircle,
} from 'lucide-react';
import { getCoverImageUrl } from '../config/covers';
import { getYoutubeThumbnail } from '../data/courseData';
import {
  formatPlaybackTime,
  getLessonStatus,
  getLessonStatusLabel,
  getModuleProgress,
} from '../services/progressService';
import {
  CourseModule,
  CourseProgressState,
  CoverOverrideSettings,
  Lesson,
} from '../types/course';
import { YouTubePlayer } from './YouTubePlayer';

interface ModuleDetailViewProps {
  module: CourseModule;
  initialLessonId?: string;
  progressState: CourseProgressState;
  coverSettings: CoverOverrideSettings;
  onBack: () => void;
  onUpdateLessonProgress: (
    moduleId: string,
    lessonId: string,
    currentTime: number,
    duration: number,
    completed: boolean
  ) => void;
  onToggleLessonCompleted: (moduleId: string, lessonId: string) => void;
  onToggleModuleCompleted: (moduleId: string, completed?: boolean) => void;
}

export function ModuleDetailView({
  module,
  initialLessonId,
  progressState,
  coverSettings,
  onBack,
  onUpdateLessonProgress,
  onToggleLessonCompleted,
  onToggleModuleCompleted,
}: ModuleDetailViewProps) {
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    if (initialLessonId && module.lessons.some((l) => l.id === initialLessonId)) {
      return initialLessonId;
    }
    // Se houver uma aula em andamento neste módulo, abre nela por defeito
    const inProgress = module.lessons.find((l) => {
      const lp = progressState.lessons[l.id];
      return lp && !lp.completed && lp.currentTime > 0;
    });
    return inProgress?.id ?? module.lessons[0]?.id ?? '';
  });

  // Captura o timestamp inicial ao abrir ou mudar de aula (para não reiniciar durante a reprodução)
  const [resumeStartSeconds, setResumeStartSeconds] = useState<number>(() => {
    if (!activeLessonId) return 0;
    const saved = progressState.lessons[activeLessonId];
    if (!saved || saved.completed) return 0;
    return saved.currentTime ?? 0;
  });

  useEffect(() => {
    if (initialLessonId && module.lessons.some((l) => l.id === initialLessonId)) {
      setActiveLessonId(initialLessonId);
      const saved = progressState.lessons[initialLessonId];
      setResumeStartSeconds(saved && !saved.completed ? saved.currentTime ?? 0 : 0);
    }
  }, [initialLessonId, module.id]);

  const selectLesson = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
    const saved = progressState.lessons[lesson.id];
    setResumeStartSeconds(saved && !saved.completed ? saved.currentTime ?? 0 : 0);
  };

  const moduleStats = getModuleProgress(module, progressState);

  const handlePlayerProgress = useCallback(
    (currentTime: number, duration: number, ended: boolean) => {
      if (!activeLessonId || duration <= 0) return;
      const percent = Math.min(100, Math.round((currentTime / duration) * 100));
      const alreadyDone = Boolean(progressState.lessons[activeLessonId]?.completed);
      const isNowDone = ended || percent >= 90 || alreadyDone;
      onUpdateLessonProgress(module.id, activeLessonId, currentTime, duration, isNowDone);
    },
    [activeLessonId, module.id, onUpdateLessonProgress, progressState.lessons]
  );

  // Renderização para Módulo 1 (Materiais no Google Drive)
  if (module.type === 'materials') {
    const isCompleted = Boolean(progressState.completedModules[module.id]);

    return (
      <div className="space-y-6 pb-8">
        {/* Barra superior de retorno */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] px-3 -ml-3 rounded-xl inline-flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Voltar aos Módulos</span>
          </button>

          <div className="flex items-center gap-3 text-xs text-neutral-300">
            <span>Módulo {module.number}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-semibold text-white tabular-nums">
              Progresso: {moduleStats.percent}%
            </span>
          </div>
        </div>

        {/* Conteúdo organizado de Materiais */}
        <div className="bg-[#1F1F23] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-6 sm:gap-8 items-start">
            <div className="w-44 sm:w-52 md:w-full mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-[#0D0D0F] border border-white/10 flex items-center justify-center">
              <img
                src={getCoverImageUrl(module.coverKey, coverSettings)}
                alt={module.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
                  Módulo 01 · Recursos & Documentos
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1.5 text-balance">
                  {module.title}
                </h1>
                <p className="text-sm sm:text-base text-neutral-300 mt-3 leading-relaxed">
                  {module.description}
                </p>
              </div>

              <div className="rounded-2xl bg-[#141417] border border-white/10 p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
                  <FolderOpen className="w-5 h-5 text-[#E50914]" aria-hidden="true" />
                  <span>Pasta Oficial de Materiais (Google Drive)</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Todos os ficheiros de apoio, modelos e documentos deste módulo estão organizados nesta pasta exclusiva. Ao abrir, a pasta será aberta numa nova aba com segurança.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={module.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onToggleModuleCompleted(module.id, true)}
                    className="min-h-[44px] px-5 py-3 rounded-xl bg-[#E50914] hover:bg-[#F6121D] active:scale-[0.98] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-[0_8px_20px_rgba(229,9,20,0.32)] transition-all duration-150"
                  >
                    <span>Aceder à Pasta de Materiais</span>
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onToggleModuleCompleted(module.id)}
                    className={`min-h-[44px] px-4 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2 border transition-colors cursor-pointer ${
                      isCompleted
                        ? 'bg-[#E50914]/20 border-[#E50914]/60 text-white'
                        : 'bg-white/5 border-white/15 text-neutral-200 hover:bg-white/10'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#E50914]" aria-hidden="true" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                    )}
                    <span>{isCompleted ? 'Módulo Concluído' : 'Marcar como Concluído'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização para Módulos em Vídeo (Módulos 2 a 6)
  const activeIndex = Math.max(
    0,
    module.lessons.findIndex((l) => l.id === activeLessonId)
  );
  const currentLesson = module.lessons[activeIndex] ?? module.lessons[0];
  const currentProgress = progressState.lessons[currentLesson.id];
  const currentStatus = getLessonStatus(currentProgress);
  const currentPercent = currentProgress?.completed
    ? 100
    : currentProgress?.progressPercent ?? 0;

  const prevLesson = activeIndex > 0 ? module.lessons[activeIndex - 1] : null;
  const nextLesson =
    activeIndex < module.lessons.length - 1 ? module.lessons[activeIndex + 1] : null;

  return (
    <div className="space-y-5 pb-8">
      {/* Topo do Módulo com Retorno e Barra de Progresso do Módulo */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] px-3 -ml-2 rounded-xl inline-flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Voltar</span>
          </button>

          <div className="min-w-0">
            <p className="text-xs text-neutral-400">
              Módulo {module.number} · {module.subtitle}
            </p>
            <h1 className="font-display text-lg sm:text-xl font-bold text-white truncate">
              {module.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-neutral-300">
            <span>Progresso do módulo</span>
            <span className="font-mono font-semibold text-white tabular-nums">
              {moduleStats.percent}%
            </span>
          </div>
          <div className="w-full sm:w-44 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#E50914] transition-all duration-300"
              style={{ width: `${moduleStats.percent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Layout Playlist Estilo YouTube (Player à esquerda/topo + Lista lateral/inferior) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* Área Principal do Player */}
        <div className="space-y-4">
          <YouTubePlayer
            key={currentLesson.id}
            videoId={currentLesson.youtubeId}
            title={currentLesson.title}
            initialTime={resumeStartSeconds}
            onProgressUpdate={handlePlayerProgress}
          />

          {/* Informação da Aula Atual + Barra de Progresso */}
          <div className="bg-[#1F1F23] rounded-2xl border border-white/10 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                  <span className="font-mono font-semibold text-white tabular-nums">
                    Aula {String(currentLesson.number).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    {currentStatus === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E50914]" aria-hidden="true" />
                    ) : currentStatus === 'in_progress' ? (
                      <PlayCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
                    )}
                    <span>{getLessonStatusLabel(currentStatus)}</span>
                  </span>
                  {currentProgress && currentProgress.duration > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatPlaybackTime(currentProgress.currentTime)} /{' '}
                        {formatPlaybackTime(currentProgress.duration)}
                      </span>
                    </>
                  )}
                </div>

                <h2 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
                  {currentLesson.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onToggleLessonCompleted(module.id, currentLesson.id)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shrink-0 border transition-colors cursor-pointer whitespace-nowrap ${
                  currentStatus === 'completed'
                    ? 'bg-[#E50914] border-[#E50914] text-white'
                    : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>
                  {currentStatus === 'completed'
                    ? 'Aula Concluída'
                    : 'Marcar como Concluída'}
                </span>
              </button>
            </div>

            {/* Barra de progresso individual da aula */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>Progresso da aula</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {currentPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#E50914] transition-all duration-300"
                  style={{ width: `${currentPercent}%` }}
                />
              </div>
            </div>

            {/* Controlos Anterior / Próxima Aula */}
            <div className="pt-1 flex items-center justify-between gap-3 border-t border-white/10">
              <button
                type="button"
                disabled={!prevLesson}
                onClick={() => prevLesson && selectLesson(prevLesson)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none text-white text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Aula anterior</span>
              </button>

              <button
                type="button"
                disabled={!nextLesson}
                onClick={() => nextLesson && selectLesson(nextLesson)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#F6121D] disabled:opacity-40 disabled:pointer-events-none text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Próxima aula</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Reprodução Lateral / Inferior */}
        <aside
          aria-label="Lista de aulas do módulo"
          className="bg-[#1F1F23] rounded-2xl border border-white/10 overflow-hidden shadow-[0_14px_34px_rgba(0,0,0,0.45)]"
        >
          <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between gap-2">
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Aulas do Módulo
            </h3>
            <span className="text-xs font-mono text-neutral-300 tabular-nums">
              {moduleStats.completedLessons}/{moduleStats.totalLessons} concluídas
            </span>
          </div>

          <div className="divide-y divide-white/10 max-h-[540px] overflow-y-auto">
            {module.lessons.map((lesson) => {
              const lp = progressState.lessons[lesson.id];
              const status = getLessonStatus(lp);
              const pct = lp?.completed ? 100 : lp?.progressPercent ?? 0;
              const isSelected = lesson.id === currentLesson.id;

              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => selectLesson(lesson)}
                  aria-current={isSelected ? 'true' : undefined}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer min-h-[68px] ${
                    isSelected
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Miniatura 16:9 */}
                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-[#0D0D0F] shrink-0 border border-white/10">
                    <img
                      src={getYoutubeThumbnail(lesson.youtubeId)}
                      alt={lesson.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {pct > 0 && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-black/70">
                        <div
                          className="h-full bg-[#E50914]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Metadados e Estado */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-mono font-semibold tabular-nums ${
                          isSelected ? 'text-[#E50914]' : 'text-neutral-400'
                        }`}
                      >
                        Aula {String(lesson.number).padStart(2, '0')}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E50914]" aria-hidden="true" />
                        ) : status === 'in_progress' ? (
                          <PlayCircle className="w-3.5 h-3.5 text-neutral-200" aria-hidden="true" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-neutral-600" aria-hidden="true" />
                        )}
                        <span>{getLessonStatusLabel(status)}</span>
                      </span>
                    </div>

                    <p
                      className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 ${
                        isSelected ? 'text-white' : 'text-neutral-200'
                      }`}
                    >
                      {lesson.title.replace(/^Aula \d+\s*—\s*/i, '')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
