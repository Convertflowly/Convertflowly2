import { useState } from 'react';
import { Download } from 'lucide-react';
import { generatePlaceholder } from '../utils/imageProcessing';

export default function PlaceholderGenerator() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [text, setText] = useState('Placeholder');
  const [bgColor, setBgColor] = useState('#cccccc');
  const [textColor, setTextColor] = useState('#333333');
  const [preview, setPreview] = useState<string | null>(null);

  const handleGenerate = async () => {
    const blob = await generatePlaceholder(width, height, text, bgColor, textColor);
    const url = URL.createObjectURL(blob);
    setPreview(url);
  };

  const handleDownload = () => {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = `placeholder-${width}x${height}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Width (px)</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Height (px)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Background Color</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-full h-10 px-1 py-1 border border-white/20 rounded-lg bg-white/5 focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">Text Color</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-full h-10 px-1 py-1 border border-white/20 rounded-lg bg-white/5 focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full bg-gradient-to-r from-[#FFB800] to-[#FF9A1F] text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-[#FFB800]/25 transition-all"
      >
        Generate Placeholder
      </button>

      {preview && (
        <div className="space-y-4">
          <div className="border border-white/20 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
            <img src={preview} alt="Generated placeholder" className="max-w-full mx-auto" />
          </div>
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-[#FFB800] to-[#FF9A1F] text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-[#FFB800]/25 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Placeholder
          </button>
        </div>
      )}
    </div>
  );
}
