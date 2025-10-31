import { Keyword } from '@/types'

// Экспорт в CSV
export function exportToCSV(keywords: any[], filename: string = 'keywords') {
  // Заголовки
  const headers = [
    'Ключевое слово',
    'URL',
    'Текущая позиция',
    'Предыдущая позиция',
    'Изменение',
    'Лучшая позиция',
    'Поисковик',
    'Локация',
    'Устройство',
    'Статус',
    'Последняя проверка',
    'Дата добавления'
  ]

  // Формирование строк
  const rows = keywords.map(k => {
    const change = k.current_position && k.previous_position
      ? k.previous_position - k.current_position
      : 0
    
    return [
      k.keyword,
      k.target_url,
      k.current_position || 'Не найдено',
      k.previous_position || '—',
      change > 0 ? `+${change}` : change < 0 ? change : '—',
      k.best_position || '—',
      k.search_engine,
      k.location || '—',
      k.device || 'desktop',
      k.is_active ? 'Активно' : 'Неактивно',
      k.last_checked_at ? new Date(k.last_checked_at).toLocaleString('ru-RU') : '—',
      new Date(k.created_at).toLocaleString('ru-RU')
    ]
  })

  // Создание CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Добавление BOM для корректного отображения кириллицы в Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // Скачивание
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Экспорт в PDF (простой вариант - через HTML2PDF)
export async function exportToPDF(keywords: any[], filename: string = 'keywords') {
  // Динамический импорт html2pdf
  const html2pdf = (await import('html2pdf.js')).default

  // Создание HTML контента
  const content = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #f97316; margin-bottom: 20px;">Отчёт по ключевым словам</h1>
      <p style="color: #666; margin-bottom: 30px;">Дата: ${new Date().toLocaleDateString('ru-RU')}</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Ключевое слово</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Позиция</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Изменение</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Поисковик</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Статус</th>
          </tr>
        </thead>
        <tbody>
          ${keywords.map(k => {
            const change = k.current_position && k.previous_position
              ? k.previous_position - k.current_position
              : 0
            const changeColor = change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#6b7280'
            
            return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  <strong>${k.keyword}</strong><br>
                  <small style="color: #666;">${k.target_url}</small>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 18px; font-weight: bold;">
                  ${k.current_position || '—'}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: ${changeColor}; font-weight: bold;">
                  ${change > 0 ? `+${change}` : change < 0 ? change : '—'}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-transform: capitalize;">
                  ${k.search_engine}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  <span style="padding: 4px 12px; border-radius: 12px; background-color: ${k.is_active ? '#d1fae5' : '#f3f4f6'}; color: ${k.is_active ? '#065f46' : '#6b7280'};">
                    ${k.is_active ? 'Активно' : 'Неактивно'}
                  </span>
                </td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #f97316;">
        <h2 style="color: #f97316; margin-bottom: 15px;">Статистика</h2>
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;"><strong>Всего ключевых слов:</strong> ${keywords.length}</li>
          <li style="margin-bottom: 10px;"><strong>Активных:</strong> ${keywords.filter(k => k.is_active).length}</li>
          <li style="margin-bottom: 10px;"><strong>В топ-3:</strong> ${keywords.filter(k => k.current_position && k.current_position <= 3).length}</li>
          <li style="margin-bottom: 10px;"><strong>Улучшились:</strong> ${keywords.filter(k => k.current_position && k.previous_position && k.current_position < k.previous_position).length}</li>
        </ul>
      </div>
      
      <p style="margin-top: 40px; color: #999; font-size: 12px; text-align: center;">
        Создано с помощью RefSpy — ${new Date().toLocaleString('ru-RU')}
      </p>
    </div>
  `

  const opt = {
    margin: 10,
    filename: `${filename}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().set(opt).from(content).save()
}
