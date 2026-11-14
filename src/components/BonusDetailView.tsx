import { ArrowLeft, ArrowUpRight, PackageCheck } from 'lucide-react';
import {
  COVERS_WITH_EMBEDDED_ARTWORK,
  getCoverImageUrl,
} from '../config/covers';
import { BONUS_CONTENTS } from '../data/courseData';
import { CoverOverrideSettings } from '../types/course';
import { CoverFrame } from './CoverFrame';

interface BonusDetailViewProps {
  coverSettings: CoverOverrideSettings;
  onBack: () => void;
}

export function BonusDetailView({ coverSettings, onBack }: BonusDetailViewProps) {
  return (
    <div className="space-y-8 pb-8">
      {/* Barra superior de retorno */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-3 rounded-xl inline-flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar à Principal</span>
        </button>

        <span className="text-xs font-mono text-neutral-400 tabular-nums">
          3 módulos bónus
        </span>
      </div>

      {/* Cabeçalho do Módulo Bónus com a Capa Principal (Capa 7) */}
      <section className="bg-[#1F1F23] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
        <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-6 sm:gap-8 items-center">
          <div className="w-44 sm:w-48 md:w-full mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-[#0D0D0F] border border-white/10 flex items-center justify-center">
            <img
              src={getCoverImageUrl('bonus-main', coverSettings)}
              alt="Módulo Bónus — Importação"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#E50914]">
              <PackageCheck className="w-4 h-4 text-[#E50914]" aria-hidden="true" />
              <span>Bónus Exclusivos · Importação</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight text-balance">
              Módulo Bónus — Importação e Fornecedores
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
              Acede aos 3 conteúdos complementares incluídos neste módulo para aprender a importar diretamente das fábricas, comprar em plataformas internacionais (Alibaba, AliExpress e eBay) e consultar a lista exclusiva de fornecedores.
            </p>
          </div>
        </div>
      </section>

      {/* Os 3 Módulos Bónus por dentro da capa */}
      <section aria-label="Conteúdos do Módulo Bónus" className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          Conteúdos Disponíveis Neste Módulo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BONUS_CONTENTS.map((bonus) => (
            <article
              key={bonus.id}
              className="bg-[#1F1F23] rounded-3xl border border-white/10 p-4 sm:p-5 flex flex-col gap-4 shadow-[0_14px_34px_rgba(0,0,0,0.45)]"
            >
              <CoverFrame
                imageUrl={getCoverImageUrl(bonus.coverKey, coverSettings)}
                title={bonus.shortTitle}
                kicker={`Bónus ${bonus.number}`}
                subtitle={bonus.highlights?.join(' · ')}
                showTextOverlay={
                  coverSettings.showCoverTextOverlay &&
                  (Boolean(coverSettings.customCovers[bonus.coverKey]) ||
                    !COVERS_WITH_EMBEDDED_ARTWORK[bonus.coverKey])
                }
                isExternal
                href={bonus.driveUrl}
              />

              <div className="flex-1 flex flex-col justify-between gap-4 px-1">
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-white leading-snug">
                    {bonus.title}
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {bonus.description}
                  </p>
                  {bonus.highlights && bonus.highlights.length > 0 && (
                    <p className="text-xs font-medium text-neutral-400">
                      Inclui: {bonus.highlights.join(' · ')}
                    </p>
                  )}
                </div>

                <a
                  href={bonus.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#E50914] hover:bg-[#F6121D] active:scale-[0.98] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all duration-150"
                >
                  <span>{bonus.actionLabel}</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
