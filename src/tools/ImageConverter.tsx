import ToolInterface from '../components/ToolInterface';
import { convertImage, convertImagesBatch } from '../utils/imageProcessing';
import { createZip } from '../utils/zipUtils';

interface ImageConverterProps {
  fromFormat: string;
  toFormat: string;
}

export default function ImageConverter({ fromFormat, toFormat }: ImageConverterProps) {
  const handleConvert = async (files: File[]): Promise<Blob> => {
    if (files.length === 1) {
      // Single file conversion - return the converted blob directly
      return await convertImage(files[0], toFormat);
    } else {
      // Multiple files - convert all and create a ZIP
      const convertedFiles = await convertImagesBatch(files, toFormat);
      return await createZip(convertedFiles);
    }
  };

  const getExtension = (format: string) => {
    const map: Record<string, string> = {
      'jpeg': 'jpg',
      'png': 'png',
      'webp': 'webp',
      'avif': 'avif',
      'bmp': 'bmp'
    };
    return map[format] || format;
  };

  const getOutputFileName = (fileCount: number) => {
    if (fileCount === 1) {
      return `converted.${getExtension(toFormat)}`;
    } else {
      return `converted_images_${toFormat}.zip`;
    }
  };

  return (
    <ToolInterface
      accept={`image/${fromFormat}`}
      multiple={true}
      onProcess={handleConvert}
      outputFileName={(files: File[]) => getOutputFileName(files.length)}
    >
      <p>
        Upload {fromFormat.toUpperCase()} image(s) to convert to {toFormat.toUpperCase()} format.
        {' '}Multiple images will be processed and downloaded as a ZIP file.
      </p>
    </ToolInterface>
  );
}
