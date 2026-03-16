# File Viewer

基于浏览器的本地文件查看器，使用 [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) 直接读取本地文件夹，**无需上传、无需服务器**，所有文件均在本地处理。

## 功能特性

- **文件夹选择**：通过系统原生选择器选择本地目录
- **文件树浏览**：树形展示目录结构，支持展开/折叠
- **多标签页**：同时打开多个文件，标签切换
- **代码编辑**：文本文件支持语法高亮、编辑与保存
- **图片预览**：支持 png、jpg、gif、webp、svg 等常见图片格式
- **可调侧边栏**：拖拽调整文件树宽度

### 文本编辑器功能

- 语法高亮（JS/TS、JSON、HTML/CSS、Python、C/C++、Markdown、YAML、Dockerfile 等）
- 查找（Ctrl+F）
- 自动换行
- 编辑模式切换，支持保存回磁盘

## 技术栈

- **Vue 3** + **TypeScript**
- **Vite**
- **CodeMirror 6**

## 浏览器支持

需要支持 File System Access API 的浏览器，推荐：

- Chrome 86+
- Edge 86+

> Safari、Firefox 目前不支持该 API。

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── App.vue              # 主应用
├── components/
│   ├── AppHeader/       # 顶部栏（选择文件夹、错误提示）
│   ├── FileTree/        # 文件树
│   ├── FileTabs/        # 文件标签页
│   ├── EditorToolbar/   # 编辑器工具栏
│   ├── CodeEditor/      # 代码编辑器（CodeMirror）
│   ├── ImageViewer/     # 图片预览
│   └── Toast/           # 提示消息
├── types/               # 类型定义
└── utils/               # 工具函数
```

## License

MIT
