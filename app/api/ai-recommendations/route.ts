// app/api/ai-recommendations/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1'
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const project = body.project
    const competitors = body.competitors
    const backlinks = body.backlinks
    const budget = body.budget
    const gapOpportunities = body.gapOpportunities

    if (!project || !competitors || !backlinks) {
      return NextResponse.json(
        { error: 'Project, competitors and backlinks data required' },
        { status: 400 }
      )
    }

    console.log('🤖 Generating AI recommendations with OpenRouter...')

    const topCompetitors = competitors.slice(0, 5).map((c: any) => ({
      domain: c.domain,
      dr: c.dr,
      backlinks: c.backlinks_count
    }))

    const topGapOpportunities = (gapOpportunities || []).slice(0, 10).map((g: any) => ({
      domain: g.source_domain,
      competitors: g.competitor_count,
      dr: g.avg_dr
    }))

    const competitorsList = topCompetitors.map((c: any) => {
      return '- ' + c.domain + ' (DR: ' + c.dr + ', Бэклинки: ' + c.backlinks + ')'
    }).join('\n')

    const gapList = topGapOpportunities.map((g: any) => {
      return '- ' + g.domain + ' (DR: ' + g.dr + ', упоминаний: ' + g.competitors + ')'
    }).join('\n')

    const prompt = 'Ты - эксперт по SEO и линкбилдингу. Создай детальный план линкбилдинга для проекта.\n\n' +
      'ДАННЫЕ ПРОЕКТА:\n' +
      '- Название: ' + project.name + '\n' +
      '- Ключевое слово: ' + project.keyword + '\n' +
      '- Домен: ' + (project.domain || 'не указан') + '\n' +
      '- Регион: ' + project.region + '\n' +
      '- Бюджет: ' + budget + ' USD\n\n' +
      'ТОП КОНКУРЕНТЫ:\n' + competitorsList + '\n\n' +
      'НАЙДЕНО ВОЗМОЖНОСТЕЙ:\n' +
      '- Всего конкурентов: ' + competitors.length + '\n' +
      '- Всего бэклинков: ' + backlinks.length + '\n' +
      '- Gap возможностей: ' + (gapOpportunities?.length || 0) + '\n\n' +
      'ТОП GAP ВОЗМОЖНОСТИ:\n' + gapList + '\n\n' +
      'ЗАДАЧА:\n' +
      'Создай персональный план линкбилдинга на 3 месяца с учетом бюджета ' + budget + ' USD.\n\n' +
      'Верни JSON в следующем формате:\n' +
      '{\n' +
      '  "summary": "Краткое описание стратегии (2-3 предложения)",\n' +
      '  "budget_breakdown": [\n' +
      '    {\n' +
      '      "domain": "example.com",\n' +
      '      "cost": 150,\n' +
      '      "priority": "high",\n' +
      '      "type": "guest_post"\n' +
      '    }\n' +
      '  ],\n' +
      '  "timeline": [\n' +
      '    {\n' +
      '      "month": 1,\n' +
      '      "action": "Описание действий на первый месяц",\n' +
      '      "expected_links": 5\n' +
      '    }\n' +
      '  ],\n' +
      '  "expected_results": {\n' +
      '    "position_improvement": "Топ-10 в Топ-5",\n' +
      '    "estimated_traffic": "+200-300 визитов в месяц"\n' +
      '  }\n' +
      '}\n\n' +
      'ВАЖНО:\n' +
      '1. Распредели бюджет между 8-12 доменами\n' +
      '2. Приоритизируй домены с высоким DR и упоминаниями у конкурентов\n' +
      '3. Средняя цена размещения 100-200 USD\n' +
      '4. Сделай реалистичный прогноз результатов\n' +
      '5. Верни ТОЛЬКО валидный JSON, без дополнительного текста'

    try {
      const completion = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт по SEO и линкбилдингу. Отвечай только валидным JSON без markdown форматирования.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })

      const responseText = (completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) || '{}'
      console.log('🤖 AI Response:', responseText)

      let recommendations
      try {
        let text = responseText.trim()
        const codeBlock = '\`\`\`'
        const jsonBlock = '\`\`\`json'

        if (text.indexOf(jsonBlock) > -1) {
          text = text.split(jsonBlock).join('')
        }
        if (text.indexOf(codeBlock) > -1) {
          text = text.split(codeBlock).join('')
        }
        text = text.trim()
        
        recommendations = JSON.parse(text)
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        recommendations = generateFallbackRecommendations(budget, topGapOpportunities)
      }

      console.log('✅ AI recommendations generated')

      return NextResponse.json({
        success: true,
        recommendations: recommendations,
        provider: 'OpenRouter (Llama 3.2 Free)'
      })

    } catch (aiError: any) {
      console.error('❌ AI API error:', aiError.message)
      
      const fallback = generateFallbackRecommendations(budget, topGapOpportunities)
      
      return NextResponse.json({
        success: true,
        recommendations: fallback,
        provider: 'Fallback (mock data)',
        note: 'AI API unavailable, using estimated recommendations'
      })
    }

  } catch (error: any) {
    console.error('❌ AI recommendations error:', error)
    
    return NextResponse.json({
      success: true,
      recommendations: generateFallbackRecommendations(1000, []),
      provider: 'Fallback (mock data)'
    })
  }
}

function generateFallbackRecommendations(budget: number, topGapOpportunities: any[]) {
  const avgCost = 150
  const linkCount = Math.max(1, Math.floor(budget / avgCost))
  
  const domains = topGapOpportunities.length > 0 
    ? topGapOpportunities.slice(0, Math.min(linkCount, 12))
    : [
        { source_domain: 'example1.com', avg_dr: 70 },
        { source_domain: 'example2.com', avg_dr: 65 },
        { source_domain: 'example3.com', avg_dr: 60 }
      ]
  
  const summaryText = 'План линкбилдинга на 3 месяца с бюджетом ' + budget + ' USD. Фокус на качественные домены с высоким DR и упоминаниями у конкурентов. Ожидаемый результат: улучшение позиций на 3-5 мест.'
  
  const breakdown = domains.map((g: any, idx: number) => {
    const types = ['guest_post', 'article', 'sponsored']
    return {
      domain: g.source_domain || g.domain || 'example' + (idx + 1) + '.com',
      cost: avgCost + Math.floor(Math.random() * 100) - 50,
      priority: idx < 3 ? 'high' : (idx < 6 ? 'medium' : 'low'),
      type: types[idx % 3]
    }
  })
  
  return {
    summary: summaryText,
    budget_breakdown: breakdown,
    timeline: [
      {
        month: 1,
        action: 'Контактируем с топ-приоритетными доменами, подготавливаем контент, размещаем 30% ссылок',
        expected_links: Math.ceil(linkCount * 0.3)
      },
      {
        month: 2,
        action: 'Продолжаем outreach со средне-приоритетными доменами, размещаем еще 40% ссылок',
        expected_links: Math.ceil(linkCount * 0.4)
      },
      {
        month: 3,
        action: 'Завершаем кампанию, размещаем оставшиеся 30% ссылок, анализируем результаты',
        expected_links: Math.ceil(linkCount * 0.3)
      }
    ],
    expected_results: {
      position_improvement: 'Топ-20 в Топ-10',
      estimated_traffic: '+150-250 визитов в месяц'
    }
  }
}
