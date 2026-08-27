import { AppSettings, DEFAULT_SETTINGS, MonitoredCompetitor } from '../types/settings';

export interface UserData {
  mlToken: string | null;
  monitoredCompetitors: MonitoredCompetitor[];
  settings: AppSettings;
}

// In-memory per-client store indexed strictly by authenticated client_id
const clientStores = new Map<string, UserData>();

export function getClientData(clientId: string): UserData {
  if (!clientId) {
    throw new Error('client_id is required to access client data.');
  }

  let data = clientStores.get(clientId);
  if (!data) {
    data = {
      mlToken: null,
      monitoredCompetitors: [...DEFAULT_SETTINGS.radar.monitoredCompetitors],
      settings: {
        ...DEFAULT_SETTINGS,
        api: {
          ...DEFAULT_SETTINGS.api,
          accessToken: '',
          connectionStatus: 'simulation',
        },
      },
    };
    clientStores.set(clientId, data);
  }
  return data;
}

export function getMlTokenForClient(clientId: string): string | null {
  return getClientData(clientId).mlToken;
}

export function setMlTokenForClient(clientId: string, token: string | null): void {
  const data = getClientData(clientId);
  data.mlToken = token;
  data.settings.api.accessToken = token || '';
  data.settings.api.connectionStatus = token
    ? token.trim().startsWith('APP_USR-')
      ? 'connected'
      : 'expired'
    : 'simulation';
  data.settings.api.lastTestedAt = new Date().toISOString();
}

export function getMonitoredCompetitors(clientId: string): MonitoredCompetitor[] {
  return getClientData(clientId).monitoredCompetitors;
}

export function setMonitoredCompetitors(clientId: string, competitors: MonitoredCompetitor[]): void {
  const data = getClientData(clientId);
  data.monitoredCompetitors = competitors;
  data.settings.radar.monitoredCompetitors = competitors;
}

export function getUserSettings(clientId: string): AppSettings {
  return getClientData(clientId).settings;
}

export function updateUserSettings(clientId: string, newSettings: AppSettings): AppSettings {
  const data = getClientData(clientId);
  data.settings = newSettings;
  data.mlToken = newSettings.api?.accessToken || null;
  data.monitoredCompetitors = newSettings.radar?.monitoredCompetitors || data.monitoredCompetitors;
  return data.settings;
}
