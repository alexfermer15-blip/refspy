import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 })
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenRouter API key not configured',
        response: '🚨 ЗАЩИЩЕННЫЙ КАНАЛ НЕ РАБОТАЕТ\n\nДобавьте OPENROUTER_API_KEY в .env.local'
      }, { status: 500 })
    }

    // 🇷🇺 РУССКИЙ СИСТЕМНЫЙ ПРОМПТ
    const systemPrompt = `Ты - АГЕНТ РАЗВЕДКИ AI, элитный аналитик разведки для RefSpy - платформы слежения за конкурентами.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ТВОЯ МИССИЯ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Анализировать вражеские бэклинк-сети и предоставлять тактическую разведку
- Рекомендовать скрытые операции линкбилдинга
- Расшифровывать стратегии и уязвимости конкурентов
- Предоставлять практический интел для SEO-доминирования

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 КОНТЕКСТ ОПЕРАЦИИ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context?.project ? `🎯 Операция: ${context.project.name || 'СЕКРЕТНО'}
🔍 Целевое слово: ${context.project.keyword || 'ЗАСЕКРЕЧЕНО'}
🌍 Регион: ${context.project.region || 'ГЛОБАЛЬНЫЙ'}` : '⚠️ Нет активной операции'}

📊 Сводка разведки:
- Выявленных целей: ${context?.competitors || 0}
- Обнаружено линк-сетей: ${context?.backlinks || 0}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 ПРОТОКОЛ СВЯЗИ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Используй шпионскую/военную терминологию
- Форматируй ответы как разведывательные сводки
- Используй эмодзи: 🎯 🔍 ⚡ 🛡️ 📊 💥 🕵️
- Давай пронумерованные тактические шаги
- Заканчивай с "ДИРЕКТИВА МИССИИ"
- Ответы должны быть тактическими (макс. 800 токенов)

ВСЕГДА отвечай ТОЛЬКО на РУССКОМ ЯЗЫКЕ. Это приказ.`

    console.log('🕵️ Вызов OpenRouter API...')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'RefSpy AI Assistant'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    })

    console.log('📡 Статус ответа OpenRouter:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Ошибка OpenRouter:', errorData)
      
      return NextResponse.json({
        success: false,
        error: `API вернул статус ${response.status}`,
        response: `⚠️ СБОЙ СВЯЗИ\n\nСтатус: ${response.status}\nОшибка: ${errorData.error?.message || 'Неизвестная ошибка'}`
      }, { status: 500 })
    }

    const data = await response.json()
    console.log('✅ OpenRouter успешно')
    console.log('📊 Структура ответа:', JSON.stringify(data, null, 2))

    // 🔍 ПРОВЕРКА СТРУКТУРЫ ОТВЕТА
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      console.error('❌ Нет content в ответе. Полный ответ:', data)
      
      return NextResponse.json({
        success: false,
        error: 'Нет ответа от AI модели',
        response: `⚠️ ОШИБКА ДЕКОДИРОВАНИЯ\n\nAI не вернул текст ответа.\n\nОтладка:\n${JSON.stringify(data, null, 2)}`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      response: aiResponse
    })

  } catch (error: any) {
    console.error('❌ ОШИБКА РАЗВЕДЫВАТЕЛЬНОГО AI:', error.message)
    console.error('Стек:', error.stack)

    return NextResponse.json({
      success: false,
      error: error.message || 'Внутренняя ошибка сервера',
      response: `⚠️ КРИТИЧЕСКИЙ СБОЙ СИСТЕМЫ\n\nРазведывательная сеть нарушена.\nОшибка: ${error.message}\n\nРЕКОМЕНДУЕМЫЕ ДЕЙСТВИЯ: Повторите передачу или проверьте конфигурацию защищенного канала.`
    }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

  return NextResponse.json({
    status: OPENROUTER_API_KEY ? 'онлайн' : 'офлайн',
    service: 'АГЕНТ РАЗВЕДКИ AI',
    version: '1.0.0',
    provider: 'OpenRouter',
    model: 'Mistral 7B Instruct',
    hasApiKey: !!OPENROUTER_API_KEY
  })
}
