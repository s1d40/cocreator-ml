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
  const { activeSeller, isApiConnected } = useSettings();

  const unansweredCount = isApiConnected
    ? MOCK_QUESTIONS.filter((q) => q.status === 'unanswered').length
    : 0;

  const tx = activeSeller?.sellerReputation?.transactions;
  const totalOrders = activeSeller?.totalOrders ?? tx?.total ?? 0;
  const completedOrders = activeSeller?.completedOrders ?? tx?.completed ?? 0;
  const canceledOrders = tx?.canceled ?? 0;
  const claimRate = activeSeller?.claimRate ?? 0;

  const ratings = tx?.ratings;
  const posRating = ratings?.positive ?? 0;
  const negRating = ratings?.negative ?? 0;
  const neuRating = ratings?.neutral ?? 0;

  const ratingBreakdown = ratings && (posRating + negRating + neuRating > 0)
    ? [
        { stars: 5, count: Math.round(posRating * 0.85) },
        { stars: 4, count: Math.round(posRating * 0.15) },
        { stars: 3, count: neuRating },
        { stars: 2, count: Math.round(negRating * 0.3) },
        { stars: 1, count: Math.round(negRating * 0.7) },
      ]
    : MOCK_SELLER_REPUTATION.ratingBreakdown;

  const sellerData = activeSeller
    ? {
        ...MOCK_SELLER_REPUTATION,
        sellerId: String(activeSeller.id || MOCK_SELLER_REPUTATION.sellerId),
        sellerName: activeSeller.nickname || MOCK_SELLER_REPUTATION.sellerName,
        reputationLevel: activeSeller.reputationLevel || activeSeller.powerSellerStatus || 'platinum',
        reputationScore: activeSeller.reputationLevel === 'platinum' || activeSeller.powerSellerStatus === 'platinum' ? 98.8 : 95.0,
        totalOrders,
        completedOrders,
        canceledOrdersBySeller: canceledOrders,
        claimRate: Number(claimRate.toFixed(2)),
        ratingBreakdown,
      }
    : MOCK_SELLER_REPUTATION;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unansweredCount={unansweredCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab !== 'settings' && !isApiConnected ? (
          <ConnectApiKeyCard />
        ) : (
          <>
            {activeTab === 'questions' && (
              <QuestionsInbox questions={MOCK_QUESTIONS} />
            )}

            {activeTab === 'ads' && (
              <AdsPerformance
                campaigns={MOCK_CAMPAIGNS}
                dailyMetrics={MOCK_DAILY_METRICS}
              />
            )}

            {activeTab === 'estimator' && (
              <SalesEstimator />
            )}

            {activeTab === 'seller' && (
              <SellerMetrics sellerData={sellerData} />
            )}

            {activeTab === 'competitor' && (
              <CompetitorRadar initialCompetitors={MOCK_COMPETITORS} />
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
