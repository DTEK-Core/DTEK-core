// ============================================================
// DTEK Core — Организации, Конфигуратор, Пользователи, Настройки
// ============================================================

function OrgsScreen({ nav }) {
  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Организации</h1>
          <p className="screen-sub">Цифровые модели, к которым у вас есть доступ</p>
        </div>
        <Btn variant="primary" icon="plus" size="sm">Создать организацию</Btn>
      </div>
      <div className="orgs-grid">
        {ORGS_LIST.map(o => {
          const band = trustBand(o.trust);
          return (
            <div className={`orgc ${o.active ? 'active' : ''}`} key={o.id}>
              {o.active && <div className="orgc-active mono"><StatusDot tone="teal" pulse />Активная</div>}
              <div className="orgc-head">
                <span className="orgc-mark"><Icon name="building" size={22} /></span>
                <TrustRing value={o.trust} size={62} stroke={6} label sub="" animate={false} />
              </div>
              <div className="orgc-name">{o.name}</div>
              <div className="orgc-industry">{o.industry}</div>
              <div className="orgc-stats">
                <div className="orgc-stat"><span className="mono orgc-stat-v">{o.objects.toLocaleString('ru')}</span><span className="orgc-stat-l">объектов</span></div>
                <div className="orgc-stat"><span className="orgc-stat-v" style={{ color: band.color }}>{band.label}</span><span className="orgc-stat-l">доверие</span></div>
                <div className="orgc-stat"><span className="orgc-stat-v">{o.role}</span><span className="orgc-stat-l">ваша роль</span></div>
              </div>
              <div className="orgc-foot">
                {o.active
                  ? <Btn variant="line" size="sm" icon="grid" onClick={() => nav('dashboard')}>Открыть модель</Btn>
                  : <Btn variant="ghost" size="sm" icon="refresh">Переключиться</Btn>}
              </div>
            </div>
          );
        })}
        <button className="orgc orgc-add">
          <span className="orgc-add-ico"><Icon name="plus" size={24} /></span>
          <span className="orgc-add-text">Подключить новую организацию</span>
          <span className="orgc-add-sub">Создайте цифровую модель доверия с нуля</span>
        </button>
      </div>
    </div>
  );
}

// ---------- Конфигуратор ----------------------------------
function Configurator({ nav }) {
  const [step, setStep] = useState(2);
  const steps = ['Источники', 'Типы объектов', 'Модель доверия', 'Политики', 'Активация'];
  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Конфигуратор</h1>
          <p className="screen-sub">Настройка модели доверия: веса факторов, коннекторы и правила оценки</p>
        </div>
        <Btn variant="primary" icon="check" size="sm">Применить изменения</Btn>
      </div>

      <div className="config-steps">
        {steps.map((s, i) => (
          <button key={s} className={`cstep ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => setStep(i)}>
            <span className="cstep-n mono">{i < step ? <Icon name="check" size={13} /> : i + 1}</span>
            <span className="cstep-label">{s}</span>
            {i < steps.length - 1 && <span className="cstep-line" />}
          </button>
        ))}
      </div>

      <div className="config-grid">
        <Card title="Веса факторов доверия" className="span-7"
          action={<span className="card-hint mono">Σ = 100%</span>}>
          <WeightEditor />
        </Card>

        <Card title="Коннекторы источников" className="span-5">
          <div className="connectors">
            {[
              ['Active Directory', 'identity', 'Активен', 'teal'],
              ['Сканер уязвимостей', 'shield', 'Активен', 'teal'],
              ['CMDB / Инвентаризация', 'layers', 'Активен', 'teal'],
              ['SIEM (события)', 'pulse', 'Синхронизация', 'amber'],
              ['Облачный провайдер', 'cloud', 'Не настроен', 'neutral'],
            ].map(([name, icon, status, tone]) => (
              <div className="connector" key={name}>
                <span className="connector-ico"><Icon name={icon} size={16} /></span>
                <span className="connector-name">{name}</span>
                <Badge tone={tone} dot={tone !== 'neutral'}>{status}</Badge>
              </div>
            ))}
            <button className="connector-add"><Icon name="plus" size={14} />Добавить коннектор</button>
          </div>
        </Card>

        <Card title="Правила оценки доверия" className="span-12">
          <div className="rules">
            {[
              ['Критический объект с открытым внешним портом', 'Снизить доверие до «Низкого»', 'crit'],
              ['Отсутствие MFA для привилегированной учётной записи', 'Штраф −15 пунктов', 'orange'],
              ['Объект соответствует всем политикам ИБ', 'Бонус +8 пунктов', 'teal'],
              ['Уязвимость CVSS ≥ 9.0 без патча > 72 ч', 'Эскалация в критический риск', 'crit'],
            ].map(([cond, action, tone], i) => (
              <div className="rule" key={i}>
                <span className="rule-when mono">ЕСЛИ</span>
                <span className="rule-cond">{cond}</span>
                <span className="rule-then mono">ТО</span>
                <span className={`rule-action act-${tone}`}>{action}</span>
                <button className="rule-edit"><Icon name="dots" size={16} /></button>
              </div>
            ))}
            <button className="rule-add"><Icon name="plus" size={14} />Создать правило</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function WeightEditor() {
  const [weights, setWeights] = useState(TRUST_FACTORS.map(f => f.weight));
  const total = weights.reduce((a, b) => a + b, 0);
  return (
    <div className="weights">
      {TRUST_FACTORS.map((f, i) => (
        <div className="weight" key={f.key}>
          <div className="weight-top">
            <span className="weight-label">{f.label}</span>
            <span className="weight-val mono">{weights[i]}%</span>
          </div>
          <input type="range" min="0" max="40" value={weights[i]} className="weight-slider"
            onChange={e => setWeights(w => w.map((x, j) => j === i ? +e.target.value : x))}
            style={{ '--p': `${(weights[i] / 40) * 100}%` }} />
        </div>
      ))}
      <div className={`weight-total ${total !== 100 ? 'warn' : ''}`}>
        <span>Сумма весов</span>
        <span className="mono">{total}% {total === 100 ? '✓' : `(${total > 100 ? '−' : '+'}${Math.abs(100 - total)})`}</span>
      </div>
    </div>
  );
}

// ---------- Пользователи ----------------------------------
function UsersScreen({ nav }) {
  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Пользователи</h1>
          <p className="screen-sub">{USERS.length} участников · управление доступом и ролями</p>
        </div>
        <Btn variant="primary" icon="plus" size="sm">Пригласить</Btn>
      </div>

      <div className="users-layout">
        <Card pad={false} className="span-8">
          <div className="utable">
            <div className="utable-head">
              <span className="uth">Участник</span>
              <span className="uth">Роль</span>
              <span className="uth">Команда</span>
              <span className="uth">Статус</span>
              <span className="uth uth-c">Активность</span>
            </div>
            {USERS.map(u => (
              <div className="utable-row" key={u.id}>
                <span className="ut-user">
                  <span className="ut-avatar">{u.name.split(' ').map(n => n[0]).join('')}</span>
                  <span className="ut-user-info">
                    <span className="ut-name">{u.name}</span>
                    <span className="ut-email mono">{u.email}</span>
                  </span>
                </span>
                <span className="ut-cell"><Badge tone={u.role === 'Владелец' ? 'teal' : u.role === 'Администратор' ? 'info' : 'neutral'}>{u.role}</Badge></span>
                <span className="ut-cell ot-dim">{u.team}</span>
                <span className="ut-cell">
                  <span className="ut-status">
                    <StatusDot tone={u.status === 'Активен' ? 'teal' : u.status === 'Приглашён' ? 'amber' : 'crit'} />
                    {u.status}
                  </span>
                </span>
                <span className="ut-cell ut-c ot-dim mono">{u.last}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Роли и права" className="span-4">
          <div className="roles">
            {ROLES.map(r => (
              <div className="role" key={r.key}>
                <div className="role-head">
                  <span className="role-name">{r.label}</span>
                  <span className="role-perms mono">{r.perms}</span>
                </div>
                <p className="role-desc">{r.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Настройки -------------------------------------
function SettingsScreen({ nav }) {
  const [tab, setTab] = useState('profile');
  const tabs = [['profile', 'Профиль'], ['org', 'Организация'], ['notif', 'Уведомления'], ['security', 'Безопасность'], ['billing', 'Тариф']];
  return (
    <div className="screen">
      <div className="screen-head">
        <div><h1 className="screen-title">Настройки</h1><p className="screen-sub">Управление профилем, организацией и платформой</p></div>
      </div>
      <div className="settings-layout">
        <div className="settings-nav">
          {tabs.map(([k, l]) => (
            <button key={k} className={`snav ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="settings-content">
          {tab === 'profile' && (
            <Card title="Профиль">
              <div className="set-profile">
                <span className="set-avatar">АС</span>
                <div className="set-profile-info">
                  <div className="set-profile-name">Анна Соколова</div>
                  <div className="set-profile-role mono">Владелец · CISO Office</div>
                </div>
                <Btn variant="ghost" size="sm">Изменить фото</Btn>
              </div>
              <div className="set-fields">
                <SetField label="Имя" value="Анна Соколова" />
                <SetField label="Email" value="a.sokolova@meridian.ru" />
                <SetField label="Должность" value="Директор по информационной безопасности" />
                <SetField label="Телефон" value="+7 495 ··· ·· ··" />
              </div>
            </Card>
          )}
          {tab === 'org' && (
            <Card title="Организация">
              <div className="set-fields">
                <SetField label="Наименование" value={ORG.name} />
                <SetField label="ИНН" value={ORG.inn} />
                <SetField label="Отрасль" value={ORG.industry} />
                <SetField label="Регион" value={ORG.region} />
                <SetField label="Сотрудников" value={ORG.employees.toLocaleString('ru')} />
              </div>
            </Card>
          )}
          {tab === 'notif' && (
            <Card title="Уведомления">
              <div className="toggles">
                {[['Критические риски', true], ['Снижение индекса доверия', true], ['Новые объекты в модели', false], ['Еженедельный дайджест', true], ['Изменения политик', false]].map(([l, on]) => (
                  <Toggle key={l} label={l} defaultOn={on} />
                ))}
              </div>
            </Card>
          )}
          {tab === 'security' && (
            <Card title="Безопасность">
              <div className="toggles">
                <Toggle label="Двухфакторная аутентификация (2FA)" defaultOn={true} />
                <Toggle label="Единый вход (SSO / SAML)" defaultOn={true} />
                <Toggle label="Ограничение по IP-адресам" defaultOn={false} />
                <Toggle label="Журнал аудита действий" defaultOn={true} />
              </div>
            </Card>
          )}
          {tab === 'billing' && (
            <Card title="Тариф">
              <div className="billing">
                <div className="billing-plan">
                  <div className="billing-plan-name">{ORG.plan}</div>
                  <div className="billing-plan-meta">До 5 000 объектов · неограниченные пользователи · приоритетная поддержка</div>
                </div>
                <div className="billing-usage">
                  <div className="billing-usage-row"><span>Объектов использовано</span><span className="mono">{ORG.objects} / 5 000</span></div>
                  <Meter value={(ORG.objects / 5000) * 100} color="var(--teal)" />
                </div>
                <Btn variant="line" size="sm">Управление тарифом</Btn>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SetField({ label, value }) {
  return (
    <label className="set-field">
      <span className="set-field-label">{label}</span>
      <input className="set-input" defaultValue={value} />
    </label>
  );
}
function Toggle({ label, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button className="toggle-row" onClick={() => setOn(o => !o)}>
      <span className="toggle-label">{label}</span>
      <span className={`toggle ${on ? 'on' : ''}`}><span className="toggle-knob" /></span>
    </button>
  );
}

Object.assign(window, { OrgsScreen, Configurator, UsersScreen, SettingsScreen });
