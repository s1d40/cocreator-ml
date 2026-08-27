import { SettingsPageClient } from '../SettingsPageClient';
import type { SettingsTab } from '../../components/SettingsPanel';

const validSubTabs: SettingsTab[] = ['api', 'radar', 'estimator', 'pre-sales'];

export default function SubTabSettingsPage({ params }: { params: { subtab: string } }) {
  const subTabParam = params.subtab as SettingsTab;
  const initialSubTab = validSubTabs.includes(subTabParam) ? subTabParam : 'api';

  return <SettingsPageClient initialSubTab={initialSubTab} />;
}
