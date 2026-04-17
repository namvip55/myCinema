/**
 * Pre-configured highlight timestamps cho các video có sẵn.
 * Key = tên file (lowercase, không extension) → timestamps (giây)
 */
export const DEFAULT_HIGHLIGHTS: Record<string, number[]> = {
  nuot: [6 * 60 + 15], // 6:15
  loli: [1 * 60 + 15], // 1:15
  tyty: [6 * 60 + 50, 9 * 60], // 6:50, 9:00
};

/**
 * Kiểm tra tên file có khớp với highlight preset hay không.
 * So sánh lowercase, bỏ extension.
 */
export function getDefaultHighlights(fileName: string): number[] {
  const name = fileName.toLowerCase().replace(/\.[^.]+$/, '').trim();
  for (const [key, timestamps] of Object.entries(DEFAULT_HIGHLIGHTS)) {
    if (name.includes(key)) {
      return timestamps;
    }
  }
  return [];
}
