# File Viewer

基于浏览器的本地文件查看器，使用 [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) 选择并读取本地文件夹，**无需上传、无需后端**，读写均在用户本机完成。

## 功能特性

- **选择文件夹**：系统原生目录选择器
- **文件树**：懒加载子目录，点击文件夹展开/折叠
- **多标签**：同时打开多个文件，切换与关闭（关闭前可提示保存）
- **文本预览与编辑**：CodeMirror 6 语法高亮、查找、自动换行；可进入编辑模式并**写回磁盘**
- **图片预览**：常见图片格式预览与下载
- **可调侧栏**：拖拽调整文件树区域宽度
- **路径复制、重新加载**等辅助操作

### 文本编辑器（CodeMirror）

- 语法高亮：JS/TS、JSON、HTML/CSS、Python、C/C++、Markdown、YAML、XML、Dockerfile、Groovy 等
- 查找（Ctrl+F）
- 自动换行开关

## 技术栈

- **Vue 3**（`<script setup>` + Composition API）+ **TypeScript**
- **Vite 7**
- **CodeMirror 6**

## 浏览器要求

需支持 **File System Access API**（含 `showDirectoryPicker`），推荐使用：

- Chrome 86+
- Edge 86+

Safari、Firefox 等若不支持该 API，将无法选择文件夹。

## 环境要求

- **Node.js**：`^20.19.0` 或 `>=22.12.0`（见 `package.json` 的 `engines`）

## 快速开始

```bash
npm install
npm run dev
```

### 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 本地预览构建产物 |
| `npm run type-check` | 仅运行 `vue-tsc` |
| `npm run format` | Prettier 格式化 `src/` |

## 项目结构

```
src/
├── App.vue                      # 应用入口，挂载主界面
├── main.ts
├── components/
│   ├── FileViewer/
│   │   └── FileViewer.vue       # 主布局：侧栏 + 标签 + 编辑器/图片区
│   ├── AppHeader/               # 顶栏：选目录、加载态、错误信息
│   ├── FileTree/                # 文件树（含懒加载子目录）
│   ├── FileTabs/                # 已打开文件标签
│   ├── EditorToolbar/           # 工具栏：保存、编辑、重载、复制路径等
│   ├── CodeEditor/              # CodeMirror 封装
│   ├── ImageViewer/
│   └── Toast/
├── composables/
│   ├── useFileViewerWorkspace.ts # 目录选择、打开/关闭文件、保存等业务状态
│   ├── useResizableSidebar.ts    # 侧栏宽度与拖拽
│   └── useToast.ts               # 短时提示
├── utils/
│   ├── load-directory-children.ts # 读取单层目录并排序（目录优先）
│   └── file-type.ts              # 文本/图片扩展名判断
└── types/
    ├── file-system.ts            # 树节点类型
    └── opened-file.ts            # 已打开文件条目类型
```

路径别名：`@` → `src/`（见 `vite.config.ts`）。

## License

MIT
