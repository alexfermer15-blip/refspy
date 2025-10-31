// lib/email/templates.ts
// HTML шаблоны для писем

export const emailTemplates = {
  // Приветственное письмо
  welcome: (userName: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to RefSpy</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; color: #ffffff;">
        <div style="background: linear-gradient(to right, #ff6b00, #ef4444); padding: 40px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">🕵️ RefSpy</h1>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 40px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #ff6b00;">Welcome, ${userName}! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
            Thank you for joining RefSpy! You're now part of an elite community of SEO professionals 
            who use competitive intelligence to dominate search results.
          </p>
          
          <h3 style="color: #ff6b00; margin-top: 30px;">What's Next?</h3>
          
          <ul style="font-size: 16px; line-height: 1.8; color: #cccccc;">
            <li>Create your first project</li>
            <li>Analyze your competitors</li>
            <li>Discover valuable backlinks</li>
            <li>Track your rankings</li>
          </ul>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://refspy.com/dashboard" 
               style="display: inline-block; padding: 15px 30px; background: linear-gradient(to right, #ff6b00, #ef4444); 
                      color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666666; font-size: 12px;">
          <p>© 2025 RefSpy. All rights reserved.</p>
        </div>
      </body>
    </html>
  `,

  // Уведомление о завершении анализа
  analysisComplete: (projectName: string, competitorsCount: number, backlinksCount: number) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Analysis Complete</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; color: #ffffff;">
        <div style="background: linear-gradient(to right, #ff6b00, #ef4444); padding: 40px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">🎯 Analysis Complete!</h1>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 40px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #ff6b00;">Your analysis for "${projectName}" is ready!</h2>
          
          <div style="background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #ffffff; margin-top: 0;">Results Summary:</h3>
            <p style="font-size: 18px; color: #cccccc; margin: 10px 0;">
              ✓ <strong>${competitorsCount}</strong> competitors analyzed<br>
              ✓ <strong>${backlinksCount}</strong> backlinks discovered<br>
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
            We've uncovered valuable insights about your competitors' link building strategies. 
            Check out the full results in your dashboard.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://refspy.com/projects" 
               style="display: inline-block; padding: 15px 30px; background: linear-gradient(to right, #ff6b00, #ef4444); 
                      color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Results
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666666; font-size: 12px;">
          <p>© 2025 RefSpy. All rights reserved.</p>
        </div>
      </body>
    </html>
  `,

  // Предупреждение о лимите
  limitWarning: (userName: string, limitType: string, remaining: number) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Usage Limit Warning</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000; color: #ffffff;">
        <div style="background: #f59e0b; padding: 40px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">⚠️ Usage Limit Warning</h1>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 40px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #f59e0b;">Hi ${userName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
            You're approaching your ${limitType} limit. You have <strong>${remaining}</strong> remaining.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
            Consider upgrading your plan to unlock unlimited access and more powerful features.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://refspy.com/pricing" 
               style="display: inline-block; padding: 15px 30px; background: linear-gradient(to right, #ff6b00, #ef4444); 
                      color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Upgrade Now
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666666; font-size: 12px;">
          <p>© 2025 RefSpy. All rights reserved.</p>
        </div>
      </body>
    </html>
  `
}

// Функция отправки email (заглушка)
export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent:')
    console.log('To:', to)
    console.log('Subject:', subject)
    return { success: true }
  }

  // TODO: Интеграция с Resend, SendGrid, или AWS SES
  try {
    // Пример для Resend:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     from: 'RefSpy <noreply@refspy.com>',
    //     to,
    //     subject,
    //     html
    //   })
    // })

    return { success: true }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}
