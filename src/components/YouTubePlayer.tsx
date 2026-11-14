import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

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
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
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
      // Poll briefly if script tag exists and YT is finishing initialization
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
  onProgressUpdate: (currentTime: number, duration: number, ended: boolean) => void;
}

export function YouTubePlayer({
  videoId,
  title,
  initialTime = 0,
  onProgressUpdate,
}: YouTubePlayerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const onProgressRef = useRef(onProgressUpdate);
  const initialTimeRef = useRef(initialTime);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  onProgressRef.current = onProgressUpdate;
  initialTimeRef.current = initialTime;

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setHasError(false);

    const stopPolling = () => {
      if (pollTimerRef.current !== null) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const emitCurrentTime = (ended = false) => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const current = player.getCurrentTime?.() ?? 0;
        const duration = player.getDuration?.() ?? 0;
        if (duration > 0) {
          onProgressRef.current(ended ? duration : current, duration, ended);
        }
      } catch {
        // Ignore transient player reads during unmount
      }
    };

    loadYouTubeIframeAPI().then(() => {
      if (isCancelled || !hostRef.current || !window.YT?.Player) return;

      // Clear and attach dedicated mount node so YouTube iframe replacement doesn't conflict with React
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
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          controls: 1,
          enablejsapi: 1,
          start: startSeconds,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (isCancelled) return;
            setIsLoading(false);
          },
          onStateChange: (event) => {
            if (isCancelled) return;
            const states = window.YT?.PlayerState;
            const playingState = states?.PLAYING ?? 1;
            const pausedState = states?.PAUSED ?? 2;
            const endedState = states?.ENDED ?? 0;

            if (event.data === playingState) {
              stopPolling();
              emitCurrentTime(false);
              pollTimerRef.current = window.setInterval(() => {
                emitCurrentTime(false);
              }, 1000);
            } else if (event.data === pausedState) {
              stopPolling();
              emitCurrentTime(false);
            } else if (event.data === endedState) {
              stopPolling();
              emitCurrentTime(true);
            }
          },
          onError: () => {
            if (isCancelled) return;
            setIsLoading(false);
            setHasError(true);
          },
        },
      });
    });

    return () => {
      isCancelled = true;
      stopPolling();
      emitCurrentTime(false);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore destroy errors
        }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0D0D0F] border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.58)]">
      <div
        ref={hostRef}
        aria-label={`Player de vídeo: ${title}`}
        className="w-full h-full"
      />

      {isLoading && !hasError && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-[#0D0D0F]/92 text-neutral-300 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-[#E50914]" aria-hidden="true" />
          <span className="text-xs font-medium">A carregar aula...</span>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#18181B] text-neutral-200">
          <p className="font-display font-semibold text-base text-white mb-2">
            Não foi possível carregar o vídeo incorporado
          </p>
          <p className="text-xs text-neutral-400 mb-4 max-w-sm">
            Podes abrir a aula diretamente no YouTube caso o teu navegador esteja a bloquear incorporações.
          </p>
          <a
            href={`https://youtu.be/${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-semibold hover:bg-[#F6121D] transition-colors"
          >
            Abrir vídeo no YouTube
          </a>
        </div>
      )}
    </div>
  );
}
