import ToolInterface from '../components/ToolInterface';
import { imageToPDF, textToPDF } from '../utils/pdfProcessing';

interface PDFConverterProps {
  fromFormat: 'jpg' | 'png' | 'webp' | 'txt';
}

export default function PDFConverter({ fromFormat }: PDFConverterProps) {
  const handleConvert = async (files: File[]): Promise<Blob> => {
    if (fromFormat === 'txt') {
      const text = await files[0].text();
      return await textToPDF(text);
    } else {
      // Validate file types for image formats
      for (const file of files) {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();
        
        if (fromFormat === 'jpg') {
          // Only accept JPG/JPEG files
          if (!fileType.includes('jpeg') && !fileType.includes('jpg') && !fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
            throw new Error(`Only JPG/JPEG files are allowed. Found: ${file.name}`);
          }
        } else if (fromFormat === 'png') {
          // Only accept PNG files
          if (!fileType.includes('png') && !fileName.endsWith('.png')) {
            throw new Error(`Only PNG files are allowed. Found: ${file.name}`);
          }
        } else if (fromFormat === 'webp') {
          // Only accept WebP files
          if (!fileType.includes('webp') && !fileName.endsWith('.webp')) {
            throw new Error(`Only WebP files are allowed. Found: ${file.name}`);
          }
        }
      }
      
      return await imageToPDF(files);
    }
  };

  const getAcceptString = () => {
    if (fromFormat === 'txt') return 'text/plain';
    if (fromFormat === 'jpg') return 'image/jpeg,.jpg,.jpeg';
    if (fromFormat === 'png') return 'image/png,.png';
    if (fromFormat === 'webp') return 'image/webp,.webp';
    return `image/${fromFormat}`;
  };

  return (
    <ToolInterface
      accept={getAcceptString()}
      multiple={fromFormat !== 'txt'}
      onProcess={handleConvert}
      outputFileName="converted.pdf"
    >
      <p>
        Upload {fromFormat === 'txt' ? 'a text file' : `${fromFormat.toUpperCase()} image(s)`} to convert to PDF.
        {fromFormat !== 'txt' && ' Multiple images will be placed on separate pages.'}
      </p>
    </ToolInterface>
  );
}
