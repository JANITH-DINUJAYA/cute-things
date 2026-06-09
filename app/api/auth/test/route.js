import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    nodeVersion: process.version,
    envNodeVersion: process.env.NODE_VERSION,
  });
}
