'use client';

import { useState } from 'react';
import { Header } from './components/Header';
import type { TabType } from './components/Header';
import { QuestionsInbox } from './components/QuestionsInbox';
import { AdsPerformance } from './components/AdsPerformance';
import { SellerMetrics } from './components/SellerMetrics';
import { CompetitorRadar } from './components/CompetitorRadar';
import { SalesEstimator } from './components/SalesEstimator';
import { SettingsPanel } from './components/SettingsPanel';
import { ConnectApiKeyCard } from './components/ConnectApiKeyCard';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { MOCK_QUESTIONS, MOCK_CAMPAIGNS, MOCK_DAILY_METRICS, MOCK_SELLER_REPUTATION, MOCK_COMPETITORS } from './data/mockData';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const { activeSeller, isApiConnected, settings } = useSettings();

  const isConnected = isApiConnected || (settings.api.accessToken && settings.api.connectionStatus !== 'unconfigured');
  const unansweredCount = isConnected ? MOCK_QUESTIONS.filter((q) => q.status === 'unanswered').length : 0;

  const sellerData = activeSeller
    ? {
        ...MOCK_SELLER_REPUTATION,
        sellerName: activeSeller.nickname || 'Vendedor Mercado Livre',
        totalOrders: activeSeller.totalOrders || 0,
        completedOrders: activeSeller.completedOrders || 0,
        claimRate: activeSeller.claimRate || 0,
      }
    : {
        ...MOCK_SELLER_REPUTATION,
        sellerName: 'Aguardando Conexão',
        totalOrders: 0,
        completedOrders: 0,
        claimRate: 0,
      };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unansweredCount={unansweredCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected && activeTab !== 'settings' ? (
          <ConnectApiKeyCard />
        ) : (
          <>
            {activeTab === 'questions' && (
              <QuestionsInbox questions={isConnected ? MOCK_QUESTIONS : []} />
            )}

            {activeTab === 'ads' && (
              <AdsPerformance
                campaigns={isConnected ? MOCK_CAMPAIGNS : []}
                dailyMetrics={isConnected ? MOCK_DAILY_METRICS : []}
              />
            )}

            {activeTab === 'estimator' && (
              <SalesEstimator />
            )}

            {activeTab === 'seller' && (
              <SellerMetrics sellerData={sellerData} />
            )}

            {activeTab === 'competitor' && (
              <CompetitorRadar initialCompetitors={isConnected ? MOCK_COMPETITORS : []} />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 CoCreator ML Intelligence Hub &middot; Mercado Livre API Integration &middot; All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <DashboardContent />
    </SettingsProvider>
  );
}

export default App;
