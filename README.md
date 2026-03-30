# File Viewer

基于浏览器的本地文件查看器，使用 [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) 选择并读取本地文件夹或单个文件，**无需上传、无需后端**，读写均在用户本机完成。

## 功能特性

- **选择文件夹**：系统原生目录选择器（`showDirectoryPicker`）
- **打开单个文件**：`showOpenFilePicker`，无需先选目录即可预览或编辑
- **文件树**：懒加载子目录，点击文件夹展开/折叠
- **树内过滤与搜索**：顶部输入框按文件名过滤已加载节点；在已选文件夹下还会**遍历仓库**按文件名子串搜索（有结果数量上限，输入变化会取消上一次搜索）
- **树与标签联动**：切换当前标签时自动展开路径、**高亮并滚动**到对应树节点
- **多标签**：同时打开多个文件，切换与关闭（关闭前可提示保存）
- **标签增强**：拖拽排序；**右键**菜单支持「关闭其他」「关闭右侧」「恢复最近关闭」（最近关闭栈最多 15 条）
- **文本预览与编辑**：CodeMirror 6 语法高亮、查找、自动换行；可进入编辑模式并**写回磁盘**
- **Markdown 预览**：`.md` / `.markdown` 可开启**左右分屏预览**（`marked` 渲染 + `DOMPurify` 消毒 HTML）
- **图片预览**：常见图片格式预览与下载
- **可调侧栏**：拖拽调整文件树区域宽度
- **主题**：浅色 / 深色 / 跟随系统，顶栏一键循环切换
- **路径复制、重新加载**等辅助操作

### 文本编辑器（CodeMirror）

- 语法高亮：JS/TS、JSON、HTML/CSS、Python、C/C++、Markdown、YAML、XML、Dockerfile、Groovy 等
- 查找（Ctrl+F）
- 自动换行开关
- 暗色主题下使用 One Dark；浅色应用主题下编辑区为浅色样式

### 本地持久化（localStorage）

下列键在浏览器本地保存，下次打开自动恢复：

| 键 | 说明 |
|----|------|
| `fv.sidebarWidth` | 侧栏宽度（约 200–480） |
| `fv.wordWrap` | 自动换行开/关 |
| `fv.theme` | `system` / `light` / `dark` |
| `fv.markdownPreview` | Markdown 分屏预览开/关 |

## 技术栈

- **Vue 3**（`<script setup>` + Composition API）+ **TypeScript**
- **Vite 7**
- **CodeMirror 6**
- **marked**、**dompurify**（Markdown 预览）

## 浏览器要求

需支持 **File System Access API**（`showDirectoryPicker`、`showOpenFilePicker` 等），推荐使用：

- Chrome 86+
- Edge 86+

Safari、Firefox 等若不支持该 API，将无法选择文件夹或打开本地文件。

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
├── App.vue                       # 应用入口，挂载主界面
├── main.ts
├── components/
│   ├── FileViewer/
│   │   └── FileViewer.vue        # 主布局：侧栏 + 标签 + 编辑器/图片/Markdown
│   ├── AppHeader/                # 顶栏：选目录、打开文件、主题、加载态与错误
│   ├── FileTree/                 # 文件树、过滤与仓库内文件名搜索
│   ├── FileTabs/                 # 标签：拖拽、右键菜单
│   ├── EditorToolbar/            # 工具栏：保存、编辑、MD 预览、重载等
│   ├── CodeEditor/               # CodeMirror 封装
│   ├── MarkdownPreview/          # Markdown 渲染预览
│   ├── ImageViewer/
│   └── Toast/
├── composables/
│   ├── useFileViewerWorkspace.ts # 目录/单文件、打开关闭、保存、最近关闭等
│   ├── useViewerPreferences.ts   # 主题与 localStorage 读写
│   ├── useResizableSidebar.ts    # 侧栏宽度与拖拽
│   └── useToast.ts               # 短时提示
├── utils/
│   ├── load-directory-children.ts # 读取单层目录并排序（目录优先）
│   ├── search-files.ts           # 目录树内按文件名 BFS 搜索
│   ├── tree-expand.ts            # 按路径展开树并懒加载
│   ├── tree-filter.ts            # 树节点名称过滤
│   └── file-type.ts              # 文本/图片扩展名判断
└── types/
    ├── file-system.ts            # 树节点类型
    └── opened-file.ts            # 已打开文件条目类型
```

路径别名：`@` → `src/`（见 `vite.config.ts`）。

## License

MIT
