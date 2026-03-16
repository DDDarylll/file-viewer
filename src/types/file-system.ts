/** 文件树节点 - 文件 */
export interface FileNode {
  name: string
  path: string
  kind: 'file'
  handle: FileSystemFileHandle
}

/** 文件树节点 - 文件夹 */
export interface DirNode {
  name: string
  path: string
  kind: 'directory'
  handle: FileSystemDirectoryHandle
  expanded: boolean
  children: TreeNode[] | null // null 表示未加载
}

export type TreeNode = FileNode | DirNode
