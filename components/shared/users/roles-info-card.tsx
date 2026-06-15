const ROLES = [
  {
    key: 'owner',
    label: 'Владелец',
    desc: 'Полный доступ, биллинг, удаление организации',
    perms: 'Все права',
  },
  {
    key: 'admin',
    label: 'Администратор',
    desc: 'Управление объектами, рисками, пользователями',
    perms: '12 из 14',
  },
  {
    key: 'analyst',
    label: 'Аналитик ИБ',
    desc: 'Работа с рисками и оценками, без админ-функций',
    perms: '8 из 14',
  },
  {
    key: 'viewer',
    label: 'Наблюдатель',
    desc: 'Только чтение дашбордов и паспортов',
    perms: '3 из 14',
  },
];

export function RolesInfoCard() {
  return (
    <div className="card span-4">
      <div className="card-head">
        <span className="card-title">Роли и права</span>
      </div>
      <div className="card-body">
        <div className="roles">
          {ROLES.map((r) => (
            <div className="role" key={r.key}>
              <div className="role-head">
                <span className="role-name">{r.label}</span>
                <span className="role-perms mono">{r.perms}</span>
              </div>
              <p className="role-desc">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
