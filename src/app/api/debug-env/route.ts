// Simple debug route to verify NEXT_PUBLIC env vars at runtime.
// Remove this file in production.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
    note: 'If these are null, Next.js did not load your .env.local file. Ensure the file exists at project root and restart the dev server.'
  });
}