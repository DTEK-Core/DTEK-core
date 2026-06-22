'use client';

import { useState } from 'react';
import { ProfileTab } from '@/components/shared/settings/profile-tab';
import { OrgTab } from '@/components/shared/settings/org-tab';
import { NotificationsTab } from '@/components/shared/settings/notifications-tab';
import { SecurityTab } from '@/components/shared/settings/security-tab';

type Tab = 'profile' | 'org' | 'notif' | 'security';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile',  label: 'Профиль' },
  { id: 'org',      label: 'Организация' },
  { id: 'notif',    label: 'Уведомления' },
  { id: 'security', label: 'Безопасность' },
];

interface Props {
  profile: {
    fullName: string;
    email: string;
    team: string | null;
    role: string | null;
  };
  org: {
    id: string;
    name: string;
    inn: string | null;
    industry: string | null;
    region: string | null;
    size: string | null;
  };
  isOwner: boolean;
}

export function SettingsLayout({ profile, org, isOwner }: Props) {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div className="settings-layout">
      <nav className="settings-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`snav${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="settings-content">
        {tab === 'profile' && (
          <ProfileTab
            fullName={profile.fullName}
            email={profile.email}
            team={profile.team}
            role={profile.role}
          />
        )}
        {tab === 'org' && (
          <OrgTab
            name={org.name}
            inn={org.inn}
            industry={org.industry}
            region={org.region}
            size={org.size}
            isOwner={isOwner}
          />
        )}
        {tab === 'notif' && <NotificationsTab />}
        {tab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}
