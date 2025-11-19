export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

export const convertImage = async (
  file: File,
  targetFormat: string,
  quality: number = 0.92
): Promise<Blob> => {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert image'));
      },
      `image/${targetFormat}`,
      quality
    );
  });
};

export const compressImage = async (
  file: File,
  quality: number = 0.85
): Promise<Blob> => {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  
  const originalFormat = file.type || 'image/jpeg';
  
  // Set canvas dimensions
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  // Enable high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // For PNG, we need to convert to JPEG or reduce dimensions for actual compression
  if (originalFormat === 'image/png') {
    // Fill with white background first (JPEG doesn't support transparency)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    // Try converting to JPEG first
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (jpegBlob) => {
          if (jpegBlob && jpegBlob.size < file.size) {
            // JPEG is smaller, use it
            resolve(jpegBlob);
          } else {
            // JPEG isn't smaller, try reducing dimensions for PNG
            const scaleFactor = Math.sqrt(quality); // Use quality to determine scale
            const newWidth = Math.round(img.width * scaleFactor);
            const newHeight = Math.round(img.height * scaleFactor);
            
            const smallerCanvas = document.createElement('canvas');
            smallerCanvas.width = newWidth;
            smallerCanvas.height = newHeight;
            const smallerCtx = smallerCanvas.getContext('2d');
            
            if (!smallerCtx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            
            smallerCtx.imageSmoothingEnabled = true;
            smallerCtx.imageSmoothingQuality = 'high';
            smallerCtx.drawImage(img, 0, 0, newWidth, newHeight);
            
            smallerCanvas.toBlob(
              (pngBlob) => {
                if (pngBlob) {
                  // Return the smaller of: original, JPEG, or scaled PNG
                  if (pngBlob.size < file.size) {
                    resolve(pngBlob);
                  } else if (jpegBlob && jpegBlob.size < file.size) {
                    resolve(jpegBlob);
                  } else {
                    // If nothing is smaller, return the JPEG anyway
                    resolve(jpegBlob || pngBlob);
                  }
                } else {
                  reject(new Error('Failed to compress PNG'));
                }
              },
              'image/png'
            );
          }
        },
        'image/jpeg',
        quality
      );
    });
  }
  
  // For JPEG and WebP - re-encode with lower quality
  ctx.drawImage(img, 0, 0);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Ensure the compressed version is actually smaller
          if (blob.size < file.size) {
            resolve(blob);
          } else {
            // If re-encoding made it bigger, try with even lower quality
            canvas.toBlob(
              (blob2) => {
                if (blob2 && blob2.size < file.size) {
                  resolve(blob2);
                } else {
                  // Return the smaller of the two attempts
                  resolve(blob2 && blob2.size < blob.size ? blob2 : blob);
                }
              },
              originalFormat,
              quality * 0.7 // Try with 70% of requested quality
            );
          }
        } else {
          reject(new Error('Failed to compress image'));
        }
      },
      originalFormat,
      quality
    );
  });
};

export const resizeImage = async (
  file: File,
  width: number,
  height: number
): Promise<Blob> => {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to resize image'));
      },
      file.type || 'image/png',
      0.92
    );
  });
};

export const rotateImage = async (
  file: File,
  degrees: number
): Promise<Blob> => {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');

  const radians = (degrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));

  canvas.width = img.width * cos + img.height * sin;
  canvas.height = img.width * sin + img.height * cos;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to rotate image'));
      },
      file.type || 'image/png',
      0.92
    );
  });
};

export const flipImage = async (
  file: File,
  direction: 'horizontal' | 'vertical'
): Promise<Blob> => {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  if (direction === 'horizontal') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to flip image'));
      },
      file.type || 'image/png',
      0.92
    );
  });
};

export const grayscaleImage = async (file: File): Promise<Blob> => {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to apply grayscale'));
      },
      file.type || 'image/png',
      0.92
    );
  });
};

export const adjustSaturation = async (
  file: File,
  saturation: number
): Promise<Blob> => {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    data[i] = Math.min(255, Math.max(0, gray + (r - gray) * saturation));
    data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * saturation));
    data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * saturation));
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to adjust saturation'));
      },
      file.type || 'image/png',
      0.92
    );
  });
};

export const adjustHue = async (file: File, hueShift: number): Promise<Blob> => {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const s = max === 0 ? 0 : (max - min) / max;
    const v = max;

    if (max !== min) {
      const d = max - min;
      if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        h = ((b - r) / d + 2) / 6;
      } else {
        h = ((r - g) / d + 4) / 6;
      }
    }

    h = (h + hueShift / 360) % 1;
    if (h < 0) h += 1;

    const hueToRgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let newR: number, newG: number, newB: number;

    if (s === 0) {
      newR = newG = newB = v;
    } else {
      const q = v < 0.5 ? v * (1 + s) : v + s - v * s;
      const p = 2 * v - q;
      newR = hueToRgb(p, q, h + 1 / 3);
      newG = hueToRgb(p, q, h);
      newB = hueToRgb(p, q, h - 1 / 3);
    }

    data[i] = Math.round(newR * 255);
    data[i + 1] = Math.round(newG * 255);
    data[i + 2] = Math.round(newB * 255);
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to adjust hue'));
      },
      file.type || 'image/png',
      0.92
    );
  });
};

export const mergeImages = async (files: File[]): Promise<Blob> => {
  const images = await Promise.all(files.map(loadImageFromFile));

  const totalHeight = images.reduce((sum, img) => sum + img.height, 0);
  const maxWidth = Math.max(...images.map(img => img.width));

  const canvas = document.createElement('canvas');
  canvas.width = maxWidth;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let yOffset = 0;
  for (const img of images) {
    ctx.drawImage(img, 0, yOffset);
    yOffset += img.height;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to merge images'));
      },
      'image/png',
      0.92
    );
  });
};

export const generatePlaceholder = (
  width: number,
  height: number,
  text: string,
  bgColor: string,
  textColor: string
): Blob => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = textColor;
  ctx.font = `${Math.min(width, height) / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  const blob = new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate placeholder'));
      },
      'image/png'
    );
  });

  return blob as unknown as Blob;
};

export const createFavicon = async (
  file: File,
  size: number = 32
): Promise<Blob> => {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create favicon'));
      },
      'image/x-icon',
      1
    );
  });
};

// Batch processing functions
export const convertImagesBatch = async (
  files: File[],
  targetFormat: string,
  quality: number = 0.92
): Promise<{ filename: string; blob: Blob }[]> => {
  const results: { filename: string; blob: Blob }[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const convertedBlob = await convertImage(file, targetFormat, quality);
      const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const filename = `${nameWithoutExt}.${extension}`;
      results.push({ filename, blob: convertedBlob });
    } catch (error) {
      console.error(`Failed to convert ${file.name}:`, error);
      throw new Error(`Failed to convert ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return results;
};

export const compressImagesBatch = async (
  files: File[],
  quality: number = 0.85
): Promise<{ filename: string; blob: Blob }[]> => {
  const results: { filename: string; blob: Blob }[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const compressedBlob = await compressImage(file, quality);
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      // Determine the output extension based on compression result
      let extension = file.name.substring(file.name.lastIndexOf('.') + 1) || 'jpg';
      
      // If original was PNG but we compressed to JPEG, update extension
      if (file.type === 'image/png' && compressedBlob.type === 'image/jpeg') {
        extension = 'jpg';
      }
      
      const filename = `${nameWithoutExt}_compressed.${extension}`;
      results.push({ filename, blob: compressedBlob });
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      throw new Error(`Failed to compress ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return results;
};
