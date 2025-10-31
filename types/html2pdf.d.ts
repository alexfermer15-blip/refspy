// types/html2pdf.d.ts

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { 
      type: 'jpeg' | 'png' | 'webp'; 
      quality: number;
    };
    html2canvas?: { 
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
      logging?: boolean;
      dpi?: number;
      scrollY?: number;
      scrollX?: number;
      backgroundColor?: string;
    };
    jsPDF?: { 
      unit: 'pt' | 'px' | 'mm' | 'cm' | 'in'; 
      format: 'a4' | 'a3' | 'letter' | [number, number]; 
      orientation: 'portrait' | 'landscape';
      compress?: boolean;
      precision?: number;
    };
    pagebreak?: { 
      mode?: 'avoid-all' | 'css' | 'legacy' | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
  }

  interface Html2Pdf {
    from(element: HTMLElement | string): Html2Pdf;
    set(options: Html2PdfOptions): Html2Pdf;
    save(filename?: string): Promise<void>;
    output(type: string, options?: any): Promise<any>;
    outputPdf(type?: string, options?: any): Promise<any>;
    outputImg(type?: string, options?: any): Promise<any>;
    toPdf(): Html2Pdf;
    toCanvas(): Html2Pdf;
    toContainer(): Html2Pdf;
    toImg(): Html2Pdf;
    then(callback: (pdf: any) => void): Promise<any>;
  }

  function html2pdf(): Html2Pdf;
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Promise<void>;

  export = html2pdf;
}
