import type { TreeNode } from '@/types/file-system'

function subtreeMatches(node: TreeNode, t: string): boolean {
  if (node.name.toLowerCase().includes(t)) return true
  if (node.kind === 'file') return false
  if (!node.children) return false
  return node.children.some((c) => subtreeMatches(c, t))
}

/** 是否应在当前过滤条件下显示该节点（含子树匹配）。 */
export function nodeVisibleInFilter(node: TreeNode, filterQuery: string): boolean {
  const t = filterQuery.trim().toLowerCase()
  if (!t) return true
  return subtreeMatches(node, t)
}
