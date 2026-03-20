import type { TreeNode } from '@/types/file-system'

/** 读取目录下一层条目并排序（文件夹在前）。 */
export async function loadDirectoryChildren(
  handle: FileSystemDirectoryHandle,
): Promise<TreeNode[]> {
  const children: TreeNode[] = []
  for await (const entry of handle.values()) {
    const path = `${handle.name}/${entry.name}`
    if (entry.kind === 'directory') {
      children.push({
        name: entry.name,
        path,
        kind: 'directory',
        handle: entry,
        expanded: false,
        children: null,
      })
    } else {
      children.push({
        name: entry.name,
        path,
        kind: 'file',
        handle: entry,
      })
    }
  }
  children.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return children
}
