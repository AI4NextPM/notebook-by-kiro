# 需求文档

## 简介

一个基于 Next.js 的简单记事本单页应用（SPA）。用户可以创建、编辑、删除笔记，所有数据保存在浏览器的 Local Storage 中，无需后端数据库。应用从最简设计出发，聚焦核心功能。

## 术语表

- **Notepad_App**: 基于 Next.js 的记事本单页应用
- **Note**: 一条笔记记录，包含标题和内容
- **Note_List**: 笔记列表视图，展示所有已保存的笔记
- **Note_Editor**: 笔记编辑区域，用于创建或修改笔记内容
- **Local_Storage**: 浏览器提供的本地存储 API，用于持久化笔记数据

## 需求

### 需求 1：创建笔记

**用户故事：** 作为用户，我想要创建新的笔记，以便记录我的想法和信息。

#### 验收标准

1. WHEN 用户点击"新建笔记"按钮, THE Notepad_App SHALL 创建一条包含空标题和空内容的新 Note，并在 Note_Editor 中打开该 Note
2. THE Notepad_App SHALL 为每条新创建的 Note 生成一个唯一标识符（UUID）
3. THE Notepad_App SHALL 为每条新创建的 Note 记录创建时间戳

### 需求 2：编辑笔记

**用户故事：** 作为用户，我想要编辑已有的笔记，以便更新或完善我的记录。

#### 验收标准

1. WHEN 用户在 Note_Editor 中修改 Note 的标题或内容, THE Notepad_App SHALL 将修改后的数据保存到 Local_Storage
2. THE Notepad_App SHALL 为每次编辑操作更新 Note 的最后修改时间戳
3. WHEN 用户从 Note_List 中选择一条 Note, THE Notepad_App SHALL 在 Note_Editor 中加载并显示该 Note 的标题和内容

### 需求 3：删除笔记

**用户故事：** 作为用户，我想要删除不再需要的笔记，以便保持笔记列表整洁。

#### 验收标准

1. WHEN 用户点击某条 Note 的删除按钮, THE Notepad_App SHALL 显示确认对话框
2. WHEN 用户确认删除操作, THE Notepad_App SHALL 从 Local_Storage 中移除该 Note 并从 Note_List 中移除该条目
3. IF 被删除的 Note 正在 Note_Editor 中打开, THEN THE Notepad_App SHALL 清空 Note_Editor 的内容

### 需求 4：笔记列表展示

**用户故事：** 作为用户，我想要查看所有笔记的列表，以便快速找到和管理我的笔记。

#### 验收标准

1. THE Note_List SHALL 显示每条 Note 的标题和最后修改时间戳
2. THE Note_List SHALL 按最后修改时间戳降序排列所有 Note（最新修改的排在最前）
3. WHILE Note_List 中没有任何 Note, THE Notepad_App SHALL 显示"暂无笔记"的提示信息

### 需求 5：数据持久化

**用户故事：** 作为用户，我想要笔记数据在关闭浏览器后仍然保留，以便下次打开时继续使用。

#### 验收标准

1. THE Notepad_App SHALL 将所有 Note 数据以 JSON 格式序列化后存储到 Local_Storage
2. WHEN Notepad_App 启动时, THE Notepad_App SHALL 从 Local_Storage 读取并反序列化 JSON 数据以恢复所有 Note
3. FOR ALL 有效的 Note 数据, 序列化后再反序列化 SHALL 产生与原始数据等价的 Note 对象（往返一致性）
4. IF Local_Storage 中的数据格式无效或损坏, THEN THE Notepad_App SHALL 将 Note_List 初始化为空列表并在控制台记录错误信息

### 需求 6：页面布局

**用户故事：** 作为用户，我想要一个简洁直观的界面布局，以便高效地管理和编辑笔记。

#### 验收标准

1. THE Notepad_App SHALL 采用左右分栏布局：左侧为 Note_List，右侧为 Note_Editor
2. THE Notepad_App SHALL 使用响应式设计，在窄屏设备上将 Note_List 和 Note_Editor 切换为上下堆叠布局
3. THE Notepad_App SHALL 作为 Next.js 单页面应用运行，所有交互在同一页面内完成，无需页面跳转
