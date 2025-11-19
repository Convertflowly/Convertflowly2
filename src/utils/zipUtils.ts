/**
 * Creates a ZIP file containing multiple files
 * @param files Array of objects with filename and blob data
 * @returns Promise<Blob> ZIP file as blob
 */
export async function createZip(files: { filename: string; blob: Blob }[]): Promise<Blob> {
  // Use the JSZip library (we'll need to install it)
  // For now, we'll implement a simple approach using the native File API
  
  // Import JSZip dynamically to keep bundle size optimized
  const JSZip = await import('jszip');
  const zip = new JSZip.default();
  
  // Add each file to the zip
  files.forEach(({ filename, blob }) => {
    zip.file(filename, blob);
  });
  
  // Generate the zip file
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Generates a filename for batch operations
 * @param originalName Original filename
 * @param index File index
 * @param newExtension New file extension
 * @returns Generated filename
 */
export function generateBatchFilename(originalName: string, index: number, newExtension: string): string {
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  return `${nameWithoutExt}_converted_${index + 1}.${newExtension}`;
}

/**
 * Checks if we should create a ZIP file based on the number of files
 * @param fileCount Number of files
 * @returns boolean
 */
export function shouldCreateZip(fileCount: number): boolean {
  return fileCount > 1;
}