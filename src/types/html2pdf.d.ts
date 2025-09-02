declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    enableLinks?: boolean;
    pagebreak?: {
      mode?: string;
      before?: string[];
      after?: string[];
      avoid?: string[];
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
      logging?: boolean;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: string;
      compress?: boolean;
      precision?: number;
      [key: string]: any;
    };
    image?: {
      type?: string;
      quality?: number;
      [key: string]: any;
    };
    output?: string;
    fontFaces?: boolean;
    pdfCallback?: (pdf: any) => void;
    [key: string]: any;
  }

  interface Html2Pdf {
    from: (element: HTMLElement | string) => Html2Pdf;
    set: (options: Html2PdfOptions) => Html2Pdf;
    save: () => Html2Pdf;
    toPdf: () => Html2Pdf;
    get: (type: string) => any;
    outputPdf: () => any;
    outputImg: () => any;
    then: (callback: (result: any) => any) => Html2Pdf;
    catch: (callback: (error: any) => any) => Html2Pdf;
  }

  export default function(): Html2Pdf;
}
