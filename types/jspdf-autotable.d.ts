declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf'

  interface UserOptions {
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    startY?: number
    theme?: 'striped' | 'grid' | 'plain'
    headStyles?: any
    bodyStyles?: any
    footStyles?: any
    styles?: any
    columnStyles?: Record<number, any>
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
    pageBreak?: 'auto' | 'avoid' | 'always'
    rowPageBreak?: 'auto' | 'avoid'
    tableWidth?: 'auto' | 'wrap' | number
    showHead?: 'everyPage' | 'firstPage' | 'never'
    showFoot?: 'everyPage' | 'lastPage' | 'never'
    didDrawPage?: (data: any) => void
    didParseCell?: (data: any) => void
    willDrawCell?: (data: any) => void
    didDrawCell?: (data: any) => void
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF
}
