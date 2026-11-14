import coverBonus1 from '@/src/assets/images/cover_bonus_1_1794659350956.jpg';
import coverBonus2 from '@/src/assets/images/cover_bonus_2_1794659352564.jpg';
import coverBonus3 from '@/src/assets/images/cover_bonus_3_1794659353207.jpg';
import { CoverKey, CoverOverrideSettings } from '../types/course';

/**
 * Registo central das capas verticais (formato 1080x1920 / 9:16).
 * Para substituir definitivamente as capas no código, basta trocar os caminhos abaixo
 * pelos ficheiros finais das capas dos módulos 1 a 7 / bónus.
 */
export const DEFAULT_COVER_IMAGES: Record<CoverKey, string> = {
  'module-1': '/assets/aistudio/file_00000000a9b081f4951f5a6f1fb17e4f_000e1633.png',
  'module-2': '/assets/aistudio/file_00000000f06c81f49c859f2f60b1ae27_2ff7b143.png',
  'module-3': '/assets/aistudio/file_0000000060f881f485d7a012515899f9_bc0a7400.png',
  'module-4': '/assets/aistudio/file_00000000026c81f494ae56e345099f63_5702f1d2.png',
  'module-5': '/assets/aistudio/file_0000000029c88210bd7ad2f702ae255e_08853af5.png',
  'module-6': '/assets/aistudio/file_000000001a7481f4ae702770dd5fd90d_749e64d3.png',
  'bonus-main': '/assets/aistudio/file_00000000576881f49124086ca1282bbe_4cad6d26.png',
  'bonus-1': coverBonus1,
  'bonus-2': coverBonus2,
  'bonus-3': coverBonus3,
};

/**
 * Capas que já possuem título e grafismo próprios na imagem original,
 * evitando sobrepor texto duplicado em cima da arte.
 */
export const COVERS_WITH_EMBEDDED_ARTWORK: Partial<Record<CoverKey, boolean>> = {
  'module-1': true,
  'module-2': true,
  'module-3': true,
  'module-4': true,
  'module-5': true,
  'module-6': true,
  'bonus-main': true,
};

export const COVER_SLOT_LABELS: { key: CoverKey; label: string }[] = [
  { key: 'module-1', label: 'Capa 1 — Materiais do Módulo 1' },
  { key: 'module-2', label: 'Capa 2 — Produtos com IA' },
  { key: 'module-3', label: 'Capa 3 — Produtos Vencedores' },
  { key: 'module-4', label: 'Capa 4 — Páginas & Vendas X1' },
  { key: 'module-5', label: 'Capa 5 — Tráfego Pago' },
  { key: 'module-6', label: 'Capa 6 — Escalagem' },
  { key: 'bonus-main', label: 'Capa 7 — Bónus Exclusivos (Capa Principal)' },
  { key: 'bonus-1', label: 'Bónus 1 — Importar das Fábricas' },
  { key: 'bonus-2', label: 'Bónus 2 — Plataformas Internacionais' },
  { key: 'bonus-3', label: 'Bónus 3 — Lista de Fornecedores' },
];

const COVER_SETTINGS_STORAGE_KEY = 'imperio_digital_cover_settings_v1';

export function loadCoverSettings(): CoverOverrideSettings {
  try {
    const raw = localStorage.getItem(COVER_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { customCovers: {}, showCoverTextOverlay: true };
    }
    const parsed = JSON.parse(raw) as Partial<CoverOverrideSettings>;
    return {
      customCovers: parsed.customCovers ?? {},
      showCoverTextOverlay: parsed.showCoverTextOverlay ?? true,
    };
  } catch {
    return { customCovers: {}, showCoverTextOverlay: true };
  }
}

export function saveCoverSettings(settings: CoverOverrideSettings): void {
  try {
    localStorage.setItem(COVER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function getCoverImageUrl(
  key: CoverKey,
  settings?: CoverOverrideSettings
): string {
  const custom = settings?.customCovers?.[key];
  if (custom) return custom;
  return DEFAULT_COVER_IMAGES[key];
}
