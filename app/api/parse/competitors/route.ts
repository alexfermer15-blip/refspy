import { NextRequest, NextResponse } from 'next/server';
import { ParserOrchestrator } from '@/lib/parsers/core/parser-orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, location, language, competitorsCount, forceMethod } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    const orchestrator = new ParserOrchestrator();
    
    const results = await orchestrator.analyzeCompetitors({
      keyword,
      location: location || 'us',
      language: language || 'en',
      competitorsCount: competitorsCount || 10,
      forceMethod: forceMethod || undefined,
    });

    // Получаем статистику использования
    const stats = orchestrator.getStats();

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        keyword,
        location: location || 'us',
        analyzedCount: results.length,
        timestamp: new Date().toISOString(),
        usage: stats, // Статистика квот
      },
    });

  } catch (error: any) {
    console.error('Parser API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to analyze competitors',
        success: false 
      },
      { status: 500 }
    );
  }
}

// Новый endpoint для статистики
export async function GET(request: NextRequest) {
  try {
    const orchestrator = new ParserOrchestrator();
    const stats = orchestrator.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
