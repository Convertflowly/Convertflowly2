import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import FileUpload from './FileUpload';

interface ToolInterfaceProps {
  accept: string;
  multiple?: boolean;
  onProcess: (files: File[], ...args: any[]) => Promise<Blob>;
  outputFileName: string | ((files: File[]) => string);
  children?: React.ReactNode;
  additionalInputs?: React.ReactNode | ((params: any, setParams: any) => React.ReactNode);
}

export default function ToolInterface({
  accept,
  multiple = false,
  onProcess,
  outputFileName,
  children,
  additionalInputs
}: ToolInterfaceProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [additionalParams, setAdditionalParams] = useState<any>({});

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setResult(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setError(null);

    try {
      const params = Object.values(additionalParams);
      const blob = await onProcess(files, ...params);
      setResult(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = typeof outputFileName === 'function' ? outputFileName(files) : outputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setAdditionalParams({});
  };

  return (
    <div className="space-y-6 font-functional">
      {children && <div className="text-white/90 mb-4 leading-relaxed">{children}</div>}

      {files.length === 0 ? (
        <FileUpload
          accept={accept}
          multiple={multiple}
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="font-semibold text-white mb-3">Selected Files:</p>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between text-sm bg-white/5 border border-white/10 px-4 py-3 rounded-lg">
                  <span className="truncate text-gray-200 font-medium">{file.name}</span>
                  <span className="text-gray-400 ml-2 text-xs">({(file.size / 1024).toFixed(2)} KB)</span>
                </li>
              ))}
            </ul>
          </div>

          {additionalInputs && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              {typeof additionalInputs === 'function'
                ? additionalInputs(additionalParams, setAdditionalParams)
                : additionalInputs}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
              {error}
            </div>
          )}

          {!result && (
            <div className="flex gap-3">
              <button
                onClick={handleProcess}
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-[#FFB800] to-[#FF9A1F] text-black py-4 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#FFB800]/30 hover:-translate-y-0.5"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  files.length === 1 ? 'Process File' : `Process ${files.length} Files`
                )}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all text-white"
              >
                Reset
              </button>
            </div>
          )}

          {result && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center space-y-4">
              <div className="text-[#FFB800] font-bold text-xl">✓ Processing complete!</div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-[#FFB800] to-[#FF9A1F] text-black py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#FFB800]/30 hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
                  Download Result
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all text-white"
                >
                  Process Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
