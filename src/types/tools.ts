import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

import {
  ArrowLeftRight,
  Minimize2,
  Layers,
  FileText,
  Edit3,
  Sparkles,
  RotateCw,
  FlipHorizontal,
  Contrast,
  Palette,
  Rainbow,
  FrameIcon,
  Globe,
  FileImage,
  Combine,
  PenTool
} from 'lucide-react';

export const tools: Tool[] = [
  { id: 'jpg-to-png', name: 'JPG to PNG', description: 'Convert JPG images to PNG format', category: 'converters', icon: ArrowLeftRight },
  { id: 'png-to-jpg', name: 'PNG to JPG', description: 'Convert PNG images to JPG format', category: 'converters', icon: ArrowLeftRight },
  { id: 'jpg-to-webp', name: 'JPG to WebP', description: 'Convert JPG images to WebP format', category: 'converters', icon: ArrowLeftRight },
  { id: 'png-to-webp', name: 'PNG to WebP', description: 'Convert PNG images to WebP format', category: 'converters', icon: ArrowLeftRight },
  { id: 'webp-to-jpg', name: 'WebP to JPG', description: 'Convert WebP images to JPG format', category: 'converters', icon: ArrowLeftRight },
  { id: 'webp-to-png', name: 'WebP to PNG', description: 'Convert WebP images to PNG format', category: 'converters', icon: ArrowLeftRight },
  { id: 'jpg-to-avif', name: 'JPG to AVIF', description: 'Convert JPG images to AVIF format', category: 'converters', icon: ArrowLeftRight },
  { id: 'png-to-avif', name: 'PNG to AVIF', description: 'Convert PNG images to AVIF format', category: 'converters', icon: ArrowLeftRight },
  { id: 'jpg-to-bmp', name: 'JPG to BMP', description: 'Convert JPG images to BMP format', category: 'converters', icon: ArrowLeftRight },
  { id: 'png-to-bmp', name: 'PNG to BMP', description: 'Convert PNG images to BMP format', category: 'converters', icon: ArrowLeftRight },
  { id: 'webp-to-bmp', name: 'WebP to BMP', description: 'Convert WebP images to BMP format', category: 'converters', icon: ArrowLeftRight },

  { id: 'compress-jpg', name: 'Compress JPG', description: 'Reduce JPG file size', category: 'compressors', icon: Minimize2 },
  { id: 'compress-png', name: 'Compress PNG', description: 'Reduce PNG file size', category: 'compressors', icon: Minimize2 },
  { id: 'compress-webp', name: 'Compress WebP', description: 'Reduce WebP file size', category: 'compressors', icon: Minimize2 },

  { id: 'merge-jpg', name: 'Merge JPG', description: 'Combine multiple JPG images', category: 'mergers', icon: Combine },
  { id: 'merge-png', name: 'Merge PNG', description: 'Combine multiple PNG images', category: 'mergers', icon: Combine },
  { id: 'merge-webp', name: 'Merge WebP', description: 'Combine multiple WebP images', category: 'mergers', icon: Combine },

  { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert JPG images to PDF', category: 'pdf', icon: FileText },
  { id: 'png-to-pdf', name: 'PNG to PDF', description: 'Convert PNG images to PDF', category: 'pdf', icon: FileText },
  { id: 'webp-to-pdf', name: 'WebP to PDF', description: 'Convert WebP images to PDF', category: 'pdf', icon: FileText },
  { id: 'txt-to-pdf', name: 'TXT to PDF', description: 'Convert text files to PDF', category: 'pdf', icon: FileText },
  { id: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDF files', category: 'pdf', icon: Layers },
  { id: 'sign-pdf', name: 'Sign PDF', description: 'Add digital signature to PDF', category: 'pdf', icon: PenTool },
  { id: 'sample-pdf', name: 'Sample PDF', description: 'Generate a sample PDF document', category: 'pdf', icon: FileText },

  { id: 'resize', name: 'Resize Image', description: 'Change image dimensions', category: 'editors', icon: FrameIcon },
  { id: 'rotate', name: 'Rotate Image', description: 'Rotate image by degrees', category: 'editors', icon: RotateCw },
  { id: 'flip', name: 'Flip Image', description: 'Flip image horizontally or vertically', category: 'editors', icon: FlipHorizontal },
  { id: 'grayscale', name: 'Grayscale', description: 'Convert image to grayscale', category: 'editors', icon: Contrast },
  { id: 'saturation', name: 'Adjust Saturation', description: 'Change color saturation', category: 'editors', icon: Palette },
  { id: 'hue', name: 'Adjust Hue', description: 'Shift color hue', category: 'editors', icon: Rainbow },

  { id: 'placeholder', name: 'Placeholder Generator', description: 'Generate placeholder images', category: 'extras', icon: FileImage },
  { id: 'favicon', name: 'Favicon Maker', description: 'Create favicon from image', category: 'extras', icon: Globe },
];

export const categories: Category[] = [
  { id: 'converters', name: 'Image Converters', icon: ArrowLeftRight },
  { id: 'compressors', name: 'Compressors', icon: Minimize2 },
  { id: 'mergers', name: 'Mergers', icon: Combine },
  { id: 'pdf', name: 'PDF Tools', icon: FileText },
  { id: 'editors', name: 'Editors', icon: Edit3 },
  { id: 'extras', name: 'Extras', icon: Sparkles },
];
