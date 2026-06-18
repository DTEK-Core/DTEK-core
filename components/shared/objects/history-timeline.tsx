interface HistoryTimelineProps {
  objectName: string;
  trustScore: number;
}

export function HistoryTimeline({ objectName, trustScore }: HistoryTimelineProps) {
  const events = [
    { t: '2 ч назад',       txt: `Снижение доверия до ${trustScore}`,                          tone: 'orange'  },
    { t: 'Сегодня, 09:14',  txt: 'Завершена автоматическая переоценка факторов',               tone: 'info'    },
    { t: 'Вчера',           txt: 'Обнаружен новый риск: устаревшая конфигурация',              tone: 'crit'    },
    { t: '3 дня назад',     txt: 'Объект включён в технологический сегмент',                   tone: 'teal'    },
    { t: '12 дней назад',   txt: `Объект «${objectName}» добавлен в цифровую модель`,          tone: 'neutral' },
  ];

  return (
    <div className="card">
      <div className="timeline">
        {events.map((e, i) => (
          <div className="tl-item" key={i}>
            <span className={`tl-dot tl-${e.tone}`} />
            <div className="tl-body">
              <span className="tl-time mono">{e.t}</span>
              <span className="tl-text">{e.txt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
