import { Icon } from '@/components/shared/icon';
export function Step4InviteTeam() {
  return (
    <div className="wiz-step-body">
      <div className="wiz-step-intro">
        <h2 className="wiz-step-title">Пригласить команду</h2>
        <p className="wiz-step-sub">
          После запуска создайте ссылки в разделе «Пользователи» и передайте их коллегам.
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span className="wiz-success-icon" style={{ width: 36, height: 36, flexShrink: 0 }}>
              <Icon name="users" size={18} />
            </span>
            <div>
              <strong style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>
                Официальный MVP-поток
              </strong>
              <p style={{ color: 'var(--text-mute)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Только владелец создаёт приглашение. DTEK Core покажет персональную
                ссылку, действующую 7 дней. Её нужно отправить адресату по доверенному каналу.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="card-hint" style={{ marginTop: 12 }}>
        Приглашения не создаются скрыто и не отправляются на email автоматически.
      </p>
    </div>
  );
}
