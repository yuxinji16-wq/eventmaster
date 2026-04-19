# 批量 Bug 修复分析与方案（2026-04-19）

## 0. 本次实际修复归类与防复发方案

本次问题按根因归为六类，并按同一治理方式修复：

1. **缺少统一事实源**：预算费用、物料领用、供应商账单/评价、商机操作记录原本散落在组件本地 state 或演示数据中。已补齐后端模型字段、查询接口和前端适配器，仓库页/详情页统一读持久化数据。
2. **跨模块关联键缺失**：物料领用缺少 `activity_id`，预算流水和活动实支没有稳定同步，复盘匹配存在数字/字符串 ID 不一致。已补齐关联字段、按活动查询接口，并在前端边界做 ID 归一化。
3. **前后端契约漂移**：预算金额、商机状态、供应商账单状态、供应商评价人字段在模型、schema、API type、表单和列表之间不一致。已统一字段链路，并保留旧接口返回形状兼容现有测试。
4. **派生数据多处手工维护**：活动实际支出、活动卡片任务摘要、供应商合作笔数、预算仓库行业统计原本存在假数据或局部计算。已改为后端聚合或从持久化流水派生。
5. **路由/视图上下文问题**：供应商静态账单路由被动态 `/{supplier_id}` 遮蔽，活动详情返回丢失年份上下文。已调整路由顺序，并用 URL query 保持当前年份视图。
6. **状态缺少审计日志**：商机状态修改没有进入操作记录。已新增商机操作日志表，创建和状态变更会追加记录，详情页读取真实日志。

防复发规则已固化为本地 Codex skill：`C:\Users\TR\.codex\skills\cross-module-data-sync`。后续遇到“详情页改了但列表/仓库/仪表盘不同步、刷新丢失、状态不一致、演示数据混入正式视图”等问题时，应先按该 skill 的六类根因分类，再按“模型/schema/接口/API type/adapter/表单/列表/详情/仓库/测试”全链路修复。

本轮验证结果：

- `frontend`: `npm run build` 通过。
- `backend`: `python -m pytest -q` 通过，159 passed。

## 1. 范围与结论

本次分析覆盖用户反馈的活动管理、物料仓库、供应商库、预算仓库、商机转化、复盘中心问题。当前主要根因集中在四类：

1. 跨模块数据没有统一事实源。活动详情页、预算仓库、物料仓库、供应商库、商机转化分别维护了局部 state 或不同 API 数据源，新增后只刷新当前组件，其他模块无法同步。
2. 前后端契约不一致。部分前端字段没有后端模型字段承接，或者前端读取的响应结构与后端实际返回不一致。
3. 一些功能仍是演示态实现。物料详情动态日志、供应商合作笔数、活动详情供应商关联、预算费用拆分等存在本地临时数据或硬编码展示。
4. 缺少关联表或业务流水表。活动-物料领用、活动-供应商关联、行业预算额度、商机操作记录等没有完整持久化模型。

建议按 P0-P3 分批修复：

- P0：修复数据丢失、搜索报错、状态不一致、金额显示错误。
- P1：补齐跨模块同步，统一活动详情页与仓库页、预算页的数据源。
- P2：补齐图片、归还、操作记录、行业预算等新能力。
- P3：清理演示数据、补测试和契约文档。

## 2. 活动管理

### 2.1 活动详情新增执行任务未在卡片页同步显示

现象：
- 在 `ActivityDetail` 的执行进度 tab 新增任务后，详情页可以看到任务，但返回活动卡片页不显示执行任务摘要。

根因：
- 详情页任务通过 `tasksApi` 持久化到后端 `tasks` 表，相关代码在 `frontend/src/pages/ActivityDetail.tsx` 的 `handleSaveTask`、`handleImportTasks`。
- 活动列表页 `ActivityManager` 只通过 `useActivitiesData()` 加载 `activities` 主表，不读取 `tasksApi.getByActivity()`，卡片中的执行进度区域也存在被 `false ? (...) : (...)` 禁用的任务摘要逻辑。
- `Activity` 主模型不包含任务摘要字段，`adaptActivity()` 也不会带出任务数据。

修复方案：
- 后端新增活动任务摘要接口，推荐 `/api/activities/summary/with-tasks` 或在活动列表接口增加可选 `include_task_summary=true`，返回 `task_count`、`completed_task_count`、`overdue_task_count`、`next_due_date`。
- 前端 `ActivityManager` 读取任务摘要并恢复卡片执行进度展示。
- 新增任务后返回列表时触发列表刷新，或者通过路由 state 标记需要刷新当前活动摘要。

验证点：
- 新增、编辑、完成、删除任务后，活动卡片页任务数量和进度同步变化。
- 刷新页面后卡片页仍显示真实任务摘要。

### 2.2 预算 tab 费用明细金额为 0，且不同步预算仓库费用拆分和状态

现象：
- 活动详情预算 tab 新增费用明细时，填写了预算金额但条目显示为 0。
- 费用明细不进入预算仓库的费用拆分。
- 状态修改后不同步。

根因：
- `ExpenseModal` 有 `plannedAmount` 和 `actualAmount` 两个字段，但 `handleSaveExpense()` 创建 `BudgetLog` 时只写 `amount: data.actualAmount || data.plannedAmount || 0`，读取时又固定 `plannedAmount: 0`。
- 活动详情页使用的是 `budget_logs`，预算仓库“费用拆分”使用的是组件本地 `budgetItems`，并未调用后端 `BudgetItem` API。
- `backendApi.ts` 有 `budgetApi.updateLog()`，但后端 `backend/app/routers/budget.py` 没有 `PUT /budget/logs/{log_id}`，只有 `DELETE /logs/{log_id}`，导致状态更新缺少真实后端路径。
- 预算仓库的 `handleSaveBudgetItem()` 只写本地 `budgetItems` state，刷新后丢失，也不会被活动详情读取。

修复方案：
- 统一费用事实源：建议用 `BudgetLog` 作为活动费用流水，用 `BudgetItem` 作为预算拆分结构，两者建立明确关系或统一为一个模型。
- 最小修复：在 `BudgetLog` 增加 `planned_amount` 字段，或者前端不再提供“预算金额”，只保留“实际金额”；如果保留预算金额，则必须保存并读取。
- 后端补齐 `PUT /api/budget/logs/{log_id}`，前端编辑状态时调用该接口。
- 预算仓库费用拆分改为读取 `budgetApi.getLogs(activityId)` 或真正使用 `BudgetItem` 后端接口，不再只用本地 `budgetItems`。
- 新增/编辑/删除费用后，同步更新活动 `actual_spend`，并刷新预算仓库年度概览。

验证点：
- 填写预算金额、实际金额后，活动详情和预算仓库显示一致。
- 修改费用状态后，活动详情、预算仓库详情、刷新页面后都一致。
- 删除费用后 `actual_spend` 回退。

### 2.3 物料 tab 领用明细不显示，仓库只减数量不同步领用明细

现象：
- 活动详情物料 tab 新增领用后，有时当前页可见，有时刷新或进入物料仓库后只看到库存减少，看不到该活动对应的领用明细。

根因：
- 活动详情 `MaterialModal` 调用 `materialsApi.withdraw()` 创建后端 `withdrawal_logs` 并减少库存，但 `WithdrawalLog` 后端模型没有 `activity_id` 字段，无法知道这条领用属于哪个活动。
- 活动详情的 `handleAddMaterial()` 只把领用项写入当前页面本地 `materials` state，刷新后丢失。
- 物料仓库 `MaterialManager` 的 `withdrawalLogs` 初始化为硬编码示例数据，页面领用流水没有从后端 `withdrawal_logs` 加载。
- `MaterialDetail.tsx` 声明了 `warehousingLogs`、`withdrawalLogs`，但只在当前页面操作时本地追加，没有初始化加载后端日志。

修复方案：
- 后端 `WithdrawalLog` 增加 `activity_id`、`status`（领用中/已归还/消耗）、`returned_at`、`return_count` 等字段。
- `materialsApi.withdraw()` 入参增加 `activity_id`，活动详情领用时写入当前活动 ID。
- 新增接口：按活动查询领用记录，例如 `GET /api/materials/withdrawal?activity_id=...`，以及按物料查询全量领用记录。
- 活动详情物料 tab 初始化时从后端加载当前活动的领用记录。
- 物料仓库领用情况查询和物料详情页统一读取后端日志，不再使用硬编码或纯本地 state。

验证点：
- 活动详情领用后，活动详情、物料仓库领用查询、物料详情流水都能看到同一条记录。
- 刷新页面后记录仍存在。
- 库存减少与领用明细一致。

### 2.4 活动详情返回活动列表后未定位当前年份

现象：
- 从某活动详情页点击返回，直接回到全部活动视图，未保留当前年份筛选。

根因：
- `ActivityDetail.tsx` 返回按钮固定 `navigate('/activities')`。
- `ActivityManager` 的 `yearFilter` 是组件本地 state，路由没有 query 参数承载筛选状态。

修复方案：
- 活动列表使用 URL query 管理筛选状态：`/activities?year=2026&view=card&category=...`。
- 从卡片进入详情时带上来源 query：`/activities/:id?fromYear=2026` 或使用 `location.state`。
- 详情页返回时优先回到 `from` 路由，否则根据活动 `year` 返回 `/activities?year=${activity.year}`。

验证点：
- 从 2026 年活动进入详情后返回，仍停留在 2026 年筛选。
- 刷新详情页后返回也能按活动年份定位。

### 2.5 供应商 tab 应管理供应商库中的供应商，而非新增供应商

现象：
- 活动详情供应商 tab 的“新增”当前是创建供应商或手输供应商信息，不符合“从供应商库选择/管理关联供应商”的需求。

根因：
- `SupplierModal` 是新增供应商表单。
- `handleAddSupplier()` 如未找到同名供应商，会直接调用 `suppliersApi.create()` 创建供应商，再添加账单。
- 活动与供应商的关联是通过供应商账单的 `activity_name` 反查，不是正式关联表或稳定 ID 关系。

修复方案：
- 将活动详情供应商 tab 改为“选择供应商库供应商”，弹窗加载 `suppliersApi.getList()`，支持搜索、筛选、选择已有供应商。
- 不在活动详情直接创建供应商；需要新增供应商时跳转供应商库或打开供应商库统一创建流程。
- 后端新增或复用供应商账单时必须通过 `activity_id` 关联，不依赖 `activity_name` 文本匹配。
- 供应商 tab 状态变更应持久化到活动-供应商关联或账单状态。

验证点：
- 活动详情只能从供应商库选择已有供应商。
- 关联后供应商详情账单和活动详情供应商 tab 同步。
- 修改供应商关联状态刷新后不丢失。

### 2.6 活动详情新增商机线索需可点击跳转商机详情

现象：
- 活动详情商机 tab 新增线索后，需要点击该线索直接进入商机转化详情页。

根因：
- `OpportunityTabContent` 当前只展示线索列表，没有给行或卡片绑定 `navigate('/opportunities/:id')`。
- `handleAddOpportunity()` 调用 `addLead()` 但没有等待返回的新商机 ID，也没有跳转或刷新。

修复方案：
- `handleAddOpportunity` 改为 `async`，等待 `addLead()` 返回新线索 ID。
- `OpportunityTabContent` 接收 `onOpenOpportunity(id)`，每条线索点击跳转 `/opportunities/${id}`。
- 新增成功后可选择留在当前 tab 或直接跳转详情页，由产品确认。

验证点：
- 活动详情商机 tab 中每条线索可点击，进入对应商机详情。
- 新增后立即点击也能打开真实后端 ID 的详情。

## 3. 物料仓库

### 3.1 支持上传图片预览

现状：
- `Material` 后端模型没有图片字段。
- 前端物料表单和详情页没有图片上传与预览逻辑。

修复方案：
- 简化方案：`materials` 表增加 `image_url` 字段，前端支持输入 URL 或上传后保存 URL。
- 完整方案：新增文件上传接口 `POST /api/uploads`，返回文件 URL；`Material` 保存 `image_url`。
- 前端物料卡片、详情页、编辑弹窗显示图片预览；上传前使用 `URL.createObjectURL(file)` 做本地预览。

验证点：
- 新建/编辑物料上传图片后，列表和详情页均能显示。
- 刷新页面后图片仍存在。

### 3.2 领用明细未显示在详情页，领用情况查询也没有内容

根因：
- `MaterialDetail.tsx` 未调用后端入库/出库日志接口初始化日志。
- `MaterialDetailView` 里“最近流转记录”仍有硬编码示例数组。
- `MaterialManager` 的 `withdrawalLogs` 是本地示例数据，未通过 `materialsApi.getWithdrawalLogs()` 或按物料接口加载真实数据。
- `backendApi.ts` 声明了 `getWarehousingLogs()`、`getWithdrawalLogs()` 指向 `/materials/warehousing-logs` 和 `/materials/withdrawal-logs`，但后端目前没有这两个全局 GET 路由，只有 `/{material_id}/warehousing` 和 `/{material_id}/withdrawal`。

修复方案：
- 后端补全全局日志查询：`GET /api/materials/warehousing-logs`、`GET /api/materials/withdrawal-logs`，并保证路由顺序在 `/{material_id}` 之前。
- 或前端按物料详情使用 `GET /api/materials/{id}/withdrawal` 和 `GET /api/materials/{id}/warehousing`。
- 移除详情页硬编码日志，统一渲染后端返回日志。

验证点：
- 物料详情页显示真实入库/领用流水。
- 物料仓库“领用情况查询”显示所有真实领用记录。

### 3.3 增加“已归还”选项

现状：
- 后端 `WithdrawalLog` 只有出库记录，没有归还状态。
- 前端状态只有库存充足/预警/缺货，不支持单条领用记录归还。

修复方案：
- `withdrawal_logs` 增加 `status`，候选值：`领用中`、`已归还`、`部分归还`、`已消耗`。
- 增加归还接口：`PATCH /api/materials/withdrawal/{log_id}/return`，参数 `return_count`、`operator`、`returned_at`。
- 归还时库存增加对应数量，领用记录状态更新。
- 前端在领用查询弹窗和物料详情流水中提供“标记已归还/部分归还”操作。

验证点：
- 标记归还后库存恢复。
- 已归还记录不再计入未归还统计。

## 4. 供应商库

### 4.1 新增账单记录状态与输入状态不一致

根因：
- 前端表单选项是 `已结清`、`待结算`。
- 后端 `Bill` 注释和部分逻辑使用 `待付款`、`已付款`、`已结算`。
- `SupplierDetail.tsx` 映射账单时写死 `b.status === '已付款' ? '已结清' : '待结算'`，所以后端保存 `已结清` 也会被前端显示成 `待结算`。

修复方案：
- 统一账单状态枚举。建议统一为产品文案：`待结算`、`已结清`。
- 后端 `BillBase.status`、`mark_paid`、前端表单、前端读取映射全部使用同一枚举。
- 不要在读取时用二元映射吞掉原状态。

验证点：
- 新增 `已结清` 后立即显示 `已结清`。
- 刷新供应商详情后仍显示 `已结清`。

### 4.2 卡片页“合作 5 笔”为虚假数据

根因：
- 供应商卡片显示 `supplier.orderCount`。
- `adaptSupplier()` 使用后端 `order_count` 字段，但该字段不一定由账单真实数量计算。
- 供应商详情账单来自 `bills` 表，卡片合作笔数没有按 `bills.count` 计算。

修复方案：
- 后端供应商列表返回 `bill_count` 或 `order_count` 动态聚合真实账单数量。
- 或前端供应商列表页加载每个供应商账单数量，但不推荐 N+1。
- 移除所有初始化/种子数据中的虚假合作笔数，或明确作为真实样例数据。

验证点：
- 新增/删除账单后，供应商卡片合作笔数同步变化。
- 没有账单的供应商显示 0 笔。

### 4.3 内部复盘留言板新增评价字段错误

现象：
- 需要字段：姓名、评价内容、评分。
- 当前新增评价页面缺少姓名。
- 输入内容如 `222` 后被同时当作评价人和评价内容展示。

根因：
- 后端 `SupplierReview` 没有 `user/name/evaluator_name` 字段，只有 `comments` 和多个评分。
- `SupplierDetail.tsx` 读取评价时将 `user` 映射成 `r.comments || '匿名'`，导致评论内容被当作评价人。
- `SupplierManager.tsx` 新增评价 modal 只有 `content` 和 `rating`。

修复方案：
- 后端 `SupplierReview` 增加 `reviewer_name` 字段，简化创建接口接受 `{ reviewer_name, content, rating }`。
- 前端新增评价 modal 增加“姓名”字段。
- 前端映射改为 `user: r.reviewer_name || '匿名'`，`content: r.comments || ''`。

验证点：
- 新增姓名为张三、内容为 222、评分为 4 后，列表展示评价人张三、内容 222、评分 4。
- 刷新后仍正确。

## 5. 预算仓库

### 5.1 活动陈列区显示行业并支持按行业筛选

根因：
- `BudgetOverview` 表头只有活动名称、类型、预算/实际等，没有行业列。
- `BudgetManager` 筛选使用 `categoryFilter`，按活动类型 `自办活动/外部市场活动` 过滤，没有 `industryFilter`。

修复方案：
- `BudgetOverview` 活动表增加行业列，显示 `activity.industry || '-'`。
- `BudgetManager` 增加 `industryFilter`，选项从年度活动动态提取。
- 筛选条件增加 `industryFilter === '所有行业' || a.industry === industryFilter`。

验证点：
- 活动有行业时预算仓库列表展示行业。
- 按行业筛选后只显示对应行业活动。

### 5.2 月度预算趋势区调整为按行业陈列

根因：
- `monthlyTrend` 当前按 12 个月聚合预算和实际支出。
- 组件标题和图表也是“月度预算趋势”。

修复方案：
- 将趋势数据改为 `industryBudgetStats`，按 `activity.industry || '未分类'` 聚合预算、实际、剩余、执行率。
- 图表改为按行业柱状图或横向条形图。
- 标题改为“行业预算分布”。

验证点：
- 不同行业活动预算在图表中分组显示。
- 新增活动或修改行业后图表同步变化。

### 5.3 预算总额支持总体与行业额度，并按实际费用扣除

根因：
- 后端 `YearlyQuota` 只有 `year` 和 `quota`，不支持行业额度。
- 预算仓库实际支出大多来自 `Activity.actualSpend`，但活动详情新增费用只写 `budget_logs`，没有稳定地回写活动或行业额度扣减。

修复方案：
- 新增预算额度模型：`BudgetQuota`，字段建议为 `year`、`scope_type`（overall/industry）、`industry`、`quota`。
- 总体预算展示所有行业额度和年度总额；行业额度按行业实际费用扣减。
- 实际费用扣减以 `budget_logs` 为事实源，按 `activity_id -> activity.industry` 归集。
- 活动 `actual_spend` 可作为缓存字段，但展示和统计应优先由费用流水聚合。

验证点：
- 设置总体预算和某行业预算后，新增该行业活动费用会扣减该行业剩余额度。
- 总体预算扣减所有行业实际费用总和。

## 6. 商机转化

### 6.1 商机详情修改后未同步前一页，刷新后丢失

根因：
- `OpportunityDetail` 有基础信息、销售评估、转化结果等字段，但后端 `Opportunity` 模型只包含基础字段、来源、区域、owner；没有 `leadLevel`、`evaluationNote`、`transferredToSales`、`transferredAt`、`converted`、`conversionStatus`、`conversionAt`、`resultNote`。
- `useLeadsData.updateLead()` 只把后端支持的字段发送给 `opportunitiesApi.update()`，对上述字段没有持久化。
- 详情页本地 `setOpportunity({ ...opportunity, ...data })` 造成当前页面临时显示成功，刷新后从后端重载就丢失。
- 基础信息中 `contactName` 与后端 `contact_person/contact` 映射不一致，`updateLead()` 也未处理 `contactName`。

修复方案：
- 后端补齐商机详情字段或新增 `OpportunityDetail`/`OpportunityStageLog` 表。
- `useLeadsData` 的 create/update/adapt 统一映射 `contactName -> contact_person` 或明确使用 `contact`。
- 详情页保存后 await `updateLead()`，再重新拉取详情或更新全局 leads state。

验证点：
- 修改基础信息、状态、销售评估、转化结果后，返回列表即同步。
- 刷新详情页后数据仍存在。

### 6.2 搜索栏点击/搜索显示内部服务器错误

可疑根因：
- 前端列表本地搜索使用 `lead.contactName.toLowerCase()`，但 `useLeadsData()` 适配后没有给 `contactName` 赋值，可能导致前端运行时错误。
- 若走后端搜索，`OpportunityRepository.search()` 只搜索 `client_name/company/contact`，没有覆盖 `contact_person/phone/requirement`，且字段映射不一致容易造成搜索结果异常。

修复方案：
- 前端修复空值保护：`(lead.contactName || '').toLowerCase()`。
- `useLeadsData()` 适配时补齐 `contactName: opp.contact_person || opp.contact || ''`。
- 后端搜索扩展到 `client_name`、`company`、`contact`、`contact_person`、`phone`、`requirement`，并补测试。

验证点：
- 搜索客户名称、姓名、电话均不报错。
- 空联系人数据不会导致页面崩溃。

### 6.3 状态栏只保留“未跟进、待跟进、已转销售”

根因：
- 前端 `LeadStatus` 当前为 `未跟进 | 已联系 | 已转销售 | 已转化 | 未转化`。
- `OpportunityManager` 的 `LEAD_STATUS_OPTIONS` 和详情页 `STATUS_OPTIONS` 不一致且包含多余状态。
- 后端默认状态仍是 `潜在客户`，模型注释还是高/中/低意向。

修复方案：
- 统一线索状态枚举为 `未跟进`、`待跟进`、`已转销售`。
- 转化结果不要复用 `status` 字段，单独用 `conversion_status` 或结果字段。
- 后端默认状态改为 `未跟进`，初始化和测试数据同步更新。

验证点：
- 列表页和详情页状态选项完全一致。
- 新建线索默认 `未跟进`。

### 6.4 操作记录需记录状态改变

根因：
- 详情页操作记录是前端根据 `createdAt`、`transferredAt`、`conversionAt` 临时渲染，没有后端操作日志。
- 状态更新没有写入历史记录。

修复方案：
- 后端新增 `OpportunityActivityLog` 表，字段：`opportunity_id`、`action`、`from_value`、`to_value`、`operator`、`created_at`。
- 更新状态接口或通用 update service 检测状态变化并写日志。
- 前端详情页操作记录读取 `GET /api/opportunities/{id}/logs`。

验证点：
- 每次状态从 A 改 B 都产生一条操作记录。
- 刷新后操作记录仍存在。

## 7. 复盘中心

### 7.1 复盘中心活动数据没有和其他板块同步

根因：
- `useReviewsData()` 同时调用 `reviewsApi.getActivities()` 和 `activitiesApi.getList()`，理论上会合并所有活动，但存在 ID 类型比较错误：`parseInt(activity.id)` 对后端 `ApiActivity.id` 数字执行时不稳定，`activityId === activity.id` 也可能 number/string 不一致。
- 活动详情状态变更为 `进行中` 时会尝试 `createReviewForActivity()`，但失败被吞掉；并且状态变更后没有全局通知复盘中心刷新。
- 复盘中心依赖后端 reviews 记录，但活动详情、活动列表、复盘中心之间没有统一事件或刷新策略。

修复方案：
- 修复 ID 比较：统一转为 `String(review.activity_id) === String(activity.id)`。
- 活动状态变化后，如果影响复盘状态，必须显式创建/更新 review，并将失败提示出来，不应静默忽略。
- 复盘中心进入页面时强制重新拉取活动和复盘数据。
- 明确复盘状态推导规则：活动 `待启动/进行中/复盘中/已完成` 分别对应什么复盘状态。

验证点：
- 新建活动后复盘中心可见。
- 活动状态变更为进行中/已完成后，复盘中心状态同步。
- 刷新页面后状态仍一致。

## 8. 建议修复顺序

### P0：立即修复

1. 商机搜索空值崩溃和字段映射问题。
2. 供应商账单状态映射错误。
3. 供应商评价姓名字段和映射错误。
4. 活动详情预算费用金额显示 0。
5. 物料详情和物料仓库日志接口读取真实后端数据。

### P1：跨模块同步

1. 活动任务摘要同步到活动卡片。
2. 活动费用流水同步预算仓库并回写实际支出。
3. 活动物料领用增加 `activity_id` 并同步仓库流水。
4. 活动供应商改为选择供应商库已有供应商。
5. 活动详情商机线索支持跳转详情。

### P2：数据模型补齐

1. 商机详情字段持久化。
2. 商机操作记录表。
3. 物料图片、归还状态与归还接口。
4. 行业预算额度模型。

### P3：体验和测试

1. 活动列表筛选状态 query 化。
2. 预算仓库行业筛选与行业图表。
3. 清理硬编码演示数据。
4. 为每个修复点补前端交互测试和后端 API 测试。

## 9. 回归测试清单

后端：

- `python -m pytest tests/test_task.py -q`
- `python -m pytest tests/test_budget.py -q`
- `python -m pytest tests/test_material.py -q`
- `python -m pytest tests/test_supplier.py -q`
- `python -m pytest tests/test_opportunity.py -q`
- `python -m pytest tests/test_review.py -q`

前端：

- `npm test -- ActivityDetail`
- `npm test -- MaterialManager`
- `npm test -- SupplierManager`
- `npm test -- OpportunityManager`
- `npm test -- BudgetManager`
- `npm test -- ReviewCenter`
- `npm run test:e2e`

手工关键路径：

1. 创建活动，进入详情新增任务、费用、物料、供应商、商机。
2. 返回活动列表，检查年份定位和任务摘要。
3. 进入预算仓库，检查费用拆分和行业统计。
4. 进入物料仓库，检查库存、领用流水、归还。
5. 进入供应商库，检查合作笔数、账单状态、评价姓名。
6. 进入商机转化，检查搜索、详情编辑持久化、状态操作记录。
7. 进入复盘中心，检查活动和状态同步。
