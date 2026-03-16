/// <reference types="vite/client" />

/** File System Access API - 部分浏览器 DOM 类型未包含迭代器 */
interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>
  entries(): AsyncIterableIterator<
    [string, FileSystemFileHandle | FileSystemDirectoryHandle]
  >
  keys(): AsyncIterableIterator<string>
}
