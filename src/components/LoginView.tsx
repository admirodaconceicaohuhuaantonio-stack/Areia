import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { PLATFORM_NAME, PLATFORM_SLOGAN } from '../data/courseData';
import { authService } from '../services/authService';
import { AuthSession } from '../types/course';

interface LoginViewProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authService.login(email, password);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setErrorMessage(result.error ?? 'Não foi possível validar o acesso.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#141414] text-white flex flex-col justify-center items-center px-4 py-6 sm:py-8 relative overflow-hidden">
      {/* Iluminação ambiente sutil estilo cinema */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-[#E50914]/12 blur-[130px]"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logótipo Oficial da Plataforma */}
        <header className="flex flex-col items-center text-center mb-4">
          <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            <img
              src="/assets/aistudio/file_000000002f9881f495fecffefdcdfafb_e5a76949.png"
              alt="Império Digital — Academia de Negócios Online"
              className="w-full h-full object-contain drop-shadow-[0_14px_32px_rgba(0,0,0,0.85)] [mask-image:radial-gradient(circle_at_center,black_72%,rgba(0,0,0,0.8)_82%,transparent_95%)] [-webkit-mask-image:radial-gradient(circle_at_center,black_72%,rgba(0,0,0,0.8)_82%,transparent_95%)]"
            />
          </div>
          <h1 className="sr-only">{PLATFORM_NAME} — {PLATFORM_SLOGAN}</h1>
        </header>

        {/* Cartão de Autenticação */}
        <div className="bg-[#1F1F23] rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.65)] border border-white/10">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-white">
              Acesso à Plataforma
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Insere os teus dados de aluno para continuar a tua formação.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="exemplo@email.com"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white text-black placeholder:text-neutral-500 text-sm font-medium border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#E50914] transition-shadow"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-white mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Insere a tua senha"
                  className="w-full h-12 pl-10 pr-12 rounded-xl bg-white text-black placeholder:text-neutral-500 text-sm font-medium border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#E50914] transition-shadow"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-700 hover:text-black rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-[#2A1215] border border-[#E50914]/50 px-3.5 py-3 text-sm text-neutral-100"
              >
                <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[#E50914] hover:bg-[#F6121D] active:scale-[0.98] disabled:opacity-70 text-white font-semibold text-sm tracking-wide shadow-[0_8px_24px_rgba(229,9,20,0.34)] transition-all duration-150 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isSubmitting ? 'A verificar acesso...' : 'Entrar na Plataforma'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          {PLATFORM_NAME} · Acesso exclusivo para alunos inscritos
        </p>
      </div>
    </div>
  );
}
