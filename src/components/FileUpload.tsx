import { Upload } from 'lucide-react';
import { useState, useRef } from 'react';

interface FileUploadProps {
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  label?: string;
}

export default function FileUpload({ accept, multiple = false, onFilesSelected, label }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 font-functional ${
        isDragging
            ? 'border-[#FFB800] bg-[#FFB800]/10 scale-[1.02]'
          : 'border-white/20 hover:border-[#FFB800]/50 bg-white/5 hover:bg-[#FFB800]/5'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
      />
      <div className={`transition-all duration-300 ${isDragging ? 'scale-105' : ''}`}>
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-xl bg-white/5 border border-[#FFB800]/30">
          <Upload className="w-8 h-8 text-[#FFB800]" />
        </div>
        <p className="text-lg font-semibold text-white mb-2">
          {label || 'Drop your files here or click to browse'}
        </p>
        <p className="text-sm text-white/70">
          {multiple ? (
            <>
              ✨ You can select <span className="text-[#FFB800] font-medium">multiple files</span> at once!
              <br />Drag & drop or click to browse
            </>
          ) : (
            'Select a file to continue'
          )}
        </p>
      </div>
    </div>
  );
}
