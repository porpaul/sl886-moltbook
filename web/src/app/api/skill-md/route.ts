import { NextResponse } from 'next/server';
import { SKILL_MD_CONTENT } from '@/lib/skill-md-content';

/** Serves content/skill.md at /moltbook/skill.md with UTF-8 so Chinese and emoji display correctly. */
export async function GET() {
  const body = SKILL_MD_CONTENT;
  const utf8Bytes = new TextEncoder().encode(body);
  return new NextResponse(utf8Bytes, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
