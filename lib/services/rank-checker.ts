// lib/services/rank-checker.ts
import { createClient } from '@supabase/supabase-js'

// ⚡ Создаём admin клиента с service_role для системных операций
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface RankCheckResult {
  keyword: string
  url: string
  position: number
  search_engine: 'google' | 'yandex'
  previous_position?: number
  change: number
}

export class RankChecker {
  // =====================================================
  // SERPAPI для Google
  // =====================================================
  static async checkGooglePositionWithSerpApi(
    keyword: string, 
    url: string, 
    location: string = 'Russia'
  ): Promise<number> {
    try {
      const params = new URLSearchParams({
        engine: 'google',
        q: keyword,
        location: location,
        gl: 'ru',
        hl: 'ru',
        num: '100',
        api_key: process.env.SERPAPI_KEY || ''
      })

      const response = await fetch(`https://serpapi.com/search?${params}`)
      
      if (!response.ok) {
        throw new Error(`SerpApi error: ${response.status}`)
      }

      const data = await response.json()
      const organicResults = data.organic_results || []

      const targetDomain = new URL(url).hostname.replace('www.', '')

      const position = organicResults.findIndex((result: any) => {
        if (!result.link) return false
        try {
          const resultDomain = new URL(result.link).hostname.replace('www.', '')
          return resultDomain === targetDomain
        } catch {
          return false
        }
      })

      return position >= 0 ? position + 1 : 101

    } catch (error) {
      console.error('SerpApi Google check error:', error)
      return 101
    }
  }

  // =====================================================
  // XMLRIVER для Яндекса
  // =====================================================
  static async checkYandexPositionWithXMLRiver(
    keyword: string,
    url: string,
    region: string = '213'
  ): Promise<number> {
    try {
      const userHash = process.env.XMLRIVER_USER_HASH
      
      if (!userHash) {
        throw new Error('XMLRIVER_USER_HASH not configured')
      }

      const params = new URLSearchParams({
        user_hash: userHash,
        query: keyword,
        lr: region,
        device: 'desktop',
        page: '0',
        num: '100'
      })

      const response = await fetch(
        `https://xmlriver.com/search/yandex?${params}`
      )

      if (!response.ok) {
        throw new Error(`XMLRiver error: ${response.status}`)
      }

      const xmlText = await response.text()
      const position = this.parseXMLRiverYandex(xmlText, url)
      
      return position

    } catch (error) {
      console.error('XMLRiver Yandex check error:', error)
      return 101
    }
  }

  private static parseXMLRiverYandex(xml: string, targetUrl: string): number {
    try {
      const targetDomain = new URL(targetUrl).hostname.replace('www.', '')
      const urlMatches = xml.match(/<url>(.*?)<\/url>/g) || []
      
      for (let i = 0; i < urlMatches.length; i++) {
        const urlMatch = urlMatches[i].match(/<url>(.*?)<\/url>/)
        
        if (urlMatch && urlMatch[1]) {
          try {
            const resultDomain = new URL(urlMatch[1]).hostname.replace('www.', '')
            if (resultDomain === targetDomain) {
              return i + 1
            }
          } catch {
            continue
          }
        }
      }
      
      return 101
    } catch (error) {
      console.error('XML parsing error:', error)
      return 101
    }
  }

  // =====================================================
  // XMLRIVER для Google
  // =====================================================
  static async checkGooglePositionWithXMLRiver(
    keyword: string,
    url: string,
    location: string = 'ru'
  ): Promise<number> {
    try {
      const userHash = process.env.XMLRIVER_USER_HASH
      
      if (!userHash) {
        throw new Error('XMLRIVER_USER_HASH not configured')
      }

      const params = new URLSearchParams({
        user_hash: userHash,
        query: keyword,
        domain: 'google.ru',
        loc: location,
        device: 'desktop',
        page: '0',
        num: '100'
      })

      const response = await fetch(
        `https://xmlriver.com/search/google?${params}`
      )

      if (!response.ok) {
        throw new Error(`XMLRiver Google error: ${response.status}`)
      }

      const xmlText = await response.text()
      const position = this.parseXMLRiverGoogle(xmlText, url)
      
      return position

    } catch (error) {
      console.error('XMLRiver Google check error:', error)
      return 101
    }
  }

  private static parseXMLRiverGoogle(xml: string, targetUrl: string): number {
    try {
      const targetDomain = new URL(targetUrl).hostname.replace('www.', '')
      const urlMatches = xml.match(/<url>(.*?)<\/url>/g) || []
      
      for (let i = 0; i < urlMatches.length; i++) {
        const urlMatch = urlMatches[i].match(/<url>(.*?)<\/url>/)
        
        if (urlMatch && urlMatch[1]) {
          try {
            const resultDomain = new URL(urlMatch[1]).hostname.replace('www.', '')
            if (resultDomain === targetDomain) {
              return i + 1
            }
          } catch {
            continue
          }
        }
      }
      
      return 101
    } catch (error) {
      console.error('XML parsing error:', error)
      return 101
    }
  }

  // =====================================================
  // Универсальная проверка
  // =====================================================
  static async checkPosition(
    keyword: string,
    url: string,
    searchEngine: 'google' | 'yandex',
    location: string = 'Russia'
  ): Promise<number> {
    try {
      if (searchEngine === 'google') {
        return await this.checkGooglePositionWithSerpApi(keyword, url, location)
      } else if (searchEngine === 'yandex') {
        const region = location === 'Russia' ? '213' : '2'
        return await this.checkYandexPositionWithXMLRiver(keyword, url, region)
      }
      
      return 101
    } catch (error) {
      console.error('Position check error:', error)
      return 101
    }
  }

  // =====================================================
  // ⚡ ИСПРАВЛЕНО: Используем supabaseAdmin
  // =====================================================
  static async checkUserKeywords(userId: string): Promise<RankCheckResult[]> {
    // ⚡ Используем supabaseAdmin вместо обычного supabase
    const { data: keywords, error } = await supabaseAdmin
      .from('keywords')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error || !keywords) {
      console.error('Error fetching keywords:', error)
      return []
    }

    const results: RankCheckResult[] = []

    for (const keyword of keywords) {
      try {
        const newPosition = await this.checkPosition(
          keyword.keyword,
          keyword.url,
          keyword.search_engine
        )

        const previousPosition = keyword.position || 101
        const change = newPosition - previousPosition

        // ⚡ Обновляем позицию - используем supabaseAdmin
        const { error: updateError } = await supabaseAdmin
          .from('keywords')
          .update({
            position: newPosition,
            change: change,
            updated_at: new Date().toISOString()
          })
          .eq('id', keyword.id)

        if (updateError) {
          console.error('Error updating keyword:', updateError)
        }

        // ⚡ Сохраняем в историю - используем supabaseAdmin
        const { error: historyError } = await supabaseAdmin
          .from('keyword_history')
          .insert({
            keyword_id: keyword.id,
            position: newPosition,
            change: change,
            checked_at: new Date().toISOString()
          })

        if (historyError) {
          console.error('Error saving history:', historyError)
        } else {
          console.log(`✅ History saved for keyword: ${keyword.keyword}`)
        }

        results.push({
          keyword: keyword.keyword,
          url: keyword.url,
          position: newPosition,
          search_engine: keyword.search_engine,
          previous_position: previousPosition,
          change: change
        })

        // Задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        console.error(`Error checking keyword ${keyword.keyword}:`, error)
      }
    }

    return results
  }
}
