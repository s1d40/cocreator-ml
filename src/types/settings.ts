export interface MlApiSettings {
  accessToken: string;
  connectionStatus: 'connected' | 'expired' | 'simulation';
  readOnlyMode: boolean;
  lastTestedAt?: string;
}

export interface MonitoredCompetitor {
  id: string;
  mlbId: string;
  sellerNickname: string;
  notes?: string;
}

export interface RadarSettings {
  scanInterval: '15m' | '1h' | '6h';
  buyBoxSensitivityMarginPercent: number; // e.g. 2%, 5%
  monitoredCompetitors: MonitoredCompetitor[];
}

export interface CategoryMultiplier {
  categoryKey: string;
  categoryName: string;
  multiplier: number;
}

export interface EstimatorSettings {
  categoryMultipliers: CategoryMultiplier[];
  confidenceMargin: '80' | '95';
}

export type AiToneOfVoice = 'formal' | 'enthusiastic' | 'technical' | 'commercial';
export type AiApprovalRule = 'manual_approval' | 'one_click_suggestion';

export interface PreSalesSettings {
  defaultTone: AiToneOfVoice;
  approvalRule: AiApprovalRule;
  customGreeting?: string;
}

export interface AppSettings {
  api: MlApiSettings;
  radar: RadarSettings;
  estimator: EstimatorSettings;
  preSales: PreSalesSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  api: {
    accessToken: 'APP_USR-7829104829104829-082614-b38f2910482910482910482910482910-1049281',
    connectionStatus: 'connected',
    readOnlyMode: true,
    lastTestedAt: '2026-08-26T12:00:00Z',
  },
  radar: {
    scanInterval: '1h',
    buyBoxSensitivityMarginPercent: 3.0,
    monitoredCompetitors: [
      { id: '1', mlbId: 'MLB3849102834', sellerNickname: 'TECH_GURU_STORE', notes: 'Top competitor in keyboards' },
      { id: '2', mlbId: 'MLB2918471029', sellerNickname: 'ELECTRO_WORLD_BR', notes: 'Curved monitors rival' },
      { id: '3', mlbId: 'MLB1029384756', sellerNickname: 'AUDIO_PRO_SHOP', notes: 'Bluetooth headphones leader' },
    ],
  },
  estimator: {
    categoryMultipliers: [
      { categoryKey: 'electronics', categoryName: 'Eletrônicos & Tecnologia', multiplier: 1.0 },
      { categoryKey: 'fashion', categoryName: 'Moda & Acessórios', multiplier: 1.15 },
      { categoryKey: 'food', categoryName: 'Alimentos & Bebidas', multiplier: 1.25 },
      { categoryKey: 'home', categoryName: 'Casa & Decoração', multiplier: 0.95 },
    ],
    confidenceMargin: '95',
  },
  preSales: {
    defaultTone: 'commercial',
    approvalRule: 'manual_approval',
    customGreeting: 'Olá! Agradecemos sua pergunta.',
  },
};
