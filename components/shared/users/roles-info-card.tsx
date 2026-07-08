'use client';

import { useState } from 'react';
import { Icon } from '@/components/shared/icon';

const ROLES: Array<{
  key: string;
  label: string;
  badge: string;
  desc: string;
  permissions: string[];
}> = [
  {
    key:   'owner',
    label: 'Владелец',
    badge: 'Полный контроль',
    desc:  'Управляет организацией, участниками и настройками модели доверия.',
    permissions: [
      'Пользователи и роли',
      'Все объекты и риски',
      'Конфигуратор',
      'Журнал аудита',
    ],
  },
  {
    key:   'analyst',
    label: 'Аналитик ИБ',
    badge: 'Рабочая роль ИБ',
    desc:  'Ведёт риски, объекты, граф и настройку весов Trust Score.',
    permissions: [
      'Создание рисков',
      'Управление объектами',
      'Связи графа',
      'Конфигуратор',
    ],
  },
  {
    key:   'admin',
    label: 'Администратор',
    badge: 'Инфраструктура',
    desc:  'Ведёт инфраструктурные объекты и просматривает данные безопасности.',
    permissions: [
      'Создание объектов',
      'Просмотр рисков',
      'Просмотр графа',
      'Без управления ролями',
    ],
  },
  {
    key:   'viewer',
    label: 'Наблюдатель',
    badge: 'Только чтение',
    desc:  'Просматривает цифровую модель без права изменять данные.',
    permissions: [
      'Dashboard',
      'Объекты и паспорта',
      'Риски',
      'Граф доверия',
    ],
  },
];

export function RolesInfoCard() {
  const [open, setOpen] = useState(true);

  return (
    <section className="card roles-card">
      <button
        type="button"
        className="roles-card-head"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <div>
          <span className="card-title">Роли и права</span>
          <span className="roles-card-sub">
            Краткая матрица доступа по ADR-003
          </span>
        </div>
        <span className="roles-card-toggle">
          {open ? 'Свернуть' : 'Показать'}
          <Icon name={open ? 'chevD' : 'chevR'} size={14} />
        </span>
      </button>

      <div className={`roles-card-body${open ? ' open' : ''}`}>
        <div className="roles-grid">
          {ROLES.map((role) => (
            <article className={`role role-${role.key}`} key={role.key}>
              <div className="role-head">
                <span className="role-name">{role.label}</span>
                <span className="role-perms mono">{role.badge}</span>
              </div>
              <p className="role-desc">{role.desc}</p>
              <ul className="role-list">
                {role.permissions.map(permission => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
