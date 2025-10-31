// lib/services/email.ts
import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter()
    
    const from = options.from || 
      `${process.env.NOTIFICATION_FROM_NAME} <${process.env.NOTIFICATION_FROM_EMAIL}>`

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log(`✅ Email sent to ${options.to}`)
    return true
  } catch (error) {
    console.error('❌ Email error:', error)
    return false
  }
}

export function generatePositionChangeEmail(changes: any[]): string {
  const rows = changes.map(change => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px;"><strong>${change.keyword}</strong></td>
      <td style="padding: 12px; text-align: center;">
        ${change.previous_position || 'N/A'} → ${change.position}
      </td>
      <td style="padding: 12px; text-align: center;">
        <span style="color: ${change.change > 0 ? '#ef4444' : '#10b981'}; font-weight: bold;">
          ${change.change > 0 ? '↓' : '↑'} ${Math.abs(change.change)}
        </span>
      </td>
      <td style="padding: 12px; text-align: center;">
        ${change.search_engine === 'google' ? 'Google' : 'Яндекс'}
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b00 0%, #ff4500 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">RefSpy</h1>
          <p style="color: white; margin: 10px 0 0;">Отчёт об изменениях позиций</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <p>Обнаружены значительные изменения в позициях:</p>
          
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
            <thead style="background: #1f2937; color: white;">
              <tr>
                <th style="padding: 12px; text-align: left;">Ключевое слово</th>
                <th style="padding: 12px;">Позиция</th>
                <th style="padding: 12px;">Изменение</th>
                <th style="padding: 12px;">Поисковик</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/rank-tracker" 
               style="background: #ff6b00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px;">
              📊 Открыть RefSpy
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280;">
          <p>© 2025 RefSpy. Все права защищены.</p>
        </div>
      </body>
    </html>
  `
}
