'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/Header';
import type { TabType } from '../../components/Header';
import { SettingsPanel } from '../../components/SettingsPanel';
import { SettingsProvider } from '../../context/SettingsContext';
import { MOCK_QUESTIONS } from '../../data/mockData';

interface SettingsPageProps {
  initialSubTab?: 'api' | 'radar' | 'estimator' | 'pre-sales';
}

function SettingsContent({ initialSubTab = 'api' }: SettingsPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [subTab, setSubTab] = useState<'api' | 'radar' | 'estimator' | 'pre-sales'>(initialSubTab);

  const unansweredCount = MOCK_QUESTIONS.filter((q) => q.status === 'unanswered').length;

  const handleSubTabChange = (newSubTab: 'api' | 'radar' | 'estimator' | 'pre-sales') => {
    setSubTab(newSubTab);
    router.push(`/settings/${newSubTab}`);
  };

  const handleHeaderTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'settings') {
      router.push('/settings');
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header
        activeTab={activeTab}
        setActiveTab={handleHeaderTabChange}
        unansweredCount={unansweredCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsPanel initialTab={subTab} onTabChange={handleSubTabChange} />
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 CoCreator ML Intelligence Hub &middot; Mercado Livre API Integration</p>
        </div>
      </footer>
    </div>
  );
}

export function SettingsPageClient(props: SettingsPageProps) {
  return (
    <SettingsProvider>
      <SettingsContent {...props} />
    </SettingsProvider>
  );
}
