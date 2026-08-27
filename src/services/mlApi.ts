import { AppSettings, DEFAULT_SETTINGS, MlSellerAccountInfo } from '../types/settings';

const STORAGE_KEY = 'COCREATOR_ML_SETTINGS_V2';

export function getLocalSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        api: { ...DEFAULT_SETTINGS.api, ...parsed.api },
        radar: { ...DEFAULT_SETTINGS.radar, ...parsed.radar },
        estimator: { ...DEFAULT_SETTINGS.estimator, ...parsed.estimator },
        preSales: { ...DEFAULT_SETTINGS.preSales, ...parsed.preSales },
      };
    }
  } catch (e) {
    console.error('Failed to parse settings from localStorage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Also sync with server route
    if (settings.api.accessToken) {
      fetch('/api/ml-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: settings.api.accessToken }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

export interface ValidateTokenResult {
  valid: boolean;
  status: 'connected' | 'expired' | 'simulation';
  accountInfo?: MlSellerAccountInfo;
  errorMessage?: string;
}

/**
 * Validates the pasted Mercado Libre Access Token against the live API via proxy
 */
export async function validateMlToken(token: string): Promise<ValidateTokenResult> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return {
      valid: false,
      status: 'expired',
      errorMessage: 'Nenhum token fornecido. Por favor, cole sua credencial da API Mercado Livre.',
    };
  }

  // Simulation mode check for demo keys
  if (cleanToken.startsWith('SIMULATION_') || cleanToken.startsWith('DEMO_')) {
    return {
      valid: true,
      status: 'simulation',
      accountInfo: {
        id: 99998888,
        nickname: 'DEMO_SELLER_PRO',
        countryId: 'BR',
        siteId: 'MLB',
        reputationLevel: 'platinum',
        powerSellerStatus: 'platinum',
        totalOrders: 3450,
        completedOrders: 3412,
        claimRate: 0.28,
      },
    };
  }

  try {
    const res = await fetch('/api/ml-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/users/me',
        token: cleanToken,
      }),
    });

    const data = await res.json();

    if (res.ok && data.id) {
      const rep = data.seller_reputation || {};
      const tx = rep.transactions || {};

      const accountInfo: MlSellerAccountInfo = {
        id: data.id,
        nickname: data.nickname || 'Vendedor Mercado Livre',
        email: data.email,
        countryId: data.country_id || 'BR',
        siteId: data.site_id || 'MLB',
        permalink: data.permalink,
        reputationLevel: rep.level_id || 'platinum',
        powerSellerStatus: rep.power_seller_status || 'platinum',
        totalOrders: tx.total || 0,
        completedOrders: tx.completed || 0,
        claimRate: rep.metrics?.claims?.rate ? rep.metrics.claims.rate * 100 : 0.28,
        sellerReputation: rep,
      };

      return {
        valid: true,
        status: 'connected',
        accountInfo,
      };
    } else {
      const msg = data.message || data.error || 'Token inválido ou expirado pelo Mercado Livre.';
      return {
        valid: false,
        status: 'expired',
        errorMessage: `Erro ${res.status}: ${msg}`,
      };
    }
  } catch (error: any) {
    console.error('Error validating token:', error);
    return {
      valid: false,
      status: 'expired',
      errorMessage: error.message || 'Falha de comunicação com o servidor proxy.',
    };
  }
}

/**
 * Searches live items on Mercado Livre for competitor scanning
 */
export async function searchLiveMlItems(query: string, token?: string) {
  try {
    const res = await fetch('/api/ml-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: `/sites/MLB/search?q=${encodeURIComponent(query)}&limit=10`,
        token: token || undefined,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
