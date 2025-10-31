import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SERP_API_KEY = process.env.VALUESERP_API_KEY;

// Симуляция проверки позиции
async function simulatePositionCheck() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const random = Math.random();
  let position = null;
  
  if (random < 0.3) {
    position = null; // 30% - не найдено
  } else if (random < 0.5) {
    position = Math.floor(Math.random() * 10) + 1; // 20% - топ-10
  } else if (random < 0.7) {
    position = Math.floor(Math.random() * 20) + 11; // 20% - 11-30
  } else {
    position = Math.floor(Math.random() * 70) + 31; // 30% - 31-100
  }

  return { position };
}

export async function POST(req: NextRequest) {
  try {
    const { keywordId } = await req.json();

    if (!keywordId) {
      return NextResponse.json(
        { success: false, error: 'Keyword ID is required' },
        { status: 400 }
      );
    }

    // Получаем данные ключевого слова
    const { data: keywordData, error: keywordError } = await supabase
      .from('keywords')
      .select('*')
      .eq('id', keywordId)
      .single();

    if (keywordError || !keywordData) {
      return NextResponse.json(
        { success: false, error: 'Keyword not found' },
        { status: 404 }
      );
    }

    // Проверяем позицию (симуляция)
    const result = await simulatePositionCheck();

    const previousPosition = keywordData.current_position;
    const newPosition = result.position;

    // Вычисляем изменение
    const change = previousPosition && newPosition 
      ? previousPosition - newPosition 
      : 0;

    // Обновляем текущую позицию
    const { error: updateError } = await supabase
      .from('keywords')
      .update({
        current_position: newPosition,
        previous_position: previousPosition,
        best_position: newPosition && (!keywordData.best_position || newPosition < keywordData.best_position)
          ? newPosition
          : keywordData.best_position,
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', keywordId);

    if (updateError) {
      console.error('Error updating keyword:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update keyword' },
        { status: 500 }
      );
    }

    // ✅ ИСПРАВЛЕНО: Сохраняем историю ТОЛЬКО если position НЕ null
    if (newPosition !== null) {
      const { error: historyError } = await supabase
        .from('keyword_history')
        .insert({
          keyword_id: keywordId,
          position: newPosition,
          change: change,
          checked_at: new Date().toISOString(),
        });

      if (historyError) {
        console.error('Error saving history:', historyError);
        // Не возвращаем ошибку, просто логируем
      }
    }

    return NextResponse.json({
      success: true,
      position: newPosition,
      previousPosition: previousPosition,
      change: change,
    });

  } catch (error: any) {
    console.error('Rank check error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
