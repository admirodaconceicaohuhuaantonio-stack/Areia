import { AuthSession } from '../types/course';

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

/**
 * Contrato de autenticação preparado para futura integração com servidor/API.
 * Para migrar para autenticação real no backend, basta implementar esta interface
 * chamando os endpoints do servidor (ex: POST /api/auth/login) e substituir a instância ativa.
 */
export interface AuthProvider {
  login(email: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getSession(): AuthSession | null;
}

const SESSION_STORAGE_KEY = 'imperio_digital_auth_session_v1';

const DEMO_VALID_EMAIL = 'clientepro@gmail.com';
const DEMO_VALID_SECRET = '001122';

class DemoAuthProvider implements AuthProvider {
  async login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      return {
        success: false,
        error: 'Preenche o email e a senha para entrar na plataforma.',
      };
    }

    if (normalizedEmail !== DEMO_VALID_EMAIL || normalizedPassword !== DEMO_VALID_SECRET) {
      return {
        success: false,
        error: 'Credenciais inválidas. Verifica o teu email e a tua senha e tenta novamente.',
      };
    }

    const session: AuthSession = {
      email: DEMO_VALID_EMAIL,
      name: 'Membro Império Digital',
      authenticatedAt: Date.now(),
      provider: 'demo',
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Fallback safely if localStorage is restricted
    }

    return { success: true, session };
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage errors on logout
    }
  }

  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (!parsed || !parsed.email) return null;
      return parsed;
    } catch {
      return null;
    }
  }
}

export const authService: AuthProvider = new DemoAuthProvider();
