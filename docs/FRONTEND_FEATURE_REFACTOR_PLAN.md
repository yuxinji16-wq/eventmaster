# 前端 Feature 化重构计划

## 背景

当前前端的一级目录拆分基本合理，已经按 `pages`、`components`、`services`、`types`、`shared`、`utils`、`hooks` 等职责组织。但业务模块内部拆分不足，部分文件已经承担了页面、表格、弹窗、业务计算、API 编排等多种职责。

当前高风险文件如下：

| 文件 | 行数 | 风险 |
| --- | ---: | --- |
| `frontend/src/pages/ActivityDetail.tsx` | 2544 | 严重 |
| `frontend/src/components/activity/ActivityManager.tsx` | 2120 | 严重 |
| `frontend/src/utils/hooks.ts` | 1329 | 严重 |
| `frontend/src/components/material/MaterialManager.tsx` | 972 | 高 |
| `frontend/src/components/opportunity/OpportunityManager.tsx` | 832 | 高 |
| `frontend/src/services/backendApi.ts` | 715 | 中 |
| `frontend/src/pages/OpportunityDetail.tsx` | 670 | 中 |
| `frontend/src/components/supplier/SupplierManager.tsx` | 587 | 中 |

本次重构目标是将前端逐步迁移到 `features/<domain>` 架构，让业务模块拥有自己的 UI、Hook、API、类型、适配器、常量和工具函数，同时避免一次性大规模迁移。

## 架构决策

采用 `features/<domain>` 作为目标架构，但按 3 个阶段渐进实施。

该方案兼顾两点：

- 长期上，让活动、物料、商机、供应商、预算、复盘等业务域具备清晰边界。
- 短期上，保留兼容出口和 wrapper，降低 import 改动、测试 mock 改动和路由迁移风险。

## 目标目录结构

```text
frontend/src/
  app/
    App.tsx
  features/
    activity/
      pages/
      components/
      detail/
      modals/
      rows/
      hooks/
      api/
      types.ts
      adapters.ts
      constants.ts
      utils.ts
      index.ts
    material/
    opportunity/
    supplier/
    budget/
    review/
    dashboard/
  shared/
    components/
    hooks/
    api/
      http.ts
    utils/
  components/
    layout/
    search/
  services/
    backendApi.ts
  utils/
    hooks.ts
  types/
    index.tsx
```

`components/layout` 和 `components/search` 暂时保留在原位置。它们不是业务域，不需要混入第一轮重构。后续如有明确收益，可迁移到 `shared/layout` 和 `shared/search`。

## 重构原则

- 结构迁移期间保持业务行为不变。
- 先移动和拆分现有代码，避免同时修改业务逻辑。
- 保留旧 import 路径的临时兼容出口。
- 每个阶段结束后必须可构建、可测试。
- 优先让业务逻辑归属到 feature 内部，减少全局聚合文件继续膨胀。
- `shared/api/http.ts` 不依赖任何 feature，避免循环依赖。
- 不过早拆全局类型，类型收敛放到最后阶段。
- 行数是风险指标，不是机械验收标准；更重要的是职责边界是否清楚。

## 实施约束

- Phase 1 可以包含多个提交，但仍作为一个可评审里程碑交付。
- Phase 1 内部执行顺序固定为：先拆活动详情页，再拆活动列表页，最后只做必要的活动入口和 wrapper 调整。
- Phase 1 不强制迁移完整数据层；activity 相关 Hook/API 可以先继续通过旧入口使用，避免页面拆分和数据层迁移互相放大风险。
- 不为了压缩行数而过度拆小组件。`ActivityDetailPage.tsx` 和 `ActivityListPage.tsx` 的行数目标只作为参考。
- 兼容 wrapper 必须在 Phase 3 输出清单，并逐个决定删除或明确保留。
- 测试命令以 `frontend/package.json` 为准：`npm run build`、`npm run test`、`npm run test:e2e`。

## Phase 1：建立 `features/activity`

### 范围

新建 `frontend/src/features/activity`，用活动模块作为 feature 架构样板。

优先拆分：

- `frontend/src/pages/ActivityDetail.tsx`
- `frontend/src/components/activity/ActivityManager.tsx`

Phase 1 不要求完整拆分 `utils/hooks.ts` 和 `backendApi.ts`。如果活动页面拆分过程中需要建立 `features/activity/hooks` 或 `features/activity/api`，只迁移必要的 activity 代码；其余数据层迁移留到 Phase 2。

### 目标结构

```text
features/activity/
  pages/
    ActivityListPage.tsx
    ActivityDetailPage.tsx
  components/
    ActivityToolbar.tsx
    ActivityCardGrid.tsx
    ActivityCard.tsx
    ActivityCalendar.tsx
    ActivityFilters.tsx
    StageProgressBar.tsx
    RiskAlert.tsx
    StatCard.tsx
  detail/
    ProgressTab.tsx
    BudgetTab.tsx
    SupplierTab.tsx
    MaterialTab.tsx
    OpportunityTab.tsx
    ReviewTab.tsx
    StatusPanel.tsx
  modals/
    ActivityFormModal.tsx
    TaskModal.tsx
    TaskImportModal.tsx
    ExpenseModal.tsx
    SupplierModal.tsx
    MaterialModal.tsx
    OpportunityModal.tsx
    ReviewEditModal.tsx
    AddTaskModal.tsx
    AddEvaluationModal.tsx
  rows/
    TaskRow.tsx
    SupplierRow.tsx
    MaterialRow.tsx
    OpportunityRow.tsx
    ExpenseRow.tsx
  hooks/
    useActivitiesData.ts
    useActivityTasks.ts
    useActivityDetail.ts
  api/
    activityApi.ts
    taskApi.ts
  types.ts
  adapters.ts
  constants.ts
  utils.ts
  index.ts
```

### 执行顺序

1. 拆 `ActivityDetail.tsx`
   - `ActivityDetailPage.tsx` 只保留路由参数、页面级状态、数据编排和 Tab/Modal 组合。
   - `ProgressTab`、`BudgetTab`、`SupplierTab`、`MaterialTab`、`OpportunityTab`、`ReviewTab` 移到 `features/activity/detail`。
   - `TaskModal`、`TaskImportModal`、`ExpenseModal`、`SupplierModal`、`MaterialModal`、`OpportunityModal` 移到 `features/activity/modals`。
   - `TaskRow`、`SupplierRow`、`MaterialRow`、`OpportunityRow`、`ExpenseRow` 移到 `features/activity/rows`。
   - `calculateRiskLevel`、`getStatusSummary`、`formatCurrency`、颜色映射等纯函数移到 `utils.ts` 或 `constants.ts`。

2. 拆 `ActivityManager.tsx`
   - 迁移为 `ActivityListPage.tsx`。
   - 拆出筛选器、工具栏、活动卡片、卡片列表、日历视图和活动表单弹窗。
   - 检查文件内的 `ActivityDetailView`。如果它已经被独立详情页替代，删除重复实现；如仍有可复用价值，只迁移可复用片段。
   - 合并两个文件里重复或相似的 `TaskImportModal` 实现。

3. 调整入口
   - `App.tsx` 的 lazy import 改为指向 `features/activity/pages`。
   - 原路径保留薄 wrapper，降低测试和旧 import 的迁移风险。

示例 wrapper：

```tsx
// frontend/src/components/activity/ActivityManager.tsx
export { default } from '../../features/activity/pages/ActivityListPage';
```

```tsx
// frontend/src/pages/ActivityDetail.tsx
export { default } from '../features/activity/pages/ActivityDetailPage';
```

### 测试要求

优先运行活动相关测试，再运行受影响场景测试：

- `ActivityDetail.interaction.test.tsx`
- `activity.test.ts`
- `activity.scenarios.test.tsx`
- 受活动详情影响的 budget、material、opportunity、review 场景测试
- `frontend/tests/e2e/core-flow.spec.ts`

阶段验收前至少运行：

```bash
cd frontend
npm run test
```

如需验证核心端到端流程：

```bash
cd frontend
npm run test:e2e
```

### 验收标准

- 不再存在 2000 行级活动文件。
- `ActivityDetailPage.tsx` 主要承担 orchestration，不再承载大量 Tab、Modal、Row 的 JSX 细节。
- `ActivityListPage.tsx` 主要承担列表页编排，不再混入详情视图实现。
- 活动列表、活动详情、Tab 切换、任务导入、任务完成、预算录入、复盘入口行为不变。
- 活动相关 Vitest 测试通过。
- 核心 Playwright 流程通过；若环境缺浏览器或服务依赖，需要记录明确阻塞。

## Phase 2：迁移数据层和中等体量业务模块

### 范围

拆分横向膨胀的数据层文件，并迁移中等体量业务模块：

- `frontend/src/utils/hooks.ts`
- `frontend/src/services/backendApi.ts`
- `frontend/src/components/material/MaterialManager.tsx`
- `frontend/src/components/opportunity/OpportunityManager.tsx`
- `frontend/src/pages/OpportunityDetail.tsx`
- `frontend/src/components/supplier/SupplierManager.tsx`

### 数据层目标

```text
shared/api/http.ts

features/activity/api/activityApi.ts
features/activity/api/taskApi.ts
features/activity/hooks/useActivitiesData.ts
features/activity/hooks/useActivityTasks.ts
features/activity/adapters.ts

features/material/api/materialApi.ts
features/material/hooks/useMaterialsData.ts
features/material/adapters.ts

features/opportunity/api/opportunityApi.ts
features/opportunity/hooks/useLeadsData.ts
features/opportunity/hooks/useOpportunitiesData.ts
features/opportunity/adapters.ts

features/supplier/api/supplierApi.ts
features/supplier/hooks/useSuppliersData.ts
features/supplier/adapters.ts

features/budget/api/budgetApi.ts
features/budget/hooks/useBudgetData.ts
features/budget/adapters.ts

features/review/api/reviewApi.ts
features/review/hooks/useReviewsData.ts
features/review/hooks/useReviewData.ts
features/review/adapters.ts

features/dashboard/api/dashboardApi.ts
```

保留兼容出口：

```ts
// frontend/src/services/backendApi.ts
export * from '../shared/api/http';
export * from '../features/activity/api/activityApi';
export * from '../features/activity/api/taskApi';
export * from '../features/material/api/materialApi';
export * from '../features/supplier/api/supplierApi';
export * from '../features/opportunity/api/opportunityApi';
export * from '../features/budget/api/budgetApi';
export * from '../features/review/api/reviewApi';
export * from '../features/dashboard/api/dashboardApi';
```

```ts
// frontend/src/utils/hooks.ts
export * from '../features/activity/hooks/useActivitiesData';
export * from '../features/activity/hooks/useActivityTasks';
export * from '../features/material/hooks/useMaterialsData';
export * from '../features/supplier/hooks/useSuppliersData';
export * from '../features/opportunity/hooks/useLeadsData';
export * from '../features/opportunity/hooks/useOpportunitiesData';
export * from '../features/budget/hooks/useBudgetData';
export * from '../features/review/hooks/useReviewsData';
export * from '../features/review/hooks/useReviewData';
```

### 物料模块目标

```text
features/material/
  pages/
    MaterialListPage.tsx
    MaterialDetailPage.tsx
  components/
    MaterialToolbar.tsx
    MaterialCategorySection.tsx
    MaterialStockTable.tsx
    MaterialUsageView.tsx
    MaterialDetailView.tsx
    StatusBadge.tsx
  modals/
    WarehousingModal.tsx
    WithdrawModal.tsx
    LogsModal.tsx
    WithdrawalInquiryModal.tsx
  hooks/
    useMaterialsData.ts
  api/
    materialApi.ts
  types.ts
  adapters.ts
  constants.ts
  utils.ts
```

### 商机模块目标

```text
features/opportunity/
  pages/
    OpportunityListPage.tsx
    OpportunityDetailPage.tsx
  components/
    OpportunityToolbar.tsx
    OpportunityStats.tsx
    OpportunityTable.tsx
    OpportunityRow.tsx
  detail/
    OpportunityHeader.tsx
    BasicInfoCard.tsx
    SalesEvaluationCard.tsx
    ConversionCard.tsx
    Timeline.tsx
  modals/
    LeadFormModal.tsx
    BasicInfoModal.tsx
    StatusModal.tsx
    EvaluationModal.tsx
    ConversionModal.tsx
  hooks/
    useLeadsData.ts
    useOpportunitiesData.ts
  api/
    opportunityApi.ts
  types.ts
  adapters.ts
  constants.ts
  utils.ts
```

### 供应商模块目标

```text
features/supplier/
  pages/
    SupplierListPage.tsx
    SupplierDetailPage.tsx
  components/
    SupplierToolbar.tsx
    SupplierTable.tsx
    SupplierCard.tsx
  modals/
    SupplierFormModal.tsx
  hooks/
    useSuppliersData.ts
  api/
    supplierApi.ts
  types.ts
  adapters.ts
  constants.ts
```

### 测试要求

运行模块测试和场景测试：

- `backendApi.test.ts`
- `authApi.test.ts`
- `material.test.ts`
- `opportunity.test.ts`
- `supplier.test.ts`
- 相关 `*.interaction.test.tsx`
- `material.scenarios.test.tsx`
- `opportunity.scenarios.test.tsx`
- `supplier.scenarios.test.tsx`
- `budget.scenarios.test.tsx`
- `review.scenarios.test.tsx`

兼容出口完成后运行全量 Vitest：

```bash
cd frontend
npm run test
```

### 验收标准

- `utils/hooks.ts` 不再包含具体 Hook 实现，只做 re-export。
- `backendApi.ts` 不再包含具体 request 或业务 API 实现，只做 re-export。
- `MaterialManager.tsx`、`OpportunityManager.tsx`、`SupplierManager.tsx` 不再作为真实实现文件，或仅保留薄 wrapper。
- 不再有超过 700 行的业务组件文件。
- 物料、商机、供应商、预算、复盘主场景测试通过。

## Phase 3：收敛类型、shared 和测试路径

### 范围

在 feature 模块稳定后，清理全局聚合和临时兼容路径。

主要处理：

- `frontend/src/types/index.tsx`
- `frontend/src/shared`
- 仍然 mock `utils/hooks` 的测试
- `pages` 和 `components/<domain>` 下的旧 wrapper

### 类型目标

```text
features/activity/types.ts
features/material/types.ts
features/opportunity/types.ts
features/supplier/types.ts
features/budget/types.ts
features/review/types.ts
shared/types.ts
```

规则：

- 业务类型进入对应 feature。
- 跨业务基础类型进入 `shared/types.ts`。
- API 类型靠近对应 feature 的 API 或类型文件，并明确区分 `ApiActivity` 和 `Activity` 这类后端类型与前端内部类型。
- `types/index.tsx` 可短期 re-export，但不应继续作为所有业务类型的集中堆积点。

### shared 目标

```text
shared/
  components/
    AsyncState.tsx
    ErrorBoundary.tsx
    Toast.tsx
    NotificationCenter.tsx
  hooks/
    useDebounce.ts
    useErrorHandler.ts
  api/
    http.ts
  utils/
    storage.ts
```

`components/layout` 和 `components/search` 可以继续保留，除非迁移收益明确。

### 测试清理

- 将测试 mock 从 `../../utils/hooks` 逐步改为对应 feature hook 路径。
- 场景测试可以继续放在 `src/tests/scenarios`，不强制迁移。
- 组件交互测试可以继续与组件就近放置，保持现有风格。
- E2E 测试只验证用户路径不变，不关心内部 import 路径。

### Wrapper 清理

Phase 3 必须产出 wrapper 清单：

| 旧路径 | 当前指向 | 决策 | 理由 |
| --- | --- | --- | --- |
| `pages/ActivityDetail.tsx` | `features/activity/pages/ActivityDetailPage.tsx` | 删除 / 保留 | 待评审 |
| `components/activity/ActivityManager.tsx` | `features/activity/pages/ActivityListPage.tsx` | 删除 / 保留 | 待评审 |
| `services/backendApi.ts` | feature API re-export | 删除 / 保留 | 待评审 |
| `utils/hooks.ts` | feature hooks re-export | 删除 / 保留 | 待评审 |
| `types/index.tsx` | feature/shared types re-export | 删除 / 保留 | 待评审 |

保留 wrapper 的前提是它有明确兼容价值；否则应删除，避免新旧结构长期并行。

### 验收标准

- `types/index.tsx` 不再是所有业务类型的增长点。
- 测试不再主要依赖 `utils/hooks` 作为 mock 边界。
- 临时 wrapper 已删除，或有明确保留理由。
- 全量 Vitest 通过。
- 核心 Playwright 流程通过；若环境阻塞，需要记录原因。

## 总体验证命令

每个阶段至少运行：

```bash
cd frontend
npm run test
```

重构完成前必须运行：

```bash
cd frontend
npm run build
npm run test
npm run test:e2e
```

如果 Playwright 依赖的浏览器、服务或环境不可用，需要记录：

- 未执行的命令
- 失败原因
- 是否属于环境问题
- 已完成的替代验证

## 风险与控制

| 风险 | 控制方式 |
| --- | --- |
| 活动详情迁移导致 props 和状态传递混乱 | 先按现有局部组件边界移动代码，不顺手改业务逻辑 |
| `utils/hooks.ts` 被大量测试 mock | Phase 2 保留 re-export，Phase 3 再更新 mock 路径 |
| API 拆分后出现循环依赖 | `shared/api/http.ts` 不依赖任何 feature |
| 类型拆分过早扩大改动面 | 类型收敛放到 Phase 3 |
| 旧 wrapper 长期存在 | Phase 3 输出 wrapper 清单并逐个评审 |
| 行数目标导致过度拆分 | 行数只作为风险指标，以职责清晰为核心验收口径 |
| 重构中混入行为变更 | 每阶段运行交互测试、场景测试、构建和 E2E 核心流程 |

## 评审建议

建议批准该 3 阶段计划，但 Phase 1 必须作为试点独立评审。

Phase 1 的评审重点：

- `features/activity` 是否形成清晰、可复用的业务域结构。
- `ActivityDetailPage.tsx` 和 `ActivityListPage.tsx` 是否变成页面编排文件，而不是继续承载大量 JSX 细节。
- Tab、Modal、Row、utils、constants 的职责边界是否清楚。
- 旧路径是否通过薄 wrapper 保持兼容。
- 活动核心行为和测试是否保持稳定。

Phase 1 通过后，Phase 2 应主要是将同样结构机械迁移到物料、商机、供应商和数据层。
