'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { Icon } from '@/components/shared/icon';
import { logout } from '@/lib/actions/auth';

const NAV_GROUPS = [
  {
    label: 'Обзор',
    items: [
      { href: '/dashboard', icon: 'grid', label: 'Центр управления' },
      { href: '/graph', icon: 'graph', label: 'Граф доверия' },
    ],
  },
  {
    label: 'Цифровая модель',
    items: [
      { href: '/objects', icon: 'objects', label: 'Объекты' },
      { href: '/risks', icon: 'risk', label: 'Реестр рисков' },
    ],
  },
  {
    label: 'Управление',
    items: [
      { href: '/users', icon: 'users', label: 'Пользователи' },
      { href: '/configurator', icon: 'config', label: 'Конфигуратор' },
    ],
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

interface AppSidebarProps {
  displayName: string;
  email: string;
  orgName: string | null;
}

export function AppSidebar({ displayName, email, orgName }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="sidebar-brand">
        <Logo size={28} />
        <div className="brand-text">
          <span className="brand-name">
            DTEK<span className="brand-core">Core</span>
          </span>
          <span className="brand-sub mono">digital trust</span>
        </div>
      </Link>

      <div className="org-switch">
        <div className="org-switch-btn">
          <span className="org-mark">
            <Icon name="building" size={15} />
          </span>
          <span className="org-switch-name">{orgName ?? 'Нет организации'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${active ? ' active' : ''}`}
                >
                  <Icon name={item.icon} size={18} />
                  <span className="nav-label">{item.label}</span>
                  {active && <span className="nav-active-bar" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <Link
          href="/settings"
          className={`nav-item${pathname.startsWith('/settings') ? ' active' : ''}`}
        >
          <Icon name="settings" size={18} />
          <span className="nav-label">Настройки</span>
          {pathname.startsWith('/settings') && <span className="nav-active-bar" />}
        </Link>

        <div className="user-menu">
          <div className="user-menu-avatar">{getInitials(displayName || email)}</div>
          <div className="user-menu-info">
            <span className="user-menu-name">{displayName || '—'}</span>
            <span className="user-menu-email">{email}</span>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="nav-item nav-item-button">
            <Icon name="logout" size={18} />
            <span className="nav-label">Выйти</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
