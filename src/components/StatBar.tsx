const MAX_STAT = 255;

export function StatBar({
  value,
  max = MAX_STAT,
  label,
}: {
  value: number;
  max?: number;
  label: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 8, marginBottom: 2, lineHeight: 1.4 }}>
        {label}: {value}
      </div>
      <div className="stat-bar-wrap">
        <div
          className="stat-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
