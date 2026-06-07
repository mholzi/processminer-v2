import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession, type StoredUser } from "@/lib/auth-server";
import {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  type WhatsNewEntry,
  type EntryTag,
} from "@/lib/whatsnew-store";

// /api/admin/whatsnew
//   GET    — list all entries (any signed-in user; feed is public within the app)
//   POST   — create a new entry (admin only)
//   PATCH  — update an entry by id (admin only)
//   DELETE — delete an entry by id (admin only)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireAuth(req: NextRequest): StoredUser | NextResponse {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const user = verifySession(cookie);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return user;
}

function requireAdmin(req: NextRequest): StoredUser | NextResponse {
  const r = requireAuth(req);
  if (r instanceof NextResponse) return r;
  if (!r.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  return r;
}

const VALID_TAGS: EntryTag[] = ["shipped", "in-flight", "planned"];

function validateInput(b: Record<string, unknown>): string | null {
  if (typeof b.title !== "string" || !b.title.trim()) return "title is required";
  if (!VALID_TAGS.includes(b.tag as EntryTag)) return "tag must be shipped | in-flight | planned";
  if (typeof b.when !== "string" || !b.when.trim()) return "when is required";
  if (typeof b.bucket !== "string" || !b.bucket.trim()) return "bucket is required";
  if (typeof b.summary !== "string" || !b.summary.trim()) return "summary is required";
  return null;
}

export async function GET(req: NextRequest) {
  const r = requireAuth(req);
  if (r instanceof NextResponse) return r;
  return NextResponse.json({ entries: getEntries() });
}

export async function POST(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof NextResponse) return r;
  const b = (await req.json()) as Record<string, unknown>;
  const err = validateInput(b);
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  if (typeof b.id !== "string" || !b.id.trim())
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  try {
    const entry = createEntry({
      id: (b.id as string).trim(),
      title: (b.title as string).trim(),
      tag: b.tag as EntryTag,
      when: (b.when as string).trim(),
      bucket: (b.bucket as string).trim(),
      summary: (b.summary as string).trim(),
      bullets: Array.isArray(b.bullets)
        ? (b.bullets as string[]).filter((x) => typeof x === "string" && x.trim())
        : undefined,
      votes: typeof b.votes === "number" ? b.votes : undefined,
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}

export async function PATCH(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof NextResponse) return r;
  const b = (await req.json()) as Record<string, unknown>;
  if (typeof b.id !== "string") return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    const patch: Partial<Omit<WhatsNewEntry, "id" | "createdAt" | "updatedAt">> = {};
    if (typeof b.title === "string") patch.title = b.title.trim();
    if (VALID_TAGS.includes(b.tag as EntryTag)) patch.tag = b.tag as EntryTag;
    if (typeof b.when === "string") patch.when = b.when.trim();
    if (typeof b.bucket === "string") patch.bucket = b.bucket.trim();
    if (typeof b.summary === "string") patch.summary = b.summary.trim();
    if (Array.isArray(b.bullets))
      patch.bullets = (b.bullets as string[]).filter((x) => typeof x === "string" && x.trim());
    if (typeof b.votes === "number") patch.votes = b.votes;
    const entry = updateEntry(b.id, patch);
    return NextResponse.json({ entry });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  const r = requireAdmin(req);
  if (r instanceof NextResponse) return r;
  const b = (await req.json()) as Record<string, unknown>;
  if (typeof b.id !== "string") return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    deleteEntry(b.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
