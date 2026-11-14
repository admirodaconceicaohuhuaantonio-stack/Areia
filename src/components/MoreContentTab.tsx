import { ArrowUpRight } from 'lucide-react';
import { getCoverImageUrl } from '../config/covers';
import { BONUS_CONTENTS } from '../data/courseData';
import { CoverOverrideSettings } from '../types/course';
import { CoverFrame } from './CoverFrame';

interface MoreContentTabProps {
  coverSettings: CoverOverrideSettings;
}

export function MoreContentTab({ coverSettings }: MoreContentTabProps) {
  return (
    <div className="space-y-8 pb-8">
      <header className="border-b border-white/10 pb-4">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914]">
          BÓNUS EXCLUSIVOS
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
          Mais conteúdos · Importação
        </h1>
        <p className="mt-1.5 text-sm text-neutral-300 max-w-2xl">
          Materiais complementares exclusivos sobre importação direta, plataformas internacionais e fornecedores selecionados. Clica em qualquer cartão para abrir numa nova aba.
        </p>
      </header>

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
              showTextOverlay={coverSettings.showCoverTextOverlay}
              isExternal
              href={bonus.driveUrl}
            />

            <div className="flex-1 flex flex-col justify-between gap-4 px-1">
              <div className="space-y-2">
                <h2 className="font-display text-lg font-bold text-white leading-snug">
                  {bonus.title}
                </h2>
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
    </div>
  );
}
