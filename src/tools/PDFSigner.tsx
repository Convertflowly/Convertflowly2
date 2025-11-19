import { useState } from 'react';
import ToolInterface from '../components/ToolInterface';
import { signPDF } from '../utils/pdfProcessing';

export default function PDFSigner() {
  const [signature, setSignature] = useState('');

  const handleSign = async (files: File[], signatureText: string): Promise<Blob> => {
    if (!signatureText || signatureText.trim() === '') {
      throw new Error('Please enter a signature text');
    }
    return await signPDF(files[0], signatureText.trim());
  };

  return (
    <ToolInterface
      accept="application/pdf"
      multiple={false}
      onProcess={(files) => handleSign(files, signature)}
      outputFileName="signed.pdf"
      additionalInputs={
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Signature Text
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Enter your signature (e.g., John Doe)"
            className="w-full px-4 py-3 bg-dark-card/50 border border-primary/40 rounded-xl text-white placeholder-gray-400 focus:border-primary/70 focus:outline-none transition-colors"
          />
          {signature && (
            <p className="text-xs text-gray-400 mt-1">
              Preview: This will appear as your digital signature
            </p>
          )}
        </div>
      }
    >
      <div>
        <p className="mb-3">Create a digital signature certificate for your PDF file.</p>
        <p className="text-sm text-gray-400">
          This tool generates a signature certificate document that includes your signature, 
          the original file information, and timestamp. Enter your name or signature text below.
        </p>
      </div>
    </ToolInterface>
  );
}
