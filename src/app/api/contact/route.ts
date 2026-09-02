import { NextRequest, NextResponse } from "next/server";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  receivedAt: string;
};

// In-memory store for the demo. Resets on server restart.
const inquiries: Inquiry[] = [];

const SERVICES = [
  "Brand Identity",
  "Interactive Web",
  "Motion Design",
  "Product Design",
] as const;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    studio: "Pixel Point Studio",
    services: SERVICES,
    inquiriesReceived: inquiries.length,
  });
}

export async function POST(request: NextRequest) {
  let body: Partial<Record<keyof Inquiry, unknown>>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const service = typeof body.service === "string" ? body.service.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const errors: string[] = [];
  if (name.length < 2) errors.push("Please provide your name.");
  if (!isValidEmail(email)) errors.push("Please provide a valid email address.");
  if (message.length < 10)
    errors.push("Tell us a little more about your project (10+ characters).");

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const inquiry: Inquiry = {
    id: `PPS-${Date.now().toString(36).toUpperCase()}`,
    name,
    email,
    service: service || "General",
    message,
    receivedAt: new Date().toISOString(),
  };
  inquiries.push(inquiry);

  return NextResponse.json(
    {
      ok: true,
      id: inquiry.id,
      message: `Thanks ${inquiry.name}, we'll be in touch shortly.`,
    },
    { status: 201 },
  );
}
