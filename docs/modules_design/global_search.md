# 全局搜索模块设计文档

## 模块概述

全局搜索模块（GlobalSearch）为 EventMaster Pro 提供统一的快速检索功能，支持同时搜索活动、物料、供应商和商机，点击结果可直接跳转到对应详情页。

## 目录结构

```
src/components/search/
├── index.ts              # 统一导出，外部只引用此文件
├── GlobalSearch.tsx      # 搜索框组件（输入框 + 下拉组合）
├── SearchDropdown.tsx    # 下拉结果列表（可复用）
├── SearchResultItem.tsx  # 单条结果组件
└── types.ts              # 类型定义

src/hooks/
└── useDebounce.ts        # 防抖 Hook（独立工具）

src/services/
└── globalSearchApi.ts    # 搜索 API 服务（独立）
```

## 设计原则

1. **组件独立**：`GlobalSearch` 是完全自包含的组件，不依赖 Layout，可单独使用
2. **组合模式**：`GlobalSearch` → `SearchDropdown` → `SearchResultItem`
3. **API 分离**：搜索逻辑与组件完全解耦
4. **单点导出**：`index.ts` 提供统一导出，外部只引用此文件

## 组件说明

### GlobalSearch

主搜索组件，包含输入框和下拉结果的组合。

**Props:**
| 属性 | 类型 | 说明 |
|------|------|------|
| className | string | 自定义样式类 |

**功能特性:**
- 300ms 防抖延迟
- 支持键盘导航（上下箭头、Enter 跳转、Escape 关闭）
- 点击外部自动关闭
- 空结果时显示提示

### SearchDropdown

下拉结果列表组件，按模块分组展示搜索结果。

**Props:**
| 属性 | 类型 | 说明 |
|------|------|------|
| result | SearchResult \| null | 搜索结果 |
| isLoading | boolean | 加载状态 |
| activeIndex | number | 当前高亮的索引 |
| allItems | SearchResultItem[] | 所有扁平化的结果项 |
| onItemClick | (item) => void | 点击回调 |

### SearchResultItem

单条搜索结果组件。

**Props:**
| 属性 | 类型 | 说明 |
|------|------|------|
| item | SearchResultItem | 结果项数据 |
| isActive | boolean | 是否高亮 |
| onClick | () => void | 点击回调 |
| onMouseEnter | () => void | 鼠标进入回调 |

## API 设计

### globalSearch(keyword: string)

并行调用多个模块的搜索 API，聚合结果。

```typescript
import { globalSearch } from '../../services/globalSearchApi';

const result = await globalSearch('发布会');
// 返回 { activities, materials, suppliers, opportunities }
```

### 后端 API 支持

| 模块 | API 端点 | 参数 |
|------|----------|------|
| 活动 | GET /api/activities | keyword |
| 物料 | GET /api/materials | keyword |
| 供应商 | GET /api/suppliers | keyword |
| 商机 | GET /api/opportunities | keyword |

## 交互规格

### UI 样式

```
┌─────────────────────────────────────────────────────┐
│ 🔍 键入关键词快速检索...                             │
└─────────────────────────────────────────────────────┘
         ↓ 输入时显示
┌─────────────────────────────────────────────────────┐
│ 活动 (3)                                          ▼│
├─────────────────────────────────────────────────────┤
│ 📅 2024春季新品发布会        2024-03-20  深圳      →│
│ 📅 智能制造行业峰会          2024-04-15  上海      →│
│ 📅 全球科技峰会             2024-05-20  北京      →│
├─────────────────────────────────────────────────────┤
│ 物料 (2)                                          ▼│
├─────────────────────────────────────────────────────┤
│ 📦 品牌易拉宝                库存: 50           →│
│ 📦 宣传手册                  库存: 200          →│
├─────────────────────────────────────────────────────┤
│ 供应商 (1)                                        ▼│
├─────────────────────────────────────────────────────┤
│ 🏢 深圳市印刷集团            ★★★★☆             →│
├─────────────────────────────────────────────────────┤
│ 商机 (2)                                          ▼│
├─────────────────────────────────────────────────────┤
│ 💼 头部金融机构              ¥2,000,000         →│
│ 💼 科技公司采购项目          ¥500,000           →│
└─────────────────────────────────────────────────────┘
```

### 交互规格

| 规格项 | 值 |
|--------|-----|
| Debounce 延迟 | 300ms |
| 最小搜索字符 | 1 个 |
| 每模块最多显示 | 5 条 |
| 下拉框宽度 | 420px |
| 关闭方式 | 点击外部 / Escape |

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| ↑ | 上移高亮 |
| ↓ | 下移高亮 |
| Enter | 跳转到高亮项 |
| Escape | 关闭下拉框 |

## 使用示例

```tsx
import { GlobalSearch } from '../components/search';

// 在 Layout 中使用
<GlobalSearch className="w-64" />

// 在任何页面独立使用
<GlobalSearch />
```

## 相关文件

| 文件路径 | 说明 |
|----------|------|
| src/hooks/useDebounce.ts | 防抖 Hook |
| src/services/globalSearchApi.ts | 全局搜索 API |
| src/components/search/* | 搜索组件模块 |
| src/components/layout/Layout.tsx | 集成搜索组件的布局 |

## 更新记录

| 日期 | 版本 | 修改内容 |
|------|------|----------|
| 2026-04-19 | v1.0 | 初始版本，实现全局搜索功能 |
