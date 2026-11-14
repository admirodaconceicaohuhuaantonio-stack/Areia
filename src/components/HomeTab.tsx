import { ArrowRight, BookOpen, Play } from 'lucide-react';
import {
  BONUS_CONTENTS,
  COURSE_MODULES,
  PLATFORM_NAME,
  PLATFORM_SLOGAN,
} from '../data/courseData';
import {
  COVERS_WITH_EMBEDDED_ARTWORK,
  getCoverImageUrl,
} from '../config/covers';
import {
  ContinueWatchingItem,
  getModuleProgress,
  getOverallCourseProgress,
} from '../services/progressService';
import {
  CourseModule,
  CourseProgressState,
  CoverOverrideSettings,
} from '../types/course';
import { CoverFrame } from './CoverFrame';

interface HomeTabProps {
  progressState: CourseProgressState;
  coverSettings: CoverOverrideSettings;
  continueItems: ContinueWatchingItem[];
  onOpenModule: (module: CourseModule, lessonId?: string) => void;
  onOpenBonusModule: () => void;
}

export function HomeTab({
  progressState,
  coverSettings,
  continueItems,
  onOpenModule,
  onOpenBonusModule,
}: HomeTabProps) {
  const overall = getOverallCourseProgress(COURSE_MODULES, progressState);
  const latestResume = continueItems[0];
  const featuredModule = latestResume ? latestResume.module : COURSE_MODULES[0];

  const handleFeaturedAction = () => {
    if (latestResume) {
      onOpenModule(latestResume.module, latestResume.lesson.id);
    } else {
      onOpenModule(COURSE_MODULES[0]);
    }
  };

  return (
    <div className="space-y-10 pb-8">
      {/* Cabeçalho Editorial da Plataforma */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914]">
            Área de Membros
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-0.5">
            {PLATFORM_NAME}
          </h1>
          <p className="text-sm text-neutral-300 mt-1">{PLATFORM_SLOGAN}</p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 min-w-[200px]">
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-neutral-300">
            <span>Progresso do curso</span>
            <span className="font-mono font-semibold text-white tabular-nums">
              {overall.percent}%
            </span>
          </div>
          <div className="w-full sm:w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#E50914] transition-all duration-300"
              style={{ width: `${overall.percent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Destaque Principal (Hero Focal Anchor) */}
      <section
        aria-label="Destaque da formação"
        className="relative rounded-3xl bg-gradient-to-br from-[#232329] via-[#1B1B20] to-[#141416] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_260px] gap-6 p-6 sm:p-8 items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-300">
              <span className="text-[#E50914] font-semibold">
                {latestResume ? 'Retomar Formação' : 'Início Recomendado'}
              </span>
              <span aria-hidden="true">·</span>
              <span>Módulo {featuredModule.number}</span>
              {latestResume && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {latestResume.progress.progressPercent}% concluído
                  </span>
                </>
              )}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight text-balance">
              {latestResume ? latestResume.lesson.title : featuredModule.title}
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
              {latestResume
                ? `Continua exatamente de onde paraste no Módulo ${featuredModule.number} — ${featuredModule.shortTitle}.`
                : featuredModule.description}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleFeaturedAction}
                className="min-h-[44px] px-6 py-3 rounded-xl bg-[#E50914] hover:bg-[#F6121D] active:scale-[0.98] text-white font-semibold text-sm inline-flex items-center gap-2.5 shadow-[0_8px_24px_rgba(229,9,20,0.34)] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {latestResume ? (
                  <>
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Continuar Aula</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    <span>Aceder ao Módulo 1</span>
                  </>
                )}
              </button>

              {!latestResume && (
                <button
                  type="button"
                  onClick={() => onOpenModule(COURSE_MODULES[1])}
                  className="min-h-[44px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm inline-flex items-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
                >
                  <span>Explorar Aulas em Vídeo</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Pré-visualização vertical 9:16 do módulo em destaque */}
          <div className="hidden md:block w-full max-w-[240px] justify-self-end">
            <CoverFrame
              imageUrl={getCoverImageUrl(featuredModule.coverKey, coverSettings)}
              title={featuredModule.shortTitle}
              kicker={`Módulo ${featuredModule.number}`}
              progressPercent={getModuleProgress(featuredModule, progressState).percent}
              showTextOverlay={
                coverSettings.showCoverTextOverlay &&
                (Boolean(coverSettings.customCovers[featuredModule.coverKey]) ||
                  !COVERS_WITH_EMBEDDED_ARTWORK[featuredModule.coverKey])
              }
              onClick={handleFeaturedAction}
            />
          </div>
        </div>
      </section>

      {/* Secção dos 6 Módulos Principais */}
      <section aria-labelledby="heading-modules" className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2
              id="heading-modules"
              className="font-display text-xl sm:text-2xl font-bold text-white"
            >
              Módulos do Curso
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Seleciona um módulo para assistir às aulas ou aceder aos materiais.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400 tabular-nums whitespace-nowrap">
            6 módulos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {COURSE_MODULES.map((mod) => {
            const stats = getModuleProgress(mod, progressState);
            const subtitle =
              mod.type === 'materials'
                ? 'Pasta de Materiais'
                : `${stats.completedLessons}/${stats.totalLessons} aulas`;

            return (
              <div key={mod.id} className="flex flex-col gap-2">
                <CoverFrame
                  imageUrl={getCoverImageUrl(mod.coverKey, coverSettings)}
                  title={mod.shortTitle}
                  kicker={`Módulo ${mod.number}`}
                  subtitle={subtitle}
                  progressPercent={stats.percent}
                  showTextOverlay={
                    coverSettings.showCoverTextOverlay &&
                    (Boolean(coverSettings.customCovers[mod.coverKey]) ||
                      !COVERS_WITH_EMBEDDED_ARTWORK[mod.coverKey])
                  }
                  onClick={() => onOpenModule(mod)}
                />

                <div className="px-1 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate">{subtitle}</span>
                  <span className="font-mono font-semibold text-white tabular-nums ml-2">
                    {stats.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Secção Especial BÓNUS EXCLUSIVOS — Mesmo formato limpo dos outros módulos */}
      <section aria-labelledby="heading-bonus" className="space-y-4 pt-2">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="heading-bonus"
            className="font-display text-xl sm:text-2xl font-bold text-white"
          >
            BÓNUS EXCLUSIVOS
          </h2>
          <span className="text-xs font-mono text-neutral-400 tabular-nums whitespace-nowrap">
            {BONUS_CONTENTS.length} conteúdos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <CoverFrame
              imageUrl={getCoverImageUrl('bonus-main', coverSettings)}
              title="Bónus Exclusivos"
              kicker="Módulo 7"
              subtitle={`${BONUS_CONTENTS.length} conteúdos`}
              showTextOverlay={
                coverSettings.showCoverTextOverlay &&
                (Boolean(coverSettings.customCovers['bonus-main']) ||
                  !COVERS_WITH_EMBEDDED_ARTWORK['bonus-main'])
              }
              onClick={onOpenBonusModule}
            />

            <div className="px-1 flex items-center justify-between text-xs text-neutral-400">
              <span className="truncate">Importação</span>
              <span className="font-mono font-semibold text-white tabular-nums ml-2">
                {BONUS_CONTENTS.length} bónus
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
