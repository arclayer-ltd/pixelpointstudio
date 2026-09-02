"use client";

import { useState } from "react";

const SERVICES = [
  "Brand Identity",
  "Interactive Web",
  "Motion Design",
  "Product Design",
];

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; id: string; message: string }
  | { kind: "error"; errors: string[] };

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, service, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ kind: "success", id: data.id, message: data.message });
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus({
          kind: "error",
          errors: data.errors ?? [data.error ?? "Something went wrong."],
        });
      }
    } catch {
      setStatus({
        kind: "error",
        errors: ["Network error. Please try again."],
      });
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-xs font-medium text-muted">
            Name
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs font-medium text-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ada@studio.com"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="service" className="text-xs font-medium text-muted">
          Service
        </label>
        <select
          id="service"
          name="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className={inputClasses}
        >
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-xs font-medium text-muted">
          Project details
        </label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your project, timeline, and goals…"
          rows={4}
          className={inputClasses}
        />
      </div>

      <button
        type="submit"
        disabled={status.kind === "submitting"}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.kind === "submitting" ? "Sending…" : "Start a project"}
      </button>

      {status.kind === "success" && (
        <div
          role="status"
          className="rounded-lg border border-accent-2/40 bg-accent-2/10 px-4 py-3 text-sm text-accent-2"
        >
          <p className="font-semibold">{status.message}</p>
          <p className="mt-1 text-xs text-muted">
            Reference: <span className="font-mono">{status.id}</span>
          </p>
        </div>
      )}

      {status.kind === "error" && (
        <ul className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {status.errors.map((err) => (
            <li key={err}>• {err}</li>
          ))}
        </ul>
      )}
    </form>
  );
}
