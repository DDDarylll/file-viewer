import type { TreeNode } from '@/types/file-system'

/** 读取目录下一层条目并排序（文件夹在前）。pathPrefix 为当前目录在树中的路径前缀（根目录一般为 handle.name）。 */
export async function loadDirectoryChildren(
  handle: FileSystemDirectoryHandle,
  pathPrefix: string = handle.name,
): Promise<TreeNode[]> {
  const children: TreeNode[] = []
  for await (const entry of handle.values()) {
    const path = `${pathPrefix}/${entry.name}`
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
