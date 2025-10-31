// lib/pdf-export.ts

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportData {
  projectName: string
  keyword: string
  domain: string
  competitors: any[]
  backlinks: any[]
  rankHistory: any[]
  gapOpportunities: any[]
}

export async function generatePDFReport(data: ReportData) {
  const doc = new jsPDF()

  // Заголовок
  doc.setFontSize(24)
  doc.setTextColor(255, 102, 0)
  doc.text('RefSpy Report', 20, 20)

  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30)

  // Project Info
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Project Overview', 20, 45)

  doc.setFontSize(11)
  doc.text(`Project: ${data.projectName}`, 20, 55)
  doc.text(`Keyword: ${data.keyword}`, 20, 62)
  doc.text(`Domain: ${data.domain}`, 20, 69)

  // Statistics
  let yPos = 85
  doc.setFontSize(14)
  doc.text('Statistics', 20, yPos)

  yPos += 10
  doc.setFontSize(11)
  doc.text(`Competitors found: ${data.competitors.length}`, 20, yPos)
  yPos += 7
  doc.text(`Backlinks collected: ${data.backlinks.length}`, 20, yPos)
  yPos += 7
  doc.text(`Gap opportunities: ${data.gapOpportunities.length}`, 20, yPos)

  // Competitors Table
  yPos += 15
  doc.setFontSize(14)
  doc.text('Top Competitors', 20, yPos)

  autoTable(doc, {
    startY: yPos + 5,
    head: [['#', 'Domain', 'Position', 'Backlinks']],
    body: data.competitors.slice(0, 10).map((c, i) => [
      String(i + 1),
      c.domain || '-',
      String(c.position || '-'),
      String(c.backlinks_count || '-')
    ]),
    theme: 'grid',
    headStyles: { fillColor: [255, 102, 0] as [number, number, number] }
  })

  // Gap Analysis (New Page)
  doc.addPage()

  doc.setFontSize(16)
  doc.text('Backlink Gap Opportunities', 20, 20)

  autoTable(doc, {
    startY: 30,
    head: [['Domain', 'Competitors', 'Avg DR', 'Links']],
    body: data.gapOpportunities.slice(0, 20).map(o => [
      o.source_domain || '-',
      String(o.competitor_count || '-'),
      String(o.avg_dr || '-'),
      String(o.total_links || '-')
    ]),
    theme: 'grid',
    headStyles: { fillColor: [255, 102, 0] as [number, number, number] }
  })

  // Download
  doc.save(`RefSpy-Report-${data.projectName}-${Date.now()}.pdf`)
}
