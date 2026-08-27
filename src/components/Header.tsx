import React from 'react';
import { HelpCircle, BarChart3, Award, Store, Radar, TrendingUp, Settings, Sparkles } from 'lucide-react';
import { ReadOnlyBadge } from './ReadOnlyBadge';
import { useSettings } from '../context/SettingsContext';
import Link from 'next/link';

export type TabType = 'questions' | 'ads' | 'estimator' | 'seller' | 'competitor' | 'settings';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unansweredCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, unansweredCount }) => {
  let activeSeller: any = null;
  try {
    const settingsCtx = useSettings();
    activeSeller = settingsCtx.activeSeller;
  } catch {}

  const storeName = activeSeller?.nickname || 'Mercado Livre Seller';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl font-bold flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">ML Intelligence Hub</h1>
              <p className="text-xs text-gray-500 font-medium truncate max-w-[180px] sm:max-w-none">
                {storeName} &middot; Brasil
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-1.5 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 mr-1.5" />
              <span>Dúvidas & IA</span>
              {unansweredCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {unansweredCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('estimator')}
              className={`flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'estimator'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1.5" />
              <span>Estimador de Vendas</span>
            </button>

            <button
              onClick={() => setActiveTab('competitor')}
              className={`flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'competitor'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Radar className="w-4 h-4 mr-1.5" />
              <span>Radar Concorrência</span>
            </button>

            <button
              onClick={() => setActiveTab('seller')}
              className={`flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'seller'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Award className="w-4 h-4 mr-1.5" />
              <span>Métricas & Reputação</span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'ads'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-1.5" />
              <span>Mercado Ads</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Settings className="w-4 h-4 mr-1.5" />
              <span>Configurações</span>
            </button>
          </nav>

          {/* Action & Global Read-Only Badge */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition"
              title="Executar assistente de configuração"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Setup Inicial</span>
            </Link>
            <ReadOnlyBadge size="md" />
          </div>
        </div>
      </div>
    </header>
  );
};
