// app/api/ai-plans/save/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { project_id, summary, budget_breakdown, timeline, expected_results, budget, provider } = body

    const { data, error } = await supabase
      .from('ai_plans')
      .insert({
        user_id: user.id,
        project_id,
        summary,
        budget_breakdown,
        timeline,
        expected_results,
        budget,
        provider: provider || 'OpenRouter'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('Save AI plan error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
