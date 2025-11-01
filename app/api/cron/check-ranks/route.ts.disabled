import { NextRequest, NextResponse } from 'next/server'
import { RankChecker } from '@/lib/services/rank-checker'
import { sendEmail, generatePositionChangeEmail } from '@/lib/services/email'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // Проверка секретного ключа
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    console.log('🚀 Starting rank check cron job...')
    
    // Получаем всех пользователей с активными подписками
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to check',
        results: []
      })
    }

    const allResults = []

    // Проверяем позиции для каждого пользователя
    for (const user of users) {
      try {
        console.log(`📊 Checking keywords for user ${user.email}...`)
        
        const results = await RankChecker.checkUserKeywords(user.id)
        
        // Фильтруем значительные изменения
        const threshold = parseInt(process.env.SIGNIFICANT_CHANGE_THRESHOLD || '3')
        const significantChanges = results.filter(r => 
          Math.abs(r.change) >= threshold
        )
        
        if (significantChanges.length > 0) {
          console.log(`📧 Sending email to ${user.email} (${significantChanges.length} changes)`)
          
          const emailHtml = generatePositionChangeEmail(significantChanges)
          
          await sendEmail({
            to: user.email,
            subject: `RefSpy: Обнаружены изменения в ${significantChanges.length} позициях`,
            html: emailHtml
          })
        }
        
        allResults.push({
          userId: user.id,
          email: user.email,
          checked: results.length,
          significantChanges: significantChanges.length
        })
        
      } catch (error) {
        console.error(`Error checking user ${user.id}:`, error)
      }
    }

    console.log('✅ Cron job completed successfully')

    return NextResponse.json({
      success: true,
      message: `Checked ${users.length} users`,
      results: allResults
    })

  } catch (error: any) {
    console.error('❌ Cron job error:', error)
    
    // Отправляем уведомление админу об ошибке
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: '⚠️ RefSpy: Ошибка в Cron Job',
        html: `
          <h2>Ошибка при проверке позиций</h2>
          <p><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          <p><strong>Ошибка:</strong> ${error.message}</p>
          <pre>${error.stack}</pre>
        `
      })
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
