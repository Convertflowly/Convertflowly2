import { useState } from 'react';
import ToolInterface from '../components/ToolInterface';
import { createFavicon } from '../utils/imageProcessing';

export default function FaviconMaker() {
  const [size, setSize] = useState(32);

  const handleCreate = async (files: File[], iconSize: number): Promise<Blob> => {
    return await createFavicon(files[0], iconSize);
  };

  return (
    <ToolInterface
      accept="image/*"
      multiple={false}
      onProcess={(files) => handleCreate(files, size)}
      outputFileName="favicon.ico"
      additionalInputs={
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Favicon Size: {size}x{size}px
          </label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:border-primary/50 focus:outline-none transition-colors"
          >
            <option value="16">16x16 (Small)</option>
            <option value="32">32x32 (Standard)</option>
            <option value="48">48x48 (Large)</option>
          </select>
        </div>
      }
    >
      <p>Upload an image to convert it into a favicon icon file.</p>
    </ToolInterface>
  );
}
