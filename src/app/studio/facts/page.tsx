"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudioShell } from "@/components/studio-shell";
import { Field, PointButton, ScreenTitle } from "@/components/ui";
import { api } from "@/lib/client";
import { TITLE_MAX, type Job, type ProductFacts } from "@/lib/types";

function FactsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [facts, setFacts] = useState<ProductFacts>({
    title: "",
    price: "",
    material: "",
    ownerBrand: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = params.get("job");
    if (!id) {
      router.replace("/studio/capture");
      return;
    }
    api
      .session()
      .then((s) => {
        if (!s.user) router.replace("/studio/sign-in");
        else return api.job(id);
      })
      .then((data) => {
        if (!data) return;
        setJob(data.job);
        setFacts(data.job.facts);
      })
      .catch((e: Error) => setError(e.message));
  }, [params, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!job) return;
    setBusy(true);
    setError("");
    try {
      const saved = await api.facts(job.id, facts);
      setJob(saved.job);
      router.push(`/studio/generate?job=${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  const canSave = Boolean(facts.title.trim() && job?.coverUrl);

  return (
    <StudioShell step="03 Facts">
      <ScreenTitle
        kicker="Owner brand only"
        title="Facts"
        sub="Save stays off until title and one photo exist."
      />
      {job?.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={job.coverUrl} alt="" className="mb-6 aspect-square w-28 object-cover" />
      ) : (
        <p className="mb-6 text-danger">Add a cover photo first.</p>
      )}
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field
          label="Title"
          required
          name="title"
          maxLength={TITLE_MAX}
          value={facts.title}
          onChange={(e) => setFacts({ ...facts, title: e.target.value })}
          hint={`${facts.title.length}/${TITLE_MAX}`}
          error={!facts.title && error ? error : undefined}
        />
        <Field
          label="Price"
          name="price"
          value={facts.price}
          onChange={(e) => setFacts({ ...facts, price: e.target.value })}
        />
        <Field
          label="Material"
          name="material"
          value={facts.material}
          onChange={(e) => setFacts({ ...facts, material: e.target.value })}
        />
        <Field
          label="Owner brand"
          name="ownerBrand"
          value={facts.ownerBrand}
          onChange={(e) => setFacts({ ...facts, ownerBrand: e.target.value })}
          hint="Your shop name only. No third-party brands."
        />
        {error ? <p className="text-danger">{error}</p> : null}
        <PointButton type="submit" className="w-full" disabled={!canSave || busy} busy={busy}>
          Save facts
        </PointButton>
      </form>
    </StudioShell>
  );
}

export default function FactsPage() {
  return (
    <Suspense>
      <FactsInner />
    </Suspense>
  );
}
