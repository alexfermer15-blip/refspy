import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/services/email'

export async function GET() {
  try {
    const testEmail = process.env.ADMIN_EMAIL || 'test@example.com'
    
    const success = await sendEmail({
      to: testEmail,
      subject: '✅ RefSpy: Тестовое уведомление',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b00 0%, #ff4500 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">RefSpy</h1>
            <p style="color: white; margin: 10px 0 0;">Тестовое письмо</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">✅ Тест успешно пройден!</h2>
            <p style="color: #374151;">
              Если вы видите это письмо, значит email сервис настроен правильно и готов отправлять уведомления.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280;"><strong>Время отправки:</strong></p>
              <p style="margin: 5px 0 0 0; color: #1f2937;">${new Date().toLocaleString('ru-RU')}</p>
            </div>
            
            <p style="color: #374151;">
              <strong>Следующие шаги:</strong>
            </p>
            <ul style="color: #374151;">
              <li>Добавьте ключевые слова в Rank Tracker</li>
              <li>Дождитесь автоматической проверки (ежедневно в 9:00 UTC)</li>
              <li>Получайте уведомления об изменениях позиций</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280;">
            <p>© 2025 RefSpy</p>
          </div>
        </div>
      `
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${testEmail}`
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
