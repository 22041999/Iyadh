type MiniSparklineProps = {
  data: number[];
  stroke?: string;
  fill?: string;
};

export default function MiniSparkline({ data, stroke = "#f97316", fill = "rgba(249, 115, 22, 0.15)" }: MiniSparklineProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 160;
  const height = 48;
  const step = width / (data.length - 1);

  const points = data
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `${points} ${width},${height} 0,${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-12 w-40 text-amber-500"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points={areaPath} fill={fill} stroke="none" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
