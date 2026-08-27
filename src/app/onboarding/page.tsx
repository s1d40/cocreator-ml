'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsProvider, useSettings } from '../../context/SettingsContext';
import { StepApiKey } from '../../components/onboarding/StepApiKey';
import { StepRadar } from '../../components/onboarding/StepRadar';
import { StepAiRules } from '../../components/onboarding/StepAiRules';
import { StepComplete } from '../../components/onboarding/StepComplete';
import { ValidateTokenResult } from '../../services/mlApi';
import { AiToneOfVoice } from '../../types/settings';
import { Sliders, ShieldCheck } from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const { settings, updateSettings, saveSettings, testApiKey, isTesting } = useSettings();

  const [currentStep, setCurrentStep] = useState(1);
  const [token, setToken] = useState(settings.api.accessToken || '');
  const [validationResult, setValidationResult] = useState<ValidateTokenResult | null>(null);

  const [category, setCategory] = useState('Alimentos, Bebidas & Gourmet');
  const [firstMlb, setFirstMlb] = useState('');
  const [firstSeller, setFirstSeller] = useState('');
  const [scanInterval, setScanInterval] = useState<'15m' | '1h' | '6h'>('1h');

  const [tone, setTone] = useState<AiToneOfVoice>('commercial');
  const [greeting, setGreeting] = useState('Olá! Agradecemos seu contato e ficamos felizes em ajudar.');
  const [isSaving, setIsSaving] = useState(false);

  const handleValidateToken = async () => {
    const res = await testApiKey(token.trim());
    setValidationResult(res);
    return res.valid;
  };

  const handleTokenChange = (newToken: string) => {
    setToken(newToken);
    if (validationResult) {
      setValidationResult(null);
    }
  };

  const handleUseDemo = async () => {
    const demoToken = 'SIMULATION_ML_ACCESS_TOKEN_' + Date.now();
    setToken(demoToken);
    const res = await testApiKey(demoToken);
    setValidationResult(res);
  };

  const handleFinish = () => {
    setIsSaving(true);
    updateSettings((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        accessToken: token.trim(),
        connectionStatus: validationResult?.status || 'connected',
        accountInfo: validationResult?.accountInfo || prev.api.accountInfo,
      },
      radar: {
        ...prev.radar,
        scanInterval,
        monitoredCompetitors: firstMlb.trim()
          ? [
              {
                id: Date.now().toString(),
                mlbId: firstMlb.trim().toUpperCase(),
                sellerNickname: firstSeller.trim().toUpperCase() || 'RIVAL_ML',
                notes: category,
              },
              ...prev.radar.monitoredCompetitors,
            ]
          : prev.radar.monitoredCompetitors,
      },
      preSales: {
        ...prev.preSales,
        defaultTone: tone,
        customGreeting: greeting,
      },
    }));

    saveSettings();
    if (typeof window !== 'undefined') {
      localStorage.setItem('COCREATOR_ML_ONBOARDING_DONE', 'true');
    }

    setTimeout(() => {
      setIsSaving(false);
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 font-sans">
      {/* Container Box */}
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Top Branding & Step Indicator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                ML
              </div>
              <span>CoCreator &middot; Mercado Livre Intelligence</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Passo {currentStep} de 4
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Wizard Content */}
        {currentStep === 1 && (
          <StepApiKey
            token={token}
            onTokenChange={handleTokenChange}
            onValidate={handleValidateToken}
            isTesting={isTesting}
            validationResult={validationResult}
            onUseDemo={handleUseDemo}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepRadar
            category={category}
            onCategoryChange={setCategory}
            firstMlb={firstMlb}
            onFirstMlbChange={setFirstMlb}
            firstSeller={firstSeller}
            onFirstSellerChange={setFirstSeller}
            scanInterval={scanInterval}
            onScanIntervalChange={setScanInterval}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StepAiRules
            tone={tone}
            onToneChange={setTone}
            greeting={greeting}
            onGreetingChange={setGreeting}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <StepComplete
            sellerName={validationResult?.accountInfo?.nickname || 'Vendedor Oficial'}
            category={category}
            firstMlb={firstMlb}
            tone={tone}
            onFinish={handleFinish}
            isSaving={isSaving}
          />
        )}
      </div>

      {/* Footer info */}
      <div className="text-center pt-4 text-xs text-slate-400">
        CoCreator SaaS &middot; Plataforma Segura Read-Only &middot; Mercado Livre API Integrada
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <SettingsProvider>
      <OnboardingContent />
    </SettingsProvider>
  );
}
