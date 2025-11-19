import { Download } from 'lucide-react';
import { generateSamplePDF } from '../utils/pdfProcessing';

export default function SamplePDFGenerator() {
  const handleGenerate = async () => {
    const blob = await generateSamplePDF();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-center space-y-6 py-12">
      <div className="text-white/90">
        <p className="mb-4">Generate a sample PDF document to test the PDF toolkit capabilities.</p>
        <p className="text-sm text-white/70">The PDF will include formatted text and demonstrate basic PDF features.</p>
      </div>
      <button
        onClick={handleGenerate}
        className="bg-gradient-to-r from-[#FFB800] to-[#FF9A1F] text-black py-3 px-8 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FFB800]/40 transition-all inline-flex items-center gap-2 hover:-translate-y-0.5"
      >
        <Download className="w-5 h-5" />
        Generate Sample PDF
      </button>
    </div>
  );
}
