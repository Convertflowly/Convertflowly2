import ToolInterface from '../components/ToolInterface';
import { mergePDFs } from '../utils/pdfProcessing';

export default function PDFMerger() {
  const handleMerge = async (files: File[]): Promise<Blob> => {
    return await mergePDFs(files);
  };

  return (
    <ToolInterface
      accept="application/pdf"
      multiple={true}
      onProcess={handleMerge}
      outputFileName="merged.pdf"
    >
      <p>Upload multiple PDF files to merge them into a single document.</p>
    </ToolInterface>
  );
}
