import { NextResponse } from 'next/server';
import { ParserOrchestrator } from '@/lib/parsers/core/parser-orchestrator';

export async function GET() {
  try {
    const orchestrator = new ParserOrchestrator();
    const stats = orchestrator.getStats();

    return NextResponse.json({
      success: true,
      quota: stats.googleCSE,
      cache: stats.cache,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
