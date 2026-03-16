const IMAGE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'svg',
])

/** 已知二进制格式 - 仅排除这些，其余一律尝试以文本或图片展示 */
const BINARY_EXTENSIONS = new Set([
  'mp3', 'mp4', 'webm', 'ogg', 'wav', 'flac', 'm4a', 'avi', 'mov',
  'exe', 'dll', 'so', 'dylib', 'bin',
  'zip', 'tar', 'gz', 'rar', '7z', 'xz', 'bz2',
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'db', 'sqlite', 'sqlite3',
])

export function getExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

export function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.has(getExt(name))
}

export function isTextFile(name: string): boolean {
  const ext = getExt(name)
  return !ext || !BINARY_EXTENSIONS.has(ext)
}
