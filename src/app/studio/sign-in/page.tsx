"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/mark";
import { CarbonButton, Field, GhostButton, PointButton } from "@/components/ui";
import { api } from "@/lib/client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function localOrMagic(e: FormEvent, mode: "local" | "magic") {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api.signIn(email, mode);
      if (res.sent) {
        setMessage("Check your email for the magic link.");
      } else {
        router.push("/studio");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      const res = await api.google();
      if (res.url) window.location.href = res.url;
      else setError("Google sign-in needs Supabase keys.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col justify-center bg-bone px-5">
      <Wordmark />
      <h1 className="mt-8 font-display text-[40px] font-semibold leading-[0.92] tracking-[-0.03em]">
        OwnerShot
        <span className="ml-1 inline-block size-3 bg-point align-top" />
      </h1>
      <p className="mt-4 text-[16px] text-mute">
        Photograph your product. Sign in with the shop email you own.
      </p>
      <form className="mt-8 space-y-4" onSubmit={(e) => localOrMagic(e, "local")}>
        <Field
          label="Shop email"
          required
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error ? <p className="text-[14px] text-danger">{error}</p> : null}
        {message ? <p className="text-[14px] text-ink">{message}</p> : null}
        <PointButton type="submit" busy={busy} disabled={busy || !email} className="w-full">
          Continue as shop owner
        </PointButton>
        <CarbonButton
          type="button"
          disabled={busy || !email}
          className="w-full"
          onClick={(e) => localOrMagic(e, "magic")}
        >
          Email magic link
        </CarbonButton>
        <GhostButton type="button" disabled={busy} className="w-full" onClick={google}>
          Google
        </GhostButton>
      </form>
    </div>
  );
}
