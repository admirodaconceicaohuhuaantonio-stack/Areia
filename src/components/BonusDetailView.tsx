import { ArrowLeft, ArrowUpRight } from 'lucide-react';
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
    <div className="space-y-6 pb-8">
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
          {BONUS_CONTENTS.length} bónus
        </span>
      </div>

      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          BÓNUS EXCLUSIVOS
        </h1>
      </header>

      {/* Os 3 Bónus no mesmo formato limpo dos outros módulos, sem descrição */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        {BONUS_CONTENTS.map((bonus) => (
          <div key={bonus.id} className="flex flex-col gap-2">
            <CoverFrame
              imageUrl={getCoverImageUrl(bonus.coverKey, coverSettings)}
              title={bonus.shortTitle}
              kicker={`Bónus ${bonus.number}`}
              showTextOverlay={
                coverSettings.showCoverTextOverlay &&
                (Boolean(coverSettings.customCovers[bonus.coverKey]) ||
                  !COVERS_WITH_EMBEDDED_ARTWORK[bonus.coverKey])
              }
              isExternal
              href={bonus.driveUrl}
            />

            <a
              href={bonus.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-1 flex items-center justify-between text-xs text-neutral-300 hover:text-white transition-colors"
            >
              <span className="truncate">Bónus {bonus.number}</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[#E50914]" aria-hidden="true" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
