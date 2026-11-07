import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function PointButton({
  children,
  busy,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-3 bg-point px-7 py-4 font-display text-[14px] font-semibold tracking-[0.08em] text-on-point uppercase disabled:cursor-not-allowed disabled:bg-hairline-bone disabled:text-mute ${props.className ?? ""}`}
    >
      <span
        className={`block size-2.5 bg-carbon ${busy ? "point-pulse" : ""}`}
      />
      {children}
    </button>
  );
}

export function CarbonButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center border border-carbon bg-carbon px-7 py-4 font-display text-[14px] font-semibold tracking-[0.08em] text-bone uppercase disabled:opacity-40 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center border border-hairline bg-transparent px-5 py-3 font-display text-[13px] font-semibold tracking-[0.08em] text-carbon uppercase disabled:opacity-40 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Chip({
  active,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center border px-4 py-2 font-display text-[12px] font-semibold tracking-[0.08em] uppercase ${
        active
          ? "border-carbon bg-carbon text-bone"
          : "border-hairline bg-paper text-carbon"
      } ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  required,
  hint,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1 font-display text-[12px] font-semibold tracking-[0.14em] uppercase text-mute">
        {label}
        {required ? <span className="text-danger">*</span> : null}
      </span>
      <input
        {...props}
        className="min-h-11 w-full border border-hairline-bone bg-paper px-3 text-[16px] text-carbon outline-none focus:border-carbon"
      />
      {error ? (
        <span className="mt-1 block text-[13px] text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[13px] text-mute">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block font-display text-[12px] font-semibold tracking-[0.14em] uppercase text-mute">
        {label}
      </span>
      <textarea
        {...props}
        className="min-h-28 w-full border border-hairline bg-paper px-3 py-2 text-[16px] text-carbon outline-none focus:border-carbon"
      />
    </label>
  );
}

export function ScreenTitle({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <header className="mb-6">
      <p className="font-display text-[11px] font-semibold tracking-[0.42em] uppercase text-mute">
        {kicker}
      </p>
      <h1 className="mt-2 font-display text-[32px] font-semibold leading-none tracking-[-0.03em]">
        {title}
      </h1>
      {sub ? <p className="mt-3 text-[15px] leading-snug text-mute">{sub}</p> : null}
    </header>
  );
}
