import { Play, PlayCircle } from 'lucide-react';
import { getCoverImageUrl } from '../config/covers';
import { getYoutubeThumbnail } from '../data/courseData';
import {
  ContinueWatchingItem,
  formatPlaybackTime,
} from '../services/progressService';
import { CourseModule, CoverOverrideSettings } from '../types/course';

interface ContinueWatchingTabProps {
  items: ContinueWatchingItem[];
  coverSettings: CoverOverrideSettings;
  onResumeLesson: (module: CourseModule, lessonId: string) => void;
  onGoToHome: () => void;
}

export function ContinueWatchingTab({
  items,
  coverSettings,
  onResumeLesson,
  onGoToHome,
}: ContinueWatchingTabProps) {
  return (
    <div className="space-y-6 pb-8">
      <header className="border-b border-white/10 pb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Continuar assistindo
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Retoma automaticamente as aulas que começaste a ver exatamente do ponto onde paraste.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="bg-[#1F1F23] rounded-3xl border border-white/10 p-8 sm:p-10 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#141417] border border-white/10 flex items-center justify-center mx-auto text-[#E50914]">
            <PlayCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-lg font-bold text-white">
              Nenhuma aula em andamento
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Assim que iniciares qualquer vídeo nos módulos do curso, ele aparecerá aqui com o teu progresso guardado.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToHome}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#F6121D] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Explorar Módulos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {items.map(({ module, lesson, progress }) => (
            <article
              key={lesson.id}
              className="bg-[#1F1F23] rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col gap-4 shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
            >
              {/* Topo: Capa 9:16 do Módulo + Miniatura do Vídeo */}
              <div className="flex items-start gap-3.5">
                {/* Capa vertical 9:16 com object-contain */}
                <div className="w-14 aspect-[9/16] rounded-lg overflow-hidden bg-[#0D0D0F] border border-white/10 shrink-0 flex items-center justify-center">
                  <img
                    src={getCoverImageUrl(module.coverKey, coverSettings)}
                    alt={module.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Miniatura 16:9 do YouTube + Identificação */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="truncate font-medium">
                      Módulo {module.number} — {module.shortTitle}
                    </span>
                  </div>

                  <h2 className="font-display text-base font-bold text-white leading-snug line-clamp-2">
                    {lesson.title}
                  </h2>

                  <div className="relative w-full max-w-[240px] aspect-video rounded-xl overflow-hidden bg-[#0D0D0F] border border-white/10">
                    <img
                      src={getYoutubeThumbnail(lesson.youtubeId)}
                      alt={lesson.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between px-2.5 py-1.5">
                      <span className="text-[11px] font-mono text-white tabular-nums">
                        {formatPlaybackTime(progress.currentTime)}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-[#E50914] tabular-nums">
                        {progress.progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de Progresso + Botão Continuar */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span>Progresso assistido</span>
                    <span className="font-mono font-semibold text-white tabular-nums">
                      {progress.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#E50914] transition-all duration-300"
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onResumeLesson(module, lesson.id)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#F6121D] active:scale-[0.98] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Continuar</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
