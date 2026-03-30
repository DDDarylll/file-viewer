/** 在目录树中按文件名子串 BFS 搜索（不区分大小写）。 */
export async function searchFilesByName(
  rootHandle: FileSystemDirectoryHandle,
  rootPathPrefix: string,
  query: string,
  options?: { maxResults?: number; signal?: AbortSignal },
): Promise<{ handle: FileSystemFileHandle; name: string; path: string }[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const maxResults = options?.maxResults ?? 200
  const results: { handle: FileSystemFileHandle; name: string; path: string }[] = []

  type QueueItem = { dir: FileSystemDirectoryHandle; prefix: string }
  const queue: QueueItem[] = [{ dir: rootHandle, prefix: rootPathPrefix }]

  while (queue.length > 0 && results.length < maxResults) {
    options?.signal?.throwIfAborted()
    const { dir, prefix } = queue.shift()!

    for await (const entry of dir.values()) {
      options?.signal?.throwIfAborted()
      const path = `${prefix}/${entry.name}`
      if (entry.kind === 'directory') {
        queue.push({ dir: entry, prefix: path })
      } else if (entry.name.toLowerCase().includes(q)) {
        results.push({
          handle: entry as FileSystemFileHandle,
          name: entry.name,
          path,
        })
      }
    }
  }

  return results
}
