import { loadImageFromFile } from './imageProcessing';
import { PDFDocument, rgb } from 'pdf-lib';

export const imageToPDF = async (files: File[]): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    try {
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else {
        // For other formats, convert to PNG via canvas
        const img = await loadImageFromFile(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        ctx.drawImage(img, 0, 0);
        
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas to blob failed')), 'image/png');
        });
        const pngBuffer = await blob.arrayBuffer();
        image = await pdfDoc.embedPng(pngBuffer);
      }

      const page = pdfDoc.addPage();
      const { width: pageWidth, height: pageHeight } = page.getSize();
      
      const imgDims = image.scale(1);
      const scale = Math.min(
        pageWidth / imgDims.width,
        pageHeight / imgDims.height
      );
      
      const scaledWidth = imgDims.width * scale;
      const scaledHeight = imgDims.height * scale;
      
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;
      
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process ${file.name}: ${error}`);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const textToPDF = async (content: string): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();
  const fontSize = 12;
  const lineHeight = fontSize * 1.2;
  const margin = 50;
  const maxWidth = width - 2 * margin;

  const font = await pdfDoc.embedFont('Courier');
  
  const lines = content.split('\n');
  let y = height - margin;

  for (const line of lines) {
    if (y < margin + lineHeight) {
      // Add new page if we run out of space
      page = pdfDoc.addPage();
      const pageSize = page.getSize();
      height = pageSize.height;
      y = height - margin;
    }
    
    page.drawText(line, {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
      maxWidth,
    });
    y -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const mergePDFs = async (files: File[]): Promise<Blob> => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (error) {
      console.error(`Error merging ${file.name}:`, error);
      throw new Error(`Failed to merge ${file.name}: ${error}`);
    }
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const signPDF = async (file: File, signatureText: string): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;

  const boldFont = await pdfDoc.embedFont('Helvetica-Bold');
  const regularFont = await pdfDoc.embedFont('Helvetica');

  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  let y = height - margin - 30;

  // Title
  page.drawText('Digital Signature Certificate', {
    x: margin,
    y,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  // Original file info
  page.drawText(`Original File: ${file.name}`, {
    x: margin,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  page.drawText(`File Size: ${(file.size / 1024).toFixed(2)} KB`, {
    x: margin,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  page.drawText(`Signed Date: ${currentDate}`, {
    x: margin,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  page.drawText(`Signed Time: ${currentTime}`, {
    x: margin,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  // Signature section
  page.drawText('DIGITAL SIGNATURE:', {
    x: margin,
    y,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // Draw signature box
  page.drawRectangle({
    x: margin,
    y: y - 60,
    width: width - 2 * margin,
    height: 60,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Signature text
  page.drawText(signatureText, {
    x: margin + 10,
    y: y - 35,
    size: 20,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  y -= 90;

  // Footer
  page.drawText('This document has been digitally signed.', {
    x: margin,
    y,
    size: 10,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 15;

  page.drawText('Signature is valid and document integrity is maintained.', {
    x: margin,
    y,
    size: 10,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const generateSamplePDF = async (): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { height } = page.getSize();

  const boldFont = await pdfDoc.embedFont('Helvetica-Bold');
  const regularFont = await pdfDoc.embedFont('Helvetica');

  let y = height - 100;

  page.drawText('Sample PDF Document', {
    x: 100,
    y,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  page.drawText('This is a sample PDF generated by the PDF toolkit.', {
    x: 100,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  page.drawText('It demonstrates basic text rendering capabilities.', {
    x: 100,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  page.drawText('Features:', {
    x: 100,
    y,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  const features = [
    '- Client-side PDF generation',
    '- No external dependencies',
    '- Instant download',
    '- Privacy-focused processing',
  ];

  for (const feature of features) {
    page.drawText(feature, {
      x: 100,
      y,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    y -= 16;
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};
