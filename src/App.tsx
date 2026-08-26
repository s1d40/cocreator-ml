import { useState } from 'react';
import { Header } from './components/Header';
import type { TabType } from './components/Header';
import { QuestionsInbox } from './components/QuestionsInbox';
import { AdsPerformance } from './components/AdsPerformance';
import { SellerMetrics } from './components/SellerMetrics';
import { CompetitorRadar } from './components/CompetitorRadar';
import { MOCK_QUESTIONS, MOCK_CAMPAIGNS, MOCK_DAILY_METRICS, MOCK_SELLER_REPUTATION, MOCK_COMPETITORS } from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('questions');

  const unansweredCount = MOCK_QUESTIONS.filter((q) => q.status === 'unanswered').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unansweredCount={unansweredCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'questions' && (
          <QuestionsInbox questions={MOCK_QUESTIONS} />
        )}

        {activeTab === 'ads' && (
          <AdsPerformance
            campaigns={MOCK_CAMPAIGNS}
            dailyMetrics={MOCK_DAILY_METRICS}
          />
        )}

        {activeTab === 'seller' && (
          <SellerMetrics sellerData={MOCK_SELLER_REPUTATION} />
        )}

        {activeTab === 'competitor' && (
          <CompetitorRadar initialCompetitors={MOCK_COMPETITORS} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Apex Tech Direct Analytics Hub. All metrics and dashboards are for read-only evaluation.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
