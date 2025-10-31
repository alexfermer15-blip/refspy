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
        response: '🚨 SECURE CHANNEL OFFLINE\n\nAdd OPENROUTER_API_KEY to .env.local'
      }, { status: 500 })
    }

    const systemPrompt = `You are SPY INTEL AI, an elite intelligence analyst for RefSpy.

YOUR MISSION:
- Analyze enemy backlink networks and provide tactical intelligence
- Recommend covert link building operations
- Decode competitor strategies and vulnerabilities
- Provide actionable intel for SEO domination

OPERATIONAL CONTEXT:
${context?.project ? `🎯 Operation: ${context.project.name || 'CLASSIFIED'}
🔍 Target Keyword: ${context.project.keyword || 'REDACTED'}
🌍 Region: ${context.project.region || 'GLOBAL'}` : '⚠️ No active operation'}

📊 Intelligence Summary:
- Enemy Targets Identified: ${context?.competitors || 0}
- Link Networks Discovered: ${context?.backlinks || 0}

COMMUNICATION PROTOCOL:
- Use spy/military terminology (Operation, Target, Intel, Deploy, Infiltrate, Mission)
- Format responses as intelligence briefings
- Use emojis for visual markers: 🎯 🔍 ⚡ 🛡️ 📊 💥 🕵️
- Provide numbered tactical steps
- End with "MISSION DIRECTIVE" or "RECOMMENDED ACTION"
- Keep responses tactical and actionable (max 800 tokens)

STYLE EXAMPLES:
✅ "🎯 TARGET IDENTIFIED: Competitor shows weak defense in anchor diversity..."
✅ "⚡ DEPLOY OPERATION: Phase 1 - Infiltrate guest posting networks..."
✅ "🛡️ DEFENSIVE INTEL: Strengthen these positions immediately..."

FORBIDDEN:
❌ Generic SEO advice without spy theme
❌ Overly long explanations
❌ Breaking character as spy agent`

    console.log('🕵️ Calling OpenRouter API...')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'RefSpy AI Assistant'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free', // ✅ ИСПРАВЛЕНО
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    })

    console.log('📡 OpenRouter Response Status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ OpenRouter Error:', errorData)
      
      throw new Error(errorData.error?.message || `API returned ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ OpenRouter Success')

    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI model')
    }

    return NextResponse.json({
      success: true,
      response: aiResponse
    })

  } catch (error: any) {
    console.error('❌ SPY INTEL AI ERROR:', error.message)

    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      response: `⚠️ SYSTEM MALFUNCTION

Intelligence network disrupted.
Error: ${error.message}

RECOMMENDED ACTION: Retry transmission or check secure channel configuration.`
    }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

  return NextResponse.json({
    status: OPENROUTER_API_KEY ? 'online' : 'offline',
    service: 'SPY INTEL AI - SCORE ENDPOINT',
    version: '1.0.0',
    provider: 'OpenRouter',
    model: 'Mistral 7B Instruct',
    hasApiKey: !!OPENROUTER_API_KEY
  })
}
