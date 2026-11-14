import React, { useState } from 'react';
import {
  ImagePlus,
  LifeBuoy,
  LogOut,
  RotateCcw,
  Trash2,
  User,
} from 'lucide-react';
import { COVER_SLOT_LABELS, getCoverImageUrl } from '../config/covers';
import {
  COURSE_MODULES,
  PLATFORM_NAME,
  PLATFORM_SLOGAN,
} from '../data/courseData';
import {
  getModuleProgress,
  getOverallCourseProgress,
} from '../services/progressService';
import {
  AuthSession,
  CourseProgressState,
  CoverKey,
  CoverOverrideSettings,
} from '../types/course';

interface SettingsTabProps {
  session: AuthSession;
  progressState: CourseProgressState;
  coverSettings: CoverOverrideSettings;
  onUpdateCoverSettings: (next: CoverOverrideSettings) => void;
  onResetProgress: () => void;
  onLogout: () => void;
}

export function SettingsTab({
  session,
  progressState,
  coverSettings,
  onUpdateCoverSettings,
  onResetProgress,
  onLogout,
}: SettingsTabProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [coverFeedback, setCoverFeedback] = useState<string | null>(null);

  const overall = getOverallCourseProgress(COURSE_MODULES, progressState);

  const handleCoverUpload = (
    key: CoverKey,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateCoverSettings({
          ...coverSettings,
          customCovers: {
            ...coverSettings.customCovers,
            [key]: reader.result,
          },
        });
        setCoverFeedback('Capa atualizada com sucesso neste navegador.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetSingleCover = (key: CoverKey) => {
    const updated = { ...coverSettings.customCovers };
    delete updated[key];
    onUpdateCoverSettings({
      ...coverSettings,
      customCovers: updated,
    });
    setCoverFeedback('Capa restaurada para a imagem padrão.');
  };

  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      <header className="border-b border-white/10 pb-4">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914]">
          {PLATFORM_NAME}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-neutral-400">{PLATFORM_SLOGAN}</p>
      </header>

      {/* Informações da Conta */}
      <section className="bg-[#1F1F23] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#141417] border border-white/10 flex items-center justify-center text-[#E50914] shrink-0">
            <User className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-white">
              Informações da Conta
            </h2>
            <p className="text-xs text-neutral-400">
              Sessão ativa na plataforma {PLATFORM_NAME}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10 text-sm">
          <div>
            <p className="text-xs text-neutral-400">Aluno</p>
            <p className="font-semibold text-white mt-0.5">{session.name}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Email de acesso</p>
            <p className="font-semibold text-white mt-0.5 truncate">
              {session.email}
            </p>
          </div>
        </div>
      </section>

      {/* Progresso Geral do Curso */}
      <section className="bg-[#1F1F23] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Progresso Geral do Curso
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {overall.completedItems} de {overall.totalItems} etapas concluídas
            </p>
          </div>
          <span className="font-mono text-2xl font-bold text-[#E50914] tabular-nums">
            {overall.percent}%
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[#E50914] transition-all duration-300"
            style={{ width: `${overall.percent}%` }}
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-white/10">
          {COURSE_MODULES.map((mod) => {
            const stats = getModuleProgress(mod, progressState);
            return (
              <div key={mod.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <span className="text-neutral-200 truncate">
                    Módulo {mod.number} — {mod.shortTitle}
                  </span>
                  <span className="font-mono font-semibold text-white tabular-nums shrink-0">
                    {stats.percent}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#E50914] transition-all duration-300"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          {!confirmingReset ? (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 text-xs font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reiniciar progresso guardado</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-200">
                Confirmar limpeza do progresso?
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmingReset(false);
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#F6121D] text-white text-xs font-semibold cursor-pointer"
              >
                Sim, reiniciar
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Gestor de Capas 1080x1920 */}
      <section className="bg-[#1F1F23] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Capas dos Módulos (1080x1920)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Substitui facilmente qualquer capa mantendo a proporção original sem cortes.
            </p>
          </div>

          <label className="inline-flex items-center gap-2.5 text-xs font-medium text-neutral-200 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={coverSettings.showCoverTextOverlay}
              onChange={(e) =>
                onUpdateCoverSettings({
                  ...coverSettings,
                  showCoverTextOverlay: e.target.checked,
                })
              }
              className="w-4 h-4 accent-[#E50914] rounded"
            />
            <span>Mostrar título sobreposto na capa</span>
          </label>
        </div>

        {coverFeedback && (
          <p className="text-xs text-[#E50914] font-medium">{coverFeedback}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-white/10">
          {COVER_SLOT_LABELS.map((slot) => {
            const hasCustom = Boolean(coverSettings.customCovers[slot.key]);
            return (
              <div
                key={slot.key}
                className="rounded-xl bg-[#141417] border border-white/10 p-3 flex items-center gap-3"
              >
                <div className="w-10 aspect-[9/16] rounded bg-[#0D0D0F] overflow-hidden shrink-0 flex items-center justify-center border border-white/10">
                  <img
                    src={getCoverImageUrl(slot.key, coverSettings)}
                    alt={slot.label}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-xs font-medium text-white truncate">
                    {slot.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-medium text-neutral-200 cursor-pointer transition-colors">
                      <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Carregar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverUpload(slot.key, e)}
                        className="sr-only"
                      />
                    </label>
                    {hasCustom && (
                      <button
                        type="button"
                        onClick={() => handleResetSingleCover(slot.key)}
                        aria-label={`Restaurar ${slot.label}`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Informações de Suporte */}
      <section className="bg-[#1F1F23] rounded-2xl border border-white/10 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#141417] border border-white/10 flex items-center justify-center text-[#E50914] shrink-0">
            <LifeBuoy className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Suporte ao Aluno
            </h2>
            <p className="text-xs text-neutral-400">
              Assistência técnica e dúvidas sobre os conteúdos
            </p>
          </div>
        </div>

        <p className="text-sm text-neutral-300 leading-relaxed">
          O teu progresso nas aulas e o ponto de reprodução dos vídeos são guardados automaticamente neste navegador. Caso tenhas dificuldades no acesso aos materiais do Google Drive ou dúvidas sobre a formação, entra em contacto com a equipa de apoio através do canal oficial de alunos da {PLATFORM_NAME}.
        </p>
      </section>

      {/* Sair da Conta */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-[#1F1F23] hover:bg-[#27272D] border border-white/15 text-white font-semibold text-sm inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#E50914]" aria-hidden="true" />
          <span>Sair da conta</span>
        </button>
      </div>
    </div>
  );
}
