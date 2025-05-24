
export type ScriptCategory = 'analytics' | 'advertising' | 'functional' | 'social';

export interface ScriptConfiguration {
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
  social: boolean;
  scripts: {
    analytics: ScriptItem[];
    advertising: ScriptItem[];
    functional: ScriptItem[];
    social: ScriptItem[];
  }
}

export interface ScriptItem {
  id: string;
  src?: string;
  content?: string;
  async?: boolean;
  category: ScriptCategory;
  attributes?: Record<string, string>;
}

export interface PresetScript {
  name: string;
  id: string;
  src: string;
  category: ScriptCategory;
  async: boolean;
  icon?: string;
  description?: string;
  docUrl?: string;
  helpText?: string;
}
