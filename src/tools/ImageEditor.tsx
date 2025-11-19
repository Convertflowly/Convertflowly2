import { useState } from 'react';
import ToolInterface from '../components/ToolInterface';
import { resizeImage, rotateImage, flipImage, grayscaleImage, adjustSaturation, adjustHue } from '../utils/imageProcessing';

interface ImageEditorProps {
  mode: 'resize' | 'rotate' | 'flip' | 'grayscale' | 'saturation' | 'hue';
}

export default function ImageEditor({ mode }: ImageEditorProps) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [degrees, setDegrees] = useState(90);
  const [flipDirection, setFlipDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [saturation, setSaturation] = useState(1);
  const [hueShift, setHueShift] = useState(0);

  const handleProcess = async (files: File[], ...params: any[]): Promise<Blob> => {
    const file = files[0];

    switch (mode) {
      case 'resize':
        return await resizeImage(file, params[0], params[1]);
      case 'rotate':
        return await rotateImage(file, params[0]);
      case 'flip':
        return await flipImage(file, params[0]);
      case 'grayscale':
        return await grayscaleImage(file);
      case 'saturation':
        return await adjustSaturation(file, params[0]);
      case 'hue':
        return await adjustHue(file, params[0]);
      default:
        throw new Error('Invalid mode');
    }
  };

  const getAdditionalInputs = () => {
    switch (mode) {
      case 'resize':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Width: {width}px
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Height: {height}px
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:border-primary/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
        );
      case 'rotate':
        return (
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Rotation: {degrees}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={degrees}
              onChange={(e) => setDegrees(Number(e.target.value))}
              className="w-full"
            />
          </div>
        );
      case 'flip':
        return (
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Direction
            </label>
            <div className="flex gap-4">
              <label className="flex items-center text-white/90">
                <input
                  type="radio"
                  value="horizontal"
                  checked={flipDirection === 'horizontal'}
                  onChange={() => setFlipDirection('horizontal')}
                  className="mr-2"
                />
                Horizontal
              </label>
              <label className="flex items-center text-white/90">
                <input
                  type="radio"
                  value="vertical"
                  checked={flipDirection === 'vertical'}
                  onChange={() => setFlipDirection('vertical')}
                  className="mr-2"
                />
                Vertical
              </label>
            </div>
          </div>
        );
      case 'saturation':
        return (
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Saturation: {saturation.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full"
            />
          </div>
        );
      case 'hue':
        return (
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Hue Shift: {hueShift}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={hueShift}
              onChange={(e) => setHueShift(Number(e.target.value))}
              className="w-full"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const getProcessParams = () => {
    switch (mode) {
      case 'resize':
        return [width, height];
      case 'rotate':
        return [degrees];
      case 'flip':
        return [flipDirection];
      case 'saturation':
        return [saturation];
      case 'hue':
        return [hueShift];
      default:
        return [];
    }
  };

  const descriptions: Record<typeof mode, string> = {
    resize: 'Upload an image and specify the desired width and height.',
    rotate: 'Upload an image and choose the rotation angle.',
    flip: 'Upload an image and choose the flip direction.',
    grayscale: 'Upload an image to convert it to grayscale.',
    saturation: 'Upload an image and adjust the color saturation.',
    hue: 'Upload an image and shift the color hue.'
  };

  return (
    <ToolInterface
      accept="image/*"
      multiple={false}
      onProcess={(files) => handleProcess(files, ...getProcessParams())}
      outputFileName={`edited.png`}
      additionalInputs={getAdditionalInputs()}
    >
      <p>{descriptions[mode]}</p>
    </ToolInterface>
  );
}
