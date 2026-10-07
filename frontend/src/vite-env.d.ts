/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL da API em produção (em dev o Vite faz proxy de /api para o Django). */
  readonly VITE_API_URL?: string;
}
