import ToolInterface from '../components/ToolInterface';
import { compressImage, compressImagesBatch } from '../utils/imageProcessing';
import { createZip } from '../utils/zipUtils';

interface ImageCompressorProps {
  format: string;
}

export default function ImageCompressor({ format }: ImageCompressorProps) {
  const handleCompress = async (files: File[], quality: number): Promise<Blob> => {
    if (files.length === 1) {
      // Single file compression
      return await compressImage(files[0], quality);
    } else {
      // Multiple files - compress all and create a ZIP
      const compressedFiles = await compressImagesBatch(files, quality);
      return await createZip(compressedFiles);
    }
  };

  const getOutputFileName = (files: File[]) => {
    if (files.length === 1) {
      // PNG files might be converted to JPG for better compression
      const extension = format === 'png' ? 'jpg' : format;
      return `compressed.${extension}`;
    } else {
      return `compressed_images.zip`;
    }
  };

  return (
    <ToolInterface
      accept={`image/${format}`}
      multiple={true}
      onProcess={handleCompress}
      outputFileName={(files: File[]) => getOutputFileName(files)}
      additionalInputs={(params: any, setParams: any) => (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Quality: {Math.round((params.quality || 0.85) * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={params.quality || 0.85}
            onChange={(e) => setParams({ ...params, quality: parseFloat(e.target.value) })}
            className="w-full accent-[#FFB800]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>More compression</span>
            <span>Better quality</span>
          </div>
        </div>
      )}
    >
      <p>
        Upload {format.toUpperCase()} image(s) to compress and reduce file size.
        {format === 'png' && ' Note: PNG will be converted to JPEG for better compression (with white background).'}
        {format === 'jpeg' && ' Adjust quality slider for desired compression level.'}
        {format === 'webp' && ' WebP offers excellent compression with quality control.'}
        {' '}Multiple images will be processed and downloaded as a ZIP file.
      </p>
    </ToolInterface>
  );
}
