import { ArrowUpRight } from 'lucide-react';
import {
  COVERS_WITH_EMBEDDED_ARTWORK,
  getCoverImageUrl,
} from '../config/covers';
import { BONUS_CONTENTS } from '../data/courseData';
import { CoverOverrideSettings } from '../types/course';
import { CoverFrame } from './CoverFrame';

interface MoreContentTabProps {
  coverSettings: CoverOverrideSettings;
}

export function MoreContentTab({ coverSettings }: MoreContentTabProps) {
  return (
    <div className="space-y-6 pb-8">
      <header className="border-b border-white/10 pb-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914]">
            BÓNUS EXCLUSIVOS
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
            Mais conteúdos
          </h1>
        </div>
        <span className="text-xs font-mono text-neutral-400 tabular-nums whitespace-nowrap">
          {BONUS_CONTENTS.length} bónus
        </span>
      </header>

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
