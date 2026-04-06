# EventMaster Pro 任务列表 (TASKS.md)

## 1. 任务状态总览

| 类别 | 总数 | 已完成 | 进行中 | 待开始 |
|------|------|--------|--------|--------|
| 前端架构 | 8 | 8 | 0 | 0 |
| 详情页拆分 | 5 | 5 | 0 | 0 |
| 样式规范 | 4 | 4 | 0 | 0 |
| 文档完善 | 6 | 6 | 0 | 0 |

---

## 2. 前端架构任务

| Task ID | 任务 | 状态 | 备注 |
|---------|------|------|------|
| ARCH-001 | React Router v6 路由配置 | ✅ 已完成 | `src/utils/routes.ts` |
| ARCH-002 | Layout 布局组件 | ✅ 已完成 | 侧边栏 + 主内容区 |
| ARCH-003 | 共享组件库 | ✅ 已完成 | `shared/index.tsx` |
| ARCH-004 | 路由配置文件 | ✅ 已完成 | 统一管理所有路由 |
| ARCH-005 | Dashboard 迁移到 pages | ✅ 已完成 | `pages/Dashboard.tsx` |
| ARCH-006 | App.tsx 路由集成 | ✅ 已完成 | 使用 Routes 常量 |
| ARCH-007 | 组件目录结构整理 | ✅ 已完成 | pages + components |
| ARCH-008 | 常量定义统一 | ✅ 已完成 | NAV_ITEMS 等 |

---

## 3. 详情页拆分任务

| Task ID | 详情页 | 源组件 | 状态 |
|---------|--------|--------|------|
| DETAIL-001 | ActivityDetail | ActivityManager | ✅ 已完成 |
| DETAIL-002 | MaterialDetail | MaterialManager | ✅ 已完成 |
| DETAIL-003 | SupplierDetail | SupplierManager | ✅ 已完成 |
| DETAIL-004 | OpportunityDetail | OpportunityManager | ✅ 已完成 |
| DETAIL-005 | ReviewDetail | ReviewCenter | ✅ 已完成 |

---

## 4. 样式规范任务

| Task ID | 任务 | 状态 | 备注 |
|---------|------|------|------|
| STYLE-001 | 圆角系统定义 | ✅ 已完成 | rounded-sm/md/lg/xl/2xl/full |
| STYLE-002 | 阴影系统定义 | ✅ 已完成 | shadow-sm/md/lg/xl |
| STYLE-003 | 动画过渡定义 | ✅ 已完成 | duration-fast/normal/slow |
| STYLE-004 | 共享 Modal 组件 | ✅ 已完成 | `shared/Modal` |

---

## 5. 文档完善任务

| Task ID | 文档 | 状态 | 备注 |
|---------|------|------|------|
| DOC-001 | CLAUDE.md | ✅ 已完成 | 项目协作规范 |
| DOC-002 | frontend/README.md | ✅ 已完成 | 前端项目文档 |
| DOC-003 | docs/SPEC.md | ✅ 已完成 | 产品规格说明书 |
| DOC-004 | docs/DESIGN.md | ✅ 已完成 | 技术方案设计 |
| DOC-005 | docs/PROGRESS.md | ✅ 已完成 | 进度管理 |
| DOC-006 | docs/TASKS.md | ✅ 已完成 | 任务列表 |

---

## 6. 待完善任务

| Task ID | 任务 | 优先级 | 备注 |
|---------|------|--------|------|
| TODO-001 | BudgetManager 详情页抽取 | P2 | 目前使用内部 viewMode 切换 |
| TODO-002 | 详情页使用共享样式组件 | P3 | 渐进式优化 |
| TODO-003 | 后端 API 接入 | P1 | FastAPI 实现 |

---

## 7. 文件清理记录

| 文件 | 操作 | 日期 |
|------|------|------|
| `src/services/api.ts` | 已删除 | 2026-04-06 |
| `src/services/http.ts` | 已删除 | 2026-04-06 |
| `开发文档.md` | 已删除 | 2026-04-06 |

---

## 8. 验收标准

### 8.1 架构验收
- [x] 路由跳转正常，URL 变化
- [x] 详情页独立可访问（刷新保持）
- [x] 返回按钮正常工作
- [x] 构建通过无报错

### 8.2 样式验收
- [x] 圆角使用统一规范
- [x] 阴影层级清晰
- [x] 动画过渡流畅
- [x] 详情页铺满可用宽度

### 8.3 文档验收
- [x] CLAUDE.md 与代码一致
- [x] 前端 README 准确
- [x] SPEC/DESIGN 反映当前架构
- [x] 无过期文档引用
