import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Используй переменные окружения вместо hardcoded ключей!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dgwfsazdcuukkbudlvvu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnd2ZzYXpkY3V1a2tidWRsdnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTg3NDcsImV4cCI6MjA3NTc3NDc0N30.5Pw4UL_uBa4ZI_ZPBum3Mtb8ccxqBjsBi-BLlsyO7Ic'

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not configured properly')
}

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// ===========================
// PROJECTS API
// ===========================

export const projectsAPI = {
  async create(project: any) {
    console.log('🚀 === STARTING PROJECT CREATION ===')
    console.log('📦 Input project data:', project)
    
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      console.log('👤 Auth user:', authUser)
      console.log('👤 Auth error:', authError)
      
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single()

      console.log('📊 Raw Supabase response:')
      console.log('  - data:', data)
      console.log('  - error:', error)
      console.log('  - error type:', typeof error)
      console.log('  - error is null?:', error === null)
      
      if (error) {
        console.log('  - error stringified:', JSON.stringify(error, null, 2))
      }

      if (error) {
        console.error('❌ Error detected!')
        console.error('  - message:', error.message)
        console.error('  - code:', error.code)
        console.error('  - details:', error.details)
        console.error('  - hint:', error.hint)
        
        if (error.message && (error.message.includes('row-level security') || error.message.includes('permission denied'))) {
          console.error('🔒 RLS POLICY VIOLATION!')
          console.error('💡 Solution: Disable RLS with: ALTER TABLE projects DISABLE ROW LEVEL SECURITY;')
        }
        
        throw error
      }

      console.log('✅ Project created successfully!')
      return data
    } catch (err: any) {
      console.error('❌ CATCH BLOCK ERROR:', err)
      console.error('❌ Error type:', typeof err)
      console.error('❌ Error constructor:', err?.constructor?.name)
      console.error('❌ Error keys:', Object.keys(err || {}))
      console.error('❌ Error message:', err?.message)
      console.error('❌ Error stack:', err?.stack)
      throw err
    }
  },

  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===========================
// COMPETITORS API
// ===========================

export const competitorsAPI = {
  async create(competitor: any) {
    const { data, error } = await supabase
      .from('competitors')
      .insert([competitor])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createBulk(projectId: string, competitors: any[]) {
    const competitorsWithProject = competitors.map(c => ({
      ...c,
      project_id: projectId
    }))

    const { data, error } = await supabase
      .from('competitors')
      .insert(competitorsWithProject)
      .select()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true })

    if (error) throw error
    return data || []
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('competitors')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSelected(id: string, isSelected: boolean) {
    const { data, error } = await supabase
      .from('competitors')
      .update({ is_selected: isSelected })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===========================
// BACKLINKS API
// ===========================

export const backlinksAPI = {
  async create(backlink: any) {
    const { data, error } = await supabase
      .from('backlinks')
      .insert([backlink])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createBulk(backlinks: any[]) {
    const { data, error } = await supabase
      .from('backlinks')
      .insert(backlinks)
      .select()

    if (error) throw error
    return data
  },

  async getByCompetitor(competitorId: string) {
    const { data, error } = await supabase
      .from('backlinks')
      .select('*')
      .eq('competitor_id', competitorId)
      .order('dr', { ascending: false })
      .limit(1000)

    if (error) throw error
    return data || []
  },

  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('backlinks')
      .select('*')
      .eq('project_id', projectId)
      .order('dr', { ascending: false })
      .limit(5000)

    if (error) throw error
    return data || []
  },

  async updateSelected(id: string, isSelected: boolean) {
    const { data, error } = await supabase
      .from('backlinks')
      .update({ is_selected: isSelected })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('backlinks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('backlinks')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===========================
// USERS API
// ===========================

export const usersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  async create(user: { id: string; email: string }) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        email: user.email
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===========================
// SETTINGS API
// ===========================

export const settingsAPI = {
  async get(key: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  async update(key: string, value: any) {
    const { data, error } = await supabase
      .from('settings')
      .update({ value })
      .eq('key', key)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')

    if (error) throw error
    return data || []
  },

  async create(key: string, value: any) {
    const { data, error } = await supabase
      .from('settings')
      .insert([{ key, value }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(key: string) {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('key', key)

    if (error) throw error
  }
}

// ===========================
// ACTIVITY LOGS API
// ===========================

export const activityLogsAPI = {
  async create(log: any) {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([log])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getRecent(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, users(*)')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting recent activity:', error)
      return []
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===========================
// PAYMENTS API
// ===========================

export const paymentsAPI = {
  async create(payment: any) {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getStats() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, created_at')

      if (error) throw error
      
      const total = data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyRevenue = data?.reduce((sum, p) => {
        if (new Date(p.created_at) >= monthStart) {
          return sum + (p.amount || 0)
        }
        return sum
      }, 0) || 0

      return { total, monthlyRevenue }
    } catch (error) {
      console.error('Error getting payment stats:', error)
      return { total: 0, monthlyRevenue: 0 }
    }
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===========================
// INTEGRATIONS API
// ===========================

export const integrationsAPI = {
  async create(integration: any) {
    const { data, error } = await supabase
      .from('integrations')
      .insert([integration])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getByType(type: string) {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

export default supabase
