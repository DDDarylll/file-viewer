/** 已打开的文件 */
export interface OpenedFile {
  id: number
  name: string
  path: string
  type: 'text' | 'image'
  textContent: string
  imageUrl: string | null
  handle: FileSystemFileHandle
  isEditing: boolean
  isDirty: boolean
  originalContent: string
  /** 不支持的二进制类型，仅占位，不可编辑 */
  unsupportedBinary?: boolean
}
