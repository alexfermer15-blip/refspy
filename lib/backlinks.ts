// lib/backlinks.ts
import { supabase } from './supabase'
import type { Backlink } from './types'

interface BacklinkInput {
  source_url: string
  source_domain: string
  anchor_text?: string
  target_url: string
  link_type: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored'
  dr?: number
  da?: number
}

export async function saveBacklinks(
  projectId: string,
  competitorUrl: string,
  backlinks: BacklinkInput[]
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    // Сохраняем backlinks в таблицу
    const backlinkData = backlinks.map(b => ({
      project_id: projectId,
      competitor_url: competitorUrl,
      source_url: b.source_url,
      source_domain: b.source_domain,
      anchor_text: b.anchor_text,
      target_url: b.target_url,
      link_type: b.link_type,
      dr: b.dr || 0,
      da: b.da || 0
    }))

    const { data, error } = await supabase
      .from('backlinks')
      .insert(backlinkData)
      .select()

    if (error) throw error

    console.log(`✅ Saved ${data.length} backlinks to database`)
    return { success: true, count: data.length }
  } catch (error: any) {
    console.error('❌ Error saving backlinks:', error)
    return { success: false, error: error.message }
  }
}
