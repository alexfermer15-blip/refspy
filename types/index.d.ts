// types/index.d.ts

declare module '@/types' {
  // Базовые типы для приложения
  export interface User {
    id: string;
    email: string;
    name?: string;
    created_at?: string;
    role?: 'admin' | 'user';
  }

  // Проект
  export interface Project {
    id: string;
    name: string;
    domain: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  }

  // Ключевое слово для базы данных
  export interface KeywordDB {
    id: string;
    keyword: string;
    current_position: number | null;
    previous_position: number | null;
    best_position: number | null;
    search_volume: number;
    difficulty: number;
    target_url: string;
    project_id: string;
    created_at: string;
    updated_at: string;
  }

  // История проверок позиций
  export interface KeywordHistory {
    id: string;
    keyword_id: string;
    position: number;
    checked_at: string;
    url: string;
  }

  // Опции экспорта
  export interface ExportOptions {
    filename?: string;
    format?: 'pdf' | 'csv' | 'excel';
    filters?: {
      search_engine?: string;
      status?: string;
      date_range?: [string, string];
    };
  }
}
