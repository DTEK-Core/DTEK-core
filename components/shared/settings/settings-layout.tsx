'use client';

import { useState } from 'react';
import { ProfileTab } from '@/components/shared/settings/profile-tab';
import { OrgTab } from '@/components/shared/settings/org-tab';
import { NotificationsTab } from '@/components/shared/settings/notifications-tab';
import { SecurityTab } from '@/components/shared/settings/security-tab';
import { SecurityLog, type SecurityEventRow } from '@/components/shared/settings/security-log';

type Tab = 'profile' | 'org' | 'notif' | 'security' | 'audit';

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
  role: string | null;
  auditLogs: SecurityEventRow[];
}

export function SettingsLayout({ profile, org, isOwner, role, auditLogs }: Props) {
  const [tab, setTab] = useState<Tab>('profile');

  const canSeeAudit = role === 'owner' || role === 'admin';

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile',  label: 'Профиль' },
    { id: 'org',      label: 'Организация' },
    { id: 'notif',    label: 'Уведомления' },
    { id: 'security', label: 'Безопасность' },
    ...(canSeeAudit ? [{ id: 'audit' as Tab, label: 'Журнал аудита' }] : []),
  ];

  return (
    <div className="settings-layout">
      <nav className="settings-nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`snav${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
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
        {tab === 'audit' && canSeeAudit && <SecurityLog events={auditLogs} />}
      </div>
    </div>
  );
}
