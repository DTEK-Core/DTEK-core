type SkeletonVariant =
  | 'dashboard'
  | 'objects'
  | 'risks'
  | 'users'
  | 'settings'
  | 'graph'
  | 'configurator';

interface PageSkeletonProps {
  titleWidth?: number;
  subtitleWidth?: number;
  variant: SkeletonVariant;
}

function Block({
  width = '100%',
  height,
  radius,
}: {
  width?: number | string;
  height: number;
  radius?: number;
}) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}

function Header({
  titleWidth = 220,
  subtitleWidth = 340,
  actions = 1,
}: {
  titleWidth?: number;
  subtitleWidth?: number;
  actions?: number;
}) {
  return (
    <div className="loading-head">
      <div>
        <Block width={titleWidth} height={30} />
        <div style={{ height: 8 }} />
        <Block width={subtitleWidth} height={14} />
      </div>
      <div className="loading-actions">
        {Array.from({ length: actions }).map((_, index) => (
          <Block key={index} width={index === 0 ? 112 : 140} height={32} radius={8} />
        ))}
      </div>
    </div>
  );
}

function TableRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="loading-toolbar">
        <Block width={180} height={16} />
        <Block width={120} height={28} radius={8} />
      </div>
      <div className="loading-list">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="loading-list-row" key={index}>
            <Block width={36} height={36} radius={9} />
            <Block width="82%" height={16} />
            <Block width="100%" height={14} />
            <Block width={72} height={24} radius={999} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="dash-hero">
        <div className="card hero-trust">
          <Block width={150} height={150} radius={999} />
          <div style={{ flex: 1 }}>
            <Block width={220} height={12} />
            <div style={{ height: 12 }} />
            <Block width={120} height={24} radius={999} />
            <div style={{ height: 16 }} />
            <Block width="90%" height={14} />
            <div style={{ height: 8 }} />
            <Block width="72%" height={14} />
          </div>
        </div>
        <div className="loading-grid-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="card loading-card" key={index}>
              <Block width={92} height={12} />
              <div style={{ height: 16 }} />
              <Block width={66} height={32} />
              <div style={{ height: 18 }} />
              <Block width="100%" height={24} radius={999} />
            </div>
          ))}
        </div>
      </div>
      <div className="card loading-card">
        <div className="loading-toolbar" style={{ padding: 0, marginBottom: 18 }}>
          <Block width={210} height={18} />
          <Block width={190} height={34} radius={8} />
        </div>
        <Block height={190} radius={8} />
      </div>
      <div className="loading-grid-2">
        <div className="card loading-card"><Block height={170} radius={8} /></div>
        <div className="card loading-card"><Block height={170} radius={8} /></div>
      </div>
    </>
  );
}

function GraphSkeleton() {
  return (
    <div className="loading-graph">
      <div className="card loading-graph-stage">
        <div className="loading-graph-node n1 skeleton" />
        <div className="loading-graph-node n2 skeleton" />
        <div className="loading-graph-node n3 skeleton" />
        <div className="loading-graph-node n4 skeleton" />
        <div className="loading-graph-node n5 skeleton" />
      </div>
      <aside className="card loading-card">
        <Block width={160} height={18} />
        <div style={{ height: 18 }} />
        <Block height={90} radius={10} />
        <div style={{ height: 16 }} />
        <Block height={170} radius={10} />
      </aside>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="settings-layout">
      <div className="settings-nav">
        {Array.from({ length: 5 }).map((_, index) => (
          <Block key={index} width="100%" height={38} radius={8} />
        ))}
      </div>
      <div className="card loading-card">
        <Block width={180} height={18} />
        <div style={{ height: 24 }} />
        <Block width="100%" height={52} radius={10} />
        <div style={{ height: 12 }} />
        <Block width="86%" height={52} radius={10} />
        <div style={{ height: 12 }} />
        <Block width="72%" height={52} radius={10} />
      </div>
    </div>
  );
}

function ConfiguratorSkeleton() {
  return (
    <div className="cfg-wrap">
      <div className="card cfg-card">
        <div className="card-head">
          <Block width={220} height={18} />
          <Block width={160} height={14} />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="cfg-factor" key={index}>
            <Block width={180} height={14} />
            <div className="cfg-factor-controls">
              <Block height={10} radius={999} />
              <Block width={58} height={34} radius={8} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({
  titleWidth,
  subtitleWidth,
  variant,
}: PageSkeletonProps) {
  return (
    <div className="screen">
      <div className="loading-stack">
        <Header
          titleWidth={titleWidth}
          subtitleWidth={subtitleWidth}
          actions={variant === 'dashboard' || variant === 'objects' || variant === 'risks' || variant === 'users' ? 2 : 0}
        />

        {variant === 'dashboard' && <DashboardSkeleton />}
        {variant === 'objects' && (
          <>
            <div className="card"><div className="loading-toolbar"><Block width="45%" height={34} /><Block width={260} height={34} /></div></div>
            <TableRows rows={7} />
          </>
        )}
        {variant === 'risks' && (
          <>
            <div className="loading-grid-4">
              {Array.from({ length: 4 }).map((_, index) => <div className="card loading-card" key={index}><Block width={86} height={12} /><div style={{ height: 12 }} /><Block width={54} height={30} /></div>)}
            </div>
            <TableRows rows={6} />
          </>
        )}
        {variant === 'users' && (
          <div className="users-layout">
            <div className="span-8">
              <TableRows rows={6} />
            </div>
            <div className="card span-4 loading-card">
              <Block height={260} radius={10} />
            </div>
          </div>
        )}
        {variant === 'settings' && <SettingsSkeleton />}
        {variant === 'graph' && <GraphSkeleton />}
        {variant === 'configurator' && <ConfiguratorSkeleton />}
      </div>
    </div>
  );
}
