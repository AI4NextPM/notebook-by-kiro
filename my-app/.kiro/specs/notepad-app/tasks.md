# 实现计划：Notepad App

## 概述

采用测试驱动开发（TDD）方式，按"数据层 → UI 层 → 集成"的顺序实现基于 Next.js + TypeScript 的记事本单页应用。每个任务遵循"先写测试，再写实现"的模式。使用 Vitest + fast-check 进行单元测试和属性测试，使用 React Testing Library 进行组件测试。

## Tasks

- [x] 1. 项目初始化与基础设施搭建
  - 创建 Next.js v16 项目（App Router + TypeScript）
  - 安装测试依赖：vitest、@testing-library/react、@testing-library/jest-dom、fast-check、jsdom
  - 配置 vitest.config.ts（jsdom 环境、路径别名）
  - 创建 `app/lib/types.ts`，定义 Note 接口和 STORAGE_KEY 常量
  - 创建基础目录结构：`app/components/`、`app/lib/`、`__tests__/`、`__tests__/components/`
  - _需求: 6.3, 5.1_

- [x] 2. 数据层：noteStorage 模块和 useNotes Hook（TDD）
  - [x] 2.1 编写 noteStorage 和 useNotes 的全部测试
    - 编写 `__tests__/noteStorage.test.ts`：包含 saveNotes/loadNotes 的单元测试（空数组、正常数据、无效数据、localStorage 不可用）
    - 编写 `__tests__/useNotes.test.ts`：包含 createNote、updateNote、deleteNote、selectNote 的单元测试
    - _需求: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.2, 3.3, 5.1, 5.2, 5.4_

  - [ ]* 2.2 编写 noteStorage 的属性测试
    - **Property 6: 序列化往返一致性** — 生成随机 Note 数组，saveNotes 后 loadNotes 验证等价性
    - **验证需求: 5.1, 5.2, 5.3**
    - **Property 7: 无效数据的优雅降级** — 生成随机非法字符串写入 localStorage，验证 loadNotes 返回空数组
    - **验证需求: 5.4**

  - [ ]* 2.3 编写 useNotes Hook 的属性测试
    - **Property 1: 创建笔记的结构不变量** — 验证新笔记具有 UUID、空标题/内容、有效时间戳
    - **验证需求: 1.1, 1.2, 1.3**
    - **Property 2: 编辑笔记的持久化与时间戳更新** — 验证更新后字段值正确且 updatedAt 递增
    - **验证需求: 2.1, 2.2**
    - **Property 3: 选择笔记加载正确数据** — 验证 selectedNote 返回完整一致的 Note 对象
    - **验证需求: 2.3**
    - **Property 4: 删除笔记从列表中移除** — 验证列表长度减少且不含已删除 id
    - **验证需求: 3.2, 3.3**
    - **Property 5: 笔记列表按修改时间降序排列** — 验证 notes 数组排序正确
    - **验证需求: 4.2**

  - [x] 2.4 实现 noteStorage 模块和 useNotes Hook，使所有测试通过
    - 实现 `app/lib/noteStorage.ts`：saveNotes（JSON 序列化写入 localStorage）、loadNotes（读取反序列化 + 数据验证 + 错误处理）
    - 实现 `app/lib/useNotes.ts`：管理 notes 状态、selectedNoteId，提供 createNote/updateNote/deleteNote/selectNote 方法，启动时从 localStorage 加载，变更时同步保存
    - _需求: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.2, 3.3, 4.2, 5.1, 5.2, 5.3, 5.4_

- [ ] 3. 检查点 — 确保数据层测试全部通过
  - 确保所有测试通过，如有问题请询问用户。

- [ ] 4. UI 层：组件与主页面（TDD）
  - [ ] 4.1 编写所有组件的测试
    - 编写 `__tests__/components/ConfirmDialog.test.tsx`：测试 isOpen 控制渲染、确认/取消回调触发
    - 编写 `__tests__/components/NoteList.test.tsx`：测试笔记列表渲染（标题+时间）、空列表显示"暂无笔记"、新建按钮回调、删除按钮弹出确认对话框、选中高亮
    - 编写 `__tests__/components/NoteEditor.test.tsx`：测试无选中笔记时显示占位提示、编辑标题/内容触发 onUpdateNote 回调
    - _需求: 3.1, 4.1, 4.2, 4.3, 6.1_

  - [ ] 4.2 实现所有组件和主页面，使所有测试通过
    - 实现 `app/components/ConfirmDialog.tsx` + `ConfirmDialog.module.css`：模态确认对话框
    - 实现 `app/components/NoteList.tsx` + `NoteList.module.css`：笔记列表（标题+修改时间、空列表提示、新建/删除按钮、选中状态）
    - 实现 `app/components/NoteEditor.tsx` + `NoteEditor.module.css`：笔记编辑器（标题输入框+内容文本域、占位提示）
    - 实现 `app/page.tsx` + `page.module.css`：主页面，组合 useNotes Hook 和所有组件，左右分栏布局（窄屏上下堆叠）
    - 更新 `app/layout.tsx`：设置页面标题和基础样式
    - _需求: 1.1, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 6.1, 6.2, 6.3_

- [ ] 5. 最终检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的子任务为可选任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号以确保可追溯性
- 属性测试使用 fast-check 库，配合 Vitest 运行，每个属性至少 100 次迭代
- 所有代码使用 TypeScript 编写
