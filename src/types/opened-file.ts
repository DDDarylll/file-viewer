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
}
