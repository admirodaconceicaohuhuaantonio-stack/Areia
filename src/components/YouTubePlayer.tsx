import {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatPlaybackTime } from '../services/progressService';

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: {
              data: number;
              target: YTPlayerInstance;
            }) => void;
            onError?: () => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState?: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  destroy: () => void;
}

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise<void>((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      resolve();
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    } else {
      const interval = window.setInterval(() => {
        if (window.YT && window.YT.Player) {
          window.clearInterval(interval);
          resolve();
        }
      }, 100);
    }
  });

  return ytApiPromise;
}

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  initialTime?: number;
  onProgressUpdate: (
    currentTime: number,
    duration: number,
    ended: boolean
  ) => void;
}

export function YouTubePlayer({
  videoId,
  title,
  initialTime = 0,
  onProgressUpdate,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const hideControlsTimerRef = useRef<number | null>(null);
  const startTimeoutRef = useRef<number | null>(null);
  const onProgressRef = useRef(onProgressUpdate);
  const initialTimeRef = useRef(initialTime);
  const pendingPlayRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(() =>
    Math.max(0, Math.floor(initialTime))
  );
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isCssExpanded, setIsCssExpanded] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [retryToken, setRetryToken] = useState(0);
  const [posterSrc, setPosterSrc] = useState(
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  );

  onProgressRef.current = onProgressUpdate;
  initialTimeRef.current = initialTime;

  const clearHideTimer = useCallback(() => {
    if (hideControlsTimerRef.current !== null) {
      window.clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideTimer();
    setControlsVisible(true);
    hideControlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, [clearHideTimer]);

  useEffect(() => {
    setPosterSrc(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
  }, [videoId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsNativeFullscreen(active);
      if (!active) {
        setIsCssExpanded(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    pendingPlayRef.current = false;
    setIsReady(false);
    setIsPlaying(false);
    setIsBuffering(false);
    setHasStarted(false);
    setHasError(false);
    setControlsVisible(true);
    setCurrentTime(Math.max(0, Math.floor(initialTimeRef.current)));
    setDuration(0);

    const stopPolling = () => {
      if (pollTimerRef.current !== null) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const clearStartTimeout = () => {
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }
    };

    const syncMetrics = (ended = false) => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const cur = player.getCurrentTime?.() ?? 0;
        const dur = player.getDuration?.() ?? 0;
        if (dur > 0) {
          setDuration(dur);
          setCurrentTime(ended ? dur : cur);
          onProgressRef.current(ended ? dur : cur, dur, ended);
        }
      } catch {
        // Ignore transient reads during player teardown
      }
    };

    loadYouTubeIframeAPI().then(() => {
      if (isCancelled || !hostRef.current || !window.YT?.Player) return;

      hostRef.current.innerHTML = '';
      const mountNode = document.createElement('div');
      mountNode.className = 'w-full h-full';
      hostRef.current.appendChild(mountNode);

      const startSeconds = Math.max(0, Math.floor(initialTimeRef.current));

      playerRef.current = new window.YT.Player(mountNode, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 0,
          fs: 0,
          disablekb: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          enablejsapi: 1,
          start: startSeconds,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (isCancelled) return;
            setIsReady(true);
            try {
              const dur = event.target.getDuration?.() ?? 0;
              if (dur > 0) setDuration(dur);
              setIsMuted(Boolean(event.target.isMuted?.()));
              if (pendingPlayRef.current) {
                pendingPlayRef.current = false;
                event.target.playVideo();
              }
            } catch {
              // Ignore
            }
          },
          onStateChange: (event) => {
            if (isCancelled) return;
            const states = window.YT?.PlayerState;
            const playingState = states?.PLAYING ?? 1;
            const pausedState = states?.PAUSED ?? 2;
            const endedState = states?.ENDED ?? 0;
            const bufferingState = states?.BUFFERING ?? 3;

            if (event.data === playingState) {
              clearStartTimeout();
              setIsBuffering(false);
              setIsPlaying(true);
              setHasStarted(true);
              scheduleHideControls();
              stopPolling();
              syncMetrics(false);
              pollTimerRef.current = window.setInterval(() => {
                syncMetrics(false);
              }, 500);
            } else if (event.data === bufferingState) {
              setIsBuffering(true);
            } else if (event.data === pausedState) {
              clearStartTimeout();
              clearHideTimer();
              setIsBuffering(false);
              setIsPlaying(false);
              setControlsVisible(true);
              stopPolling();
              syncMetrics(false);
            } else if (event.data === endedState) {
              clearStartTimeout();
              clearHideTimer();
              setIsBuffering(false);
              setIsPlaying(false);
              setControlsVisible(true);
              stopPolling();
              syncMetrics(true);
            }
          },
          onError: () => {
            if (isCancelled) return;
            clearStartTimeout();
            setIsReady(true);
            setIsBuffering(false);
            setIsPlaying(false);
            setHasError(true);
          },
        },
      });
    });

    return () => {
      isCancelled = true;
      stopPolling();
      clearStartTimeout();
      clearHideTimer();
      syncMetrics(false);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore destroy errors
        }
        playerRef.current = null;
      }
    };
  }, [videoId, retryToken, clearHideTimer, scheduleHideControls]);

  const handlePlay = () => {
    if (hasError) return;
    setHasStarted(true);
    setIsBuffering(true);

    if (startTimeoutRef.current !== null) {
      window.clearTimeout(startTimeoutRef.current);
    }
    startTimeoutRef.current = window.setTimeout(() => {
      setIsBuffering(false);
    }, 4000);

    const player = playerRef.current;
    if (player && isReady) {
      try {
        player.playVideo();
      } catch {
        setIsBuffering(false);
      }
    } else {
      pendingPlayRef.current = true;
    }
  };

  const handlePause = () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      player.pauseVideo();
    } catch {
      // Ignore
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const targetSeconds = Number(event.target.value);
    setCurrentTime(targetSeconds);
    const player = playerRef.current;
    if (!player || !isReady) return;
    try {
      player.seekTo(targetSeconds, true);
      if (duration > 0) {
        onProgressRef.current(targetSeconds, duration, false);
      }
    } catch {
      // Ignore
    }
    if (isPlaying) {
      scheduleHideControls();
    }
  };

  const handleToggleMute = () => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    try {
      if (player.isMuted?.()) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    } catch {
      // Ignore
    }
    if (isPlaying) {
      scheduleHideControls();
    }
  };

  const handleToggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsNativeFullscreen(false);
        setIsCssExpanded(false);
        return;
      }

      if (typeof el.requestFullscreen === 'function') {
        await el.requestFullscreen();
        setIsNativeFullscreen(true);
        return;
      }
    } catch {
      // Fallback to CSS expanded mode on browsers where Fullscreen API is blocked (e.g., iOS Safari)
    }

    setIsCssExpanded((prev) => !prev);
  };

  const isExpanded = isNativeFullscreen || isCssExpanded;
  const safeDuration = duration > 0 ? duration : 0;
  const progressPercent =
    safeDuration > 0
      ? Math.min(100, Math.max(0, (currentTime / safeDuration) * 100))
      : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={() => {
        if (isPlaying) scheduleHideControls();
      }}
      onMouseLeave={() => {
        if (isPlaying) {
          clearHideTimer();
          setControlsVisible(false);
        }
      }}
      className={
        isCssExpanded && !isNativeFullscreen
          ? 'fixed inset-0 z-50 bg-black flex items-center justify-center p-2 sm:p-6'
          : 'relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0D0D0F] border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.58)] group select-none'
      }
    >
      <div
        className={
          isCssExpanded && !isNativeFullscreen
            ? 'relative w-full max-w-6xl aspect-video rounded-xl overflow-hidden bg-[#0D0D0F] border border-white/10 group select-none'
            : 'relative w-full h-full'
        }
      >
        {/* Iframe do vídeo com controlos nativos ocultos */}
        <div
          ref={hostRef}
          aria-label={`Player de vídeo: ${title}`}
          className="w-full h-full pointer-events-none"
        />

        {/* Overlay transparente enquanto reproduz (impede cliques diretos na UI nativa) */}
        {isPlaying && !hasError && (
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label="Pausar aula"
            className="absolute inset-0 bottom-14 z-10 cursor-pointer bg-transparent focus:outline-none"
          />
        )}

        {/* Tela fusca (escura e desfocada) com Botão Play Amarelo; desaparece ao clicar no play e iniciar o vídeo */}
        {!hasError && (
          <div
            className={`absolute inset-0 z-10 bg-[#08080A] flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
              isPlaying
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100 pointer-events-auto'
            }`}
          >
            <img
              src={posterSrc}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              onError={() => {
                const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                if (posterSrc !== fallback) {
                  setPosterSrc(fallback);
                }
              }}
              className="w-full h-full object-cover scale-110 blur-xl opacity-35"
            />
            <div className="absolute inset-0 bg-[#0A0A0D]/70 backdrop-blur-md" />

            <button
              type="button"
              onClick={handlePlay}
              tabIndex={isPlaying ? -1 : 0}
              aria-label={
                hasStarted
                  ? `Retomar aula: ${title}`
                  : `Reproduzir aula: ${title}`
              }
              className="relative z-10 w-16 h-16 sm:w-[74px] sm:h-[74px] rounded-full bg-[#FACC15] hover:bg-[#FDE047] active:scale-95 text-black shadow-[0_12px_36px_rgba(250,204,21,0.48)] flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FACC15]/50"
            >
              {isBuffering ? (
                <Loader2
                  className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-black"
                  aria-hidden="true"
                />
              ) : (
                <Play
                  className="w-7 h-7 sm:w-8 sm:h-8 fill-black translate-x-0.5"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        )}

        {/* Barra de Controlos Personalizada (amarela) */}
        {!hasError && (
          <div
            className={`absolute inset-x-0 bottom-0 z-20 px-3 sm:px-4 pt-8 pb-2.5 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-200 ${
              !isPlaying || controlsVisible
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Botão Play / Pause Amarelo */}
              <button
                type="button"
                onClick={handleTogglePlay}
                aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                className="w-10 h-10 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] active:scale-95 text-black flex items-center justify-center shrink-0 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" aria-hidden="true" />
                ) : (
                  <Play
                    className="w-4 h-4 fill-black translate-x-0.5"
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* Barra de Progresso Interativa Amarela */}
              <div className="relative flex-1 min-w-0 h-10 flex items-center group/scrub">
                <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden">
                  <div
                    className="h-full bg-[#FACC15] transition-[width] duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#FACC15] shadow-[0_0_10px_rgba(250,204,21,0.7)] transition-transform group-hover/scrub:scale-110"
                  style={{ left: `${progressPercent}%` }}
                />
                <input
                  type="range"
                  aria-label="Progresso da aula"
                  min={0}
                  max={safeDuration > 0 ? Math.floor(safeDuration) : 100}
                  step={1}
                  disabled={safeDuration <= 0}
                  value={Math.min(
                    Math.floor(currentTime),
                    Math.floor(safeDuration || 100)
                  )}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
                />
              </div>

              {/* Tempo atual / Duração */}
              <span className="font-mono text-[11px] sm:text-xs text-neutral-200 tabular-nums shrink-0">
                {formatPlaybackTime(currentTime)}
                {safeDuration > 0 ? ` / ${formatPlaybackTime(safeDuration)}` : ''}
              </span>

              {/* Mute / Unmute */}
              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX
                    className="w-4 h-4 text-[#FACC15]"
                    aria-hidden="true"
                  />
                ) : (
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                )}
              </button>

              {/* Ecrã inteiro / Expandir */}
              <button
                type="button"
                onClick={handleToggleFullscreen}
                aria-label={
                  isExpanded ? 'Sair de ecrã inteiro' : 'Ver em ecrã inteiro'
                }
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Maximize2 className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Erro neutro (sem expor plataforma externa) */}
        {hasError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-[#18181B] text-neutral-200">
            <p className="font-display font-semibold text-base text-white mb-2">
              Não foi possível carregar esta aula
            </p>
            <p className="text-xs text-neutral-400 mb-4 max-w-sm">
              Verifica a tua ligação à internet ou tenta recarregar o player
              abaixo.
            </p>
            <button
              type="button"
              onClick={() => setRetryToken((t) => t + 1)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-black text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Tentar novamente</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
