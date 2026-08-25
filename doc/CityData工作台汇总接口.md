# City Data · 工作台一次性汇总接口规范

> **目的**：`residential-web` 三端工作台对 City Data **每端最多调用 1 次**，由 City Data 内部聚合订单/商品/FAQ/活动/社区/留言等指标。  
> **调用方**：`residential-common` → `CityDataClient.workbench()`  
> **统一响应**：`CityDataResponse<T>`，成功 `code=0`

---

## 接口清单

| # | Method | Path | 说明 |
|---|--------|------|------|
| 1 | POST | `/data/station/workbench/stationSummary` | 站长工作台汇总 |
| 2 | POST | `/data/station/workbench/merchantSummary` | 商户工作台汇总 |
| 3 | POST | `/data/station/workbench/orgSummary` | 居委会工作台汇总 |

---

## 1. 站长汇总 `stationSummary`

### 请求 `StationWorkbenchSummaryReq`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| partnerId | String | 是 | 站长编码（stationCode） |
| merchantCodes | String[] | 否 | 名下商户 code，可空 |
| orgCodes | String[] | 否 | 名下居委会 code（留言） |
| startTime | DateTime | 否 | 订单区间开始，默认今日 0 点 |
| endTime | DateTime | 否 | 订单区间结束，默认今日末 |
| merchantContentLimit | Integer | 否 | 商品/FAQ/活动汇总商户数上限，默认 5 |

### 响应 `StationWorkbenchSummaryVO`

| 字段 | 类型 | 口径建议 |
|------|------|----------|
| totalOrderAmount | BigDecimal | 区间内 merchantCodes 订单金额合计 |
| incomeAnalysis | Array | 同现有 `order/amountSummary`：`merchantCode/totalAmount/orderCount` |
| merchantGoodsCount | Long | 对流水 TopN 或前 N 个 merchantCode 的商品总数求和 |
| merchantFaqCount | Long | 同上 FAQ 总数 |
| merchantActivityCount | Long | 同上活动总数 |
| noticeCount | Long | 社区公告总数（partnerId） |
| dynamicPendingCount | Long | 动态待审（auditStatus=0） |
| servicePendingCount | Long | 社区服务未启用 |
| communityGoodsPendingCount | Long | 社区商品未启用 |
| secondhandPendingCount | Long | 闲置待审 |
| leaveMessagePendingCount | Long | orgCodes 留言待处理合计（无回复态可用「未更新」或全量） |
| orderTrend | Array | 近 7 日（本周 vs 上周同期）`{day,thisWeek,lastWeek}`，未就绪可返回 `[]` |
| orgAnalysis | Array | 按 orgCode 拆分 `{orgCode,leaveMessagePending}`，未就绪可返回 `[]` |

### 实现提示

- 订单排行复用现有 `amountSummary` 逻辑即可。
- 社区/留言在 **同一次请求内** 本地查库聚合，不要再对外 HTTP。
- `merchantCodes` 为空时：订单/商品/FAQ/活动相关字段返回 0 / `[]`，仍返回社区指标。

---

## 2. 商户汇总 `merchantSummary`

### 请求 `MerchantWorkbenchSummaryReq`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| merchantCode | String | 是 | 商户标识 |
| todayStart / todayEnd | DateTime | 否 | 今日区间 |
| last7Start | DateTime | 否 | 近 7 日开始（结束可用 todayEnd） |
| expiringDays | Integer | 否 | 即将到期窗口，默认 7 |

### 响应 `MerchantWorkbenchSummaryVO`

| 字段 | 类型 | 口径建议 |
|------|------|----------|
| todayOrderCount / todayAmount | Long / BigDecimal | 今日订单 |
| last7OrderCount / last7Amount | Long / BigDecimal | 近 7 日订单 |
| pendingPayCount | Long | statusType=3 待付款 |
| refundCount | Long | statusType=4 已退款 |
| onSaleCount / offSaleCount | Long | 同 goods/stats |
| activeActivityCount | Long | 当前时间落在 start~end 且启用 |
| expiringActivityCount | Long | endTime 在未来 expiringDays 内 |
| faqCount | Long | FAQ 总数 |
| categoryReady | Boolean | 商品分类是否 >0 |
| orderTrend | Array | 近 7 日 `{day,thisWeek,lastWeek}`，未就绪可返回 `[]` |

---

## 3. 居委会汇总 `orgSummary`

### 请求 `OrgWorkbenchSummaryReq`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orgCode | String | 是 | 居委会标识 |
| windowDays | Integer | 否 | 即将开始/到期窗口，默认 7 |

### 响应 `OrgWorkbenchSummaryVO`

| 字段 | 类型 | 口径建议 |
|------|------|----------|
| noticePendingCount / noticePublishedCount | Long | 公告无草稿态时 pending=0，published=总数 |
| activityPendingCount / activityPublishedCount | Long | 未启用或待审 / 已启用 |
| dynamicPendingCount / dynamicPublishedCount | Long | status/isEnable |
| specialPendingCount / specialPublishedCount | Long | isEnable |
| bannerPendingCount / bannerPublishedCount | Long | isEnable |
| leaveMessagePending / leaveMessageReplied / leaveMessageTotal | Long | 有回复态用回复态；否则未更新=pending |
| hotlineCount | Long | serviceGuide 条数 |
| serviceCount | Long | 居委会服务条目数 |
| ongoingActivityCount | Long | 进行中 |
| upcomingActivityCount | Long | windowDays 内即将开始 |
| expiringActivityCount | Long | windowDays 内即将结束 |
| recommendActivityCount | Long | isRecommend=1 |

---

## 4. 调用方约定（residential-web）

| 端 | City Data 调用 | 仍查本库 |
|----|----------------|----------|
| 站长 | `workbench().stationSummary` ×1 | 签约/签约费/反馈/AI 对话与生图（按 userTag 区分商户端/居民端） |
| 商户/物业 | `workbench().merchantSummary` ×1 | 家政单/数字员工/对话 |
| 居委会 | `workbench().orgSummary` ×1 | 反馈/知识阅读/AI |

City Data 接口未上线或失败时：web 侧对应字段保持默认 0，**不阻断**本地指标返回。

---

## 5. 客户端代码位置

- API：`com.city.common.support.citydata.api.StationWorkbenchAPI`
- Service：`com.city.common.support.citydata.service.StationWorkbenchService`
- 入口：`CityDataClient.workbench()`
- 组装：`com.city.web.workbench.service.WorkBenchService`
