import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Онбординг — DTEK Core',
};

// This page is only reachable when the user already has an org
// (middleware redirects org-less users to /onboarding/create before reaching here).
export default function OnboardingPage() {
  redirect('/onboarding/wizard');
}
