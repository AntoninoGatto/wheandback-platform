import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET || "";
  if (!secret) return NextResponse.json({ ok: false }, { status: 404 });
  const header = request.headers.get("authorization") || "";
  if (header !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { tags?: string[] } | null;
  const tags = body?.tags?.filter((tag) => typeof tag === "string") || [];
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, tags });
}
