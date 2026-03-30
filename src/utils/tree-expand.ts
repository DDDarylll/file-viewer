import type { TreeNode } from '@/types/file-system'
import { loadDirectoryChildren } from '@/utils/load-directory-children'

function findNodeByPath(nodes: TreeNode[], path: string): TreeNode | null {
  for (const n of nodes) {
    if (n.path === path) return n
    if (n.kind === 'directory' && n.children) {
      const found = findNodeByPath(n.children, path)
      if (found) return found
    }
  }
  return null
}

/** 沿 path 展开目录并加载未拉取的子节点（path 与树节点 path 一致，如 Root/a/b.txt）。 */
export async function expandTreeToPath(
  rootNodes: TreeNode[] | null,
  targetPath: string,
): Promise<void> {
  if (!rootNodes?.length || !targetPath || !targetPath.includes('/')) return

  const parts = targetPath.split('/')
  for (let end = 1; end < parts.length; end++) {
    const dirPath = parts.slice(0, end).join('/')
    const node = findNodeByPath(rootNodes, dirPath)
    if (node?.kind !== 'directory') continue
    if (node.children === null) {
      node.children = await loadDirectoryChildren(node.handle, dirPath)
    }
    node.expanded = true
  }
}
