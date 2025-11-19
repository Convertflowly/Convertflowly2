import ToolInterface from '../components/ToolInterface';
import { mergeImages } from '../utils/imageProcessing';

interface ImageMergerProps {
  format: string;
}

export default function ImageMerger({ format }: ImageMergerProps) {
  const handleMerge = async (files: File[]): Promise<Blob> => {
    return await mergeImages(files);
  };

  return (
    <ToolInterface
      accept={`image/${format}`}
      multiple={true}
      onProcess={handleMerge}
      outputFileName={`merged.png`}
    >
      <p>Upload multiple {format.toUpperCase()} images to merge them vertically into a single image.</p>
    </ToolInterface>
  );
}
