'use client';

import { useState, useTransition } from 'react';
import { WizardStepBar } from '@/components/shared/onboarding/wizard-step-bar';
import { Step1OrgDetails } from '@/components/shared/onboarding/steps/step-1-org-details';
import { Step2ObjectTypes } from '@/components/shared/onboarding/steps/step-2-object-types';
import { Step3TrustWeights } from '@/components/shared/onboarding/steps/step-3-trust-weights';
import { Step4InviteTeam } from '@/components/shared/onboarding/steps/step-4-invite-team';
import { Step5Complete } from '@/components/shared/onboarding/steps/step-5-complete';
import { completeOnboarding } from '@/lib/actions/onboarding';
import type { InviteEntry } from '@/lib/actions/onboarding';
import { Icon } from '@/components/shared/icon';

export interface WizardData {
  description: string;
  contactEmail: string;
  website: string;
  objectTypes: string[];
  weights: {
    vuln: number;
    config: number;
    access: number;
    network: number;
    compliance: number;
    incident: number;
  };
  invites: InviteEntry[];
}

const INITIAL_DATA: WizardData = {
  description: '',
  contactEmail: '',
  website: '',
  objectTypes: ['server', 'app', 'identity'],
  weights: { vuln: 22, config: 18, access: 18, network: 14, compliance: 16, incident: 12 },
  invites: [],
};

interface WizardProps {
  orgId: string;
  orgName: string;
}

export function Wizard({ orgId, orgName }: WizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalWeights = Object.values(data.weights).reduce((a, b) => a + b, 0);
  const isStep3Valid = totalWeights === 100;

  function canAdvance(): boolean {
    if (step === 2) return isStep3Valid;
    return true;
  }

  function next() {
    if (step < 4 && canAdvance()) setStep((s) => s + 1);
  }

  function prev() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleComplete() {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding({ orgId, ...data });
      } catch (e) {
        // Re-throw NEXT_REDIRECT so the navigation completes
        if (e && typeof e === 'object' && 'digest' in e) throw e;
        setError('Произошла ошибка. Попробуйте ещё раз.');
      }
    });
  }

  return (
    <div className="ob-page" style={{ maxWidth: 760 }}>
      <div className="ob-head">
        <h1 className="ob-title">Настройка платформы</h1>
        <p className="ob-sub">
          Организация <strong>{orgName}</strong> создана. Выполните быструю настройку.
        </p>
      </div>

      <WizardStepBar current={step} />

      <div className="wiz-content">
        {step === 0 && <Step1OrgDetails data={data} setData={setData} />}
        {step === 1 && <Step2ObjectTypes data={data} setData={setData} />}
        {step === 2 && <Step3TrustWeights data={data} setData={setData} />}
        {step === 3 && <Step4InviteTeam data={data} setData={setData} />}
        {step === 4 && (
          <Step5Complete
            data={data}
            orgName={orgName}
            isPending={isPending}
            onSubmit={handleComplete}
          />
        )}

        {error && <p className="ob-error" style={{ marginTop: 16 }}>{error}</p>}

        {step < 4 && (
          <div className="wiz-nav">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={prev}
              disabled={step === 0}
            >
              <Icon name="chevL" size={16} />
              Назад
            </button>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {step === 3 && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={next}
                >
                  Пропустить
                  <Icon name="chevR" size={16} />
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={next}
                disabled={!canAdvance()}
                title={step === 2 && !isStep3Valid ? `Сумма весов: ${totalWeights}% (нужно 100%)` : undefined}
              >
                Далее
                <Icon name="chevR" size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
