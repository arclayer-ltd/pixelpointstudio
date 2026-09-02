import ContactForm from "./contact-form";

const services = [
  {
    title: "Brand Identity",
    description:
      "Logos, systems, and guidelines that make ambitious teams instantly recognizable.",
    icon: "◆",
  },
  {
    title: "Interactive Web",
    description:
      "Fast, accessible websites and web apps built with modern frameworks.",
    icon: "◈",
  },
  {
    title: "Motion Design",
    description:
      "Animation and video that give your product a sense of life and momentum.",
    icon: "◐",
  },
  {
    title: "Product Design",
    description:
      "End-to-end UX and UI for digital products people love to use.",
    icon: "❖",
  },
];

const work = [
  { name: "Nebula Finance", tag: "Fintech · Rebrand", from: "#7c5cff", to: "#21d4fd" },
  { name: "Orbit Health", tag: "Healthcare · Web App", from: "#f857a6", to: "#ff5858" },
  { name: "Kernel AI", tag: "AI · Identity", from: "#43e97b", to: "#38f9d7" },
  { name: "Lumen Retail", tag: "Commerce · Motion", from: "#fa709a", to: "#fee140" },
];

const stats = [
  { value: "120+", label: "Projects shipped" },
  { value: "38", label: "Happy clients" },
  { value: "9", label: "Design awards" },
  { value: "100%", label: "Referral rate" },
];

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float-slow absolute -top-32 -left-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="animate-float-slow absolute top-40 -right-24 h-96 w-96 rounded-full bg-accent-2/20 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 font-bold text-white">
            P
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Pixel Point Studio
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <a href="#services" className="transition hover:text-foreground">
            Services
          </a>
          <a href="#work" className="transition hover:text-foreground">
            Work
          </a>
          <a href="#contact" className="transition hover:text-foreground">
            Contact
          </a>
        </nav>
        <a
          href="#contact"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
        >
          Start a project
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-accent-2" />
          Now booking Q3 projects
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          We design{" "}
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            pixel-perfect
          </span>{" "}
          experiences that move.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Pixel Point Studio is a creative studio crafting brand identities,
          interactive websites, and motion design for teams building the future.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#contact"
            className="rounded-lg bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:opacity-90"
          >
            Start a project
          </a>
          <a
            href="#work"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium transition hover:border-accent"
          >
            View our work
          </a>
        </div>

        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card/50 p-4">
              <dt className="text-2xl font-bold text-foreground">{s.value}</dt>
              <dd className="mt-1 text-xs text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          What we do
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-muted">
          A full-stack creative team, ready to take your product from idea to
          launch.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-border bg-card/50 p-6 transition hover:-translate-y-1 hover:border-accent/60"
            >
              <span className="text-3xl text-accent transition group-hover:text-accent-2">
                {s.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Work */}
      <section id="work" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Selected work
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {work.map((w) => (
            <div
              key={w.name}
              className="group relative overflow-hidden rounded-2xl border border-border"
            >
              <div
                className="h-56 w-full transition duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${w.from}, ${w.to})`,
                }}
              />
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h3 className="font-semibold">{w.name}</h3>
                  <p className="text-xs text-muted">{w.tag}</p>
                </div>
                <span className="text-muted transition group-hover:text-foreground">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-card/60 p-8 sm:p-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Let&apos;s build something
          </h2>
          <p className="mt-3 text-muted">
            Tell us about your project and we&apos;ll get back within one
            business day.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Pixel Point Studio. All rights reserved.</p>
          <p className="font-mono text-xs">Made with Next.js</p>
        </div>
      </footer>
    </main>
  );
}
