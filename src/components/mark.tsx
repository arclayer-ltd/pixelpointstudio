export function PointMark({
  size = 10,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block bg-point ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function Wordmark({ invert = false }: { invert?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 font-display text-[12px] font-semibold tracking-[0.42em] uppercase ${invert ? "text-bone" : "text-carbon"}`}
    >
      <PointMark size={8} />
      Pixelpoint
    </div>
  );
}
