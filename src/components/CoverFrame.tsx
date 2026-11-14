import { useState } from 'react';
import { ArrowUpRight, Play } from 'lucide-react';

interface CoverFrameProps {
  imageUrl: string;
  title: string;
  kicker: string;
  subtitle?: string;
  progressPercent?: number;
  showTextOverlay?: boolean;
  isExternal?: boolean;
  onClick?: () => void;
  href?: string;
}

/**
 * Moldura vertical 9:16 (1080x1920) com object-fit: contain para garantir
 * que nenhuma capa seja cortada, esticada ou deformada ao substituir as imagens.
 */
export function CoverFrame({
  imageUrl,
  title,
  kicker,
  subtitle,
  progressPercent,
  showTextOverlay = true,
  isExternal = false,
  onClick,
  href,
}: CoverFrameProps) {
  const [imgError, setImgError] = useState(false);

  const cardInner = (
    <div className="group relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-[#18181B] border border-white/10 shadow-[0_14px_34px_rgba(0,0,0,0.5)] transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:border-[#E50914]/75 group-hover:shadow-[0_20px_44px_rgba(0,0,0,0.68)]">
      {/* Container centralizado com object-contain preservando 100% da proporção 1080x1920 */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D0F]">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#27272A] via-[#18181B] to-[#0D0D0F]">
            <span className="font-display text-xs tracking-[0.2em] uppercase text-neutral-300 mb-2">
              IMPÉRIO DIGITAL
            </span>
            <span className="font-display text-lg font-bold text-white leading-snug">
              {title}
            </span>
          </div>
        )}
      </div>

      {/* Brilho sutil ao passar o cursor ou tocar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-200 group-hover:bg-white/[0.04]"
      />

      {/* Overlay tipográfico integrado com scrim medido para legibilidade (>=4.5:1) */}
      {showTextOverlay ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 pt-20 pb-4 px-3.5 sm:px-4 bg-gradient-to-t from-black via-black/82 to-transparent flex flex-col justify-end">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-200">
              {kicker}
            </span>
            <span className="w-7 h-7 rounded-full bg-[#E50914]/95 text-white flex items-center justify-center opacity-95 group-hover:opacity-100 group-hover:bg-[#E50914] transition-all duration-200 shrink-0 shadow-sm">
              {isExternal ? (
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />
              )}
            </span>
          </div>

          <h3 className="font-display text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 text-balance">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-neutral-300 line-clamp-1">{subtitle}</p>
          )}
        </div>
      ) : (
        <span className="pointer-events-none absolute top-3 right-3 w-8 h-8 rounded-full bg-[#E50914]/95 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
          {isExternal ? (
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
          )}
        </span>
      )}

      {/* Barra de progresso discreta na base quando há progresso registado */}
      {typeof progressPercent === 'number' && progressPercent > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 h-1 bg-black/70 z-10"
          aria-label={`Progresso: ${progressPercent}%`}
        >
          <div
            className="h-full bg-[#E50914] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] rounded-2xl active:scale-[0.98] transition-transform duration-150"
      >
        {cardInner}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] rounded-2xl active:scale-[0.98] transition-transform duration-150"
    >
      {cardInner}
    </button>
  );
}
