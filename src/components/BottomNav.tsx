import { Home, PlayCircle, Sparkles, Settings } from 'lucide-react';
import { TabId } from '../types/course';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  continueWatchingCount: number;
}

const NAV_ITEMS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'principal', label: 'Principal', icon: Home },
  { id: 'continuar', label: 'Continuar assistindo', icon: PlayCircle },
  { id: 'mais', label: 'Mais conteúdos', icon: Sparkles },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export function BottomNav({
  activeTab,
  onSelectTab,
  continueWatchingCount,
}: BottomNavProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F0F12]/95 backdrop-blur-md border-t border-white/10 pb-safe"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-4 h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-inset ${
                isActive
                  ? 'text-[#E50914]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {/* Indicador sutil no topo da aba selecionada */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-[#E50914]"
                />
              )}

              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-[22px] h-[22px] transition-transform duration-150 ${
                    isActive ? 'scale-105 stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                  aria-hidden="true"
                />
                {item.id === 'continuar' && continueWatchingCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E50914] text-white text-[10px] font-bold tabular-nums flex items-center justify-center leading-none"
                    aria-label={`${continueWatchingCount} aulas em andamento`}
                  >
                    {continueWatchingCount}
                  </span>
                )}
              </div>

              <span
                className={`mt-1 text-[10px] sm:text-[11px] leading-tight truncate max-w-full whitespace-nowrap ${
                  isActive ? 'font-semibold text-white' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
