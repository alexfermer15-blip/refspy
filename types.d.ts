// types.d.ts или global.d.ts

// Декларация для html2pdf.js
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: { 
      scale: number;
      useCORS?: boolean;
      letterRendering?: boolean;
    };
    jsPDF?: { 
      unit: string; 
      format: string; 
      orientation: string;
      compress?: boolean;
    };
    pagebreak?: { 
      mode?: string | string[];
      before?: string;
      after?: string;
      avoid?: string;
    };
  }

  interface Html2Pdf {
    from(element: HTMLElement | string): Html2Pdf;
    set(options: Html2PdfOptions): Html2Pdf;
    save(): Promise<void>;
    output(type: string): Promise<any>;
    then(callback: (pdf: any) => void): Promise<void>;
  }

  function html2pdf(): Html2Pdf;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Promise<void>;

  export = html2pdf;
}

// Декларация для @/types
declare module '@/types' {
  export interface User {
    id: string;
    email: string;
    // добавьте другие поля
  }

  export interface Keyword {
    id: string;
    keyword: string;
    url: string;
    position: number;
    change: number;
    search_engine: string;
    status: string;
    // добавьте другие поля
  }

  // добавьте другие типы, которые вы экспортируете из @/types
}
