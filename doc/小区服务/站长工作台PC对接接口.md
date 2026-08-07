# 站长工作台 PC 端接口对接文档

> **适用端**：residential-web 站长工作台（PC）  
> **请求前缀（Base URL）**：`https://content.icitychina.net/residential-web/web`  
> **Content-Type**：`application/json`（POST/PUT Body）  
> **鉴权**：请求头 `Authorization: Bearer {token}`  
> **统一响应**：`BaseResponse<T>` → `{ code, level, msg, data }`，成功时 `code = 0`  
> **时间格式**：`yyyy-MM-dd HH:mm:ss`  
> **说明**：小区类接口的 `partnerId` 由后端按当前站长 `stationCode` 自动注入，前端可不传。

---

## 目录

1. [通用约定](#1-通用约定)
2. [意见反馈](#2-意见反馈-feedback)
3. [知识服务](#3-知识服务-knowledge)
4. [管家服务](#4-管家服务-housekeeper)
5. [居民管理](#5-居民管理-resident)
6. [居民AI工具](#6-居民ai工具-residentai-tool)
7. [社区电话](#7-社区电话-communityphone)
8. [办事指南](#8-办事指南-communityserviceguide)
9. [小区公告](#9-小区公告-communitynotice)
10. [小区动态](#10-小区动态-communitydynamic)
11. [小区栏目](#11-小区栏目-communitycolumn)
12. [小区分类](#12-小区分类-communitycate)
13. [小区服务](#13-小区服务-communityservice)
14. [枚举速查](#14-枚举速查)

---

## 1. 通用约定

### 1.1 完整 URL 拼装

```
{BaseURL}{接口路径}
示例：https://content.icitychina.net/residential-web/web/feedback/stats
```

### 1.2 统一响应

```json
{
  "code": 0,
  "level": null,
  "msg": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | `0`=成功，其他为错误码 |
| msg | String | 提示信息 |
| data | T | 业务数据 |

### 1.3 分页请求 `PageParam`（GET Query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | Long | 是 | 页码，从 1 开始 |
| pageSize | Long | 是 | 每页条数，最大 200 |
| searchCount | Boolean | 否 | 是否查总条数 |
| sortItemList | Array | 否 | `[{ isAsc, column }]` |

### 1.4 分页响应 `PageResult<T>`

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "total": 100,
  "pages": 10,
  "list": [],
  "emptyFlag": false
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| pageNum | Long | 当前页 |
| pageSize | Long | 每页数量 |
| total | Long | 总记录数 |
| pages | Long | 总页数 |
| list | Array\<T\> | 结果列表 |
| emptyFlag | Boolean | 是否为空 |

---

## 2. 意见反馈 `/feedback`

**模块标识**：`feedback`  
**后端**：`FeedbackController`

### 2.1 统计

- **方法/路径**：`GET /feedback/stats`
- **完整 URL**：`https://content.icitychina.net/residential-web/web/feedback/stats`
- **响应 data**：`FeedbackStatsVO`

| 字段 | 类型 | 说明 |
|------|------|------|
| total | Long | 全部 |
| pending | Long | 待处理 |
| processed | Long | 已处理 |
| replied | Long | 已回复 |

### 2.2 分页列表

- **方法/路径**：`GET /feedback/page`
- **Query**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum / pageSize | Long | 是 | 分页 |
| keyword | String | 否 | 姓名/手机/内容模糊 |
| status | Integer | 否 | 1待处理/2已处理/3已回复 |
| feedbackType | Integer | 否 | 1建议/2表扬/3投诉/4其他 |

- **响应 data**：`PageResult<FeedbackVO>`（字段见下表）

### 2.3 详情

- **方法/路径**：`GET /feedback/{feedbackId}`
- **Path**：`feedbackId` Long 必填
- **响应 data**：`FeedbackVO`

### 2.4 新增（联调/录入）

- **方法/路径**：`POST /feedback`
- **Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| feedbackType | Integer | 是 | 1建议/2表扬/3投诉/4其他 |
| content | String | 是 | ≤2000 |
| userId | Long | 否 | 反馈用户ID |
| residentId | Long | 否 | 居民ID |
| userName | String | 否 | ≤50 |
| userPhone | String | 否 | ≤20 |
| avatar | String | 否 | 头像 URL |
| images | String[] | 否 | 图片 URL 列表 |
| remark | String | 否 | ≤500 |

### 2.5 更新状态

- **方法/路径**：`PUT /feedback/status`
- **Body**：`{ "feedbackId": Long必填, "status": Integer必填 }`（1/2/3）

### 2.6 回复（自动置为已回复）

- **方法/路径**：`PUT /feedback/reply`
- **Body**：`{ "feedbackId": Long必填, "replyContent": String必填 }`（≤2000）

### 2.7 删除

- **方法/路径**：`DELETE /feedback/{feedbackId}`

### FeedbackVO

| 字段 | 类型 | 说明 |
|------|------|------|
| feedbackId | Long | 反馈ID |
| stationId | Long | 站长ID |
| userId / residentId | Long | 用户/居民 |
| userName / userPhone / userAccount / avatar | String | 反馈人信息 |
| feedbackType / feedbackTypeLabel | Integer/String | 类型及文案 |
| content | String | 内容 |
| images | String[] | 图片 |
| status / statusLabel | Integer/String | 状态及文案 |
| replyContent / replyTime / replyUserId | — | 回复信息 |
| handleTime / handleUserId | — | 处理信息 |
| remark | String | 备注 |
| createTime / updateTime | DateTime | 时间 |

---

## 3. 知识服务 `/knowledge`

**模块标识**：`knowledge`  
**后端**：`KnowledgeController`  
**说明**：可见本站 + 全站通用；仅本站数据可改删（响应中 `editable` 标识）。

### 3.1 知识分类 `/knowledge/category`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/knowledge/category/page` |
| 启用列表（下拉） | GET | `/knowledge/category/list` |
| 详情 | GET | `/knowledge/category/{categoryId}` |
| 新增 | POST | `/knowledge/category` |
| 更新 | PUT | `/knowledge/category` |
| 启停 | PUT | `/knowledge/category/{categoryId}/status?status=` |
| 删除 | DELETE | `/knowledge/category/{categoryId}` |

**分页 Query**：`pageNum*`, `pageSize*`, `categoryName`, `categoryType`(1安法治/2科普), `status`(1启用/2禁用)

**新增/更新 Body 核心字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | Long | 更新必填 | — |
| categoryName | String | 是 | 名称 |
| categoryType | Integer | 是 | 1安法治/2科普 |
| icon / description | String | 否 | — |
| sortOrder / status | Integer | 否 | status 默认启用 |

**KnowledgeCategoryVO**：`categoryId`, `categoryName`, `categoryType`, `icon`, `description`, `sortOrder`, `status`, `stationId`, `editable`, `articleCount`, `createTime`, `updateTime`

### 3.2 知识文章 `/knowledge/article`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/knowledge/article/page` |
| 详情 | GET | `/knowledge/article/{articleId}` |
| 新增 | POST | `/knowledge/article` |
| 更新 | PUT | `/knowledge/article` |
| 发布状态 | PUT | `/knowledge/article/{articleId}/publish-status?publishStatus=` |
| 置顶 | PUT | `/knowledge/article/{articleId}/top?topFlag=` |
| 删除 | DELETE | `/knowledge/article/{articleId}` |

**分页 Query**：`pageNum*`, `pageSize*`, `categoryId`, `keyword`, `publishStatus`(0草稿/1已发布/2已下架), `topFlag`(1置顶/0否)

**新增/更新 Body 核心字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| articleId | Long | 更新必填 | — |
| categoryId | Long | 是 | 分类 |
| title | String | 是 | 标题 |
| content | String | 是 | 正文 |
| summary / coverImage / source / author | String | 否 | — |
| attachments / tags | String[] | 否 | 附件/标签 |
| topFlag | Integer | 否 | 1/0 |
| publishStatus | Integer | 否 | 0/1/2 |

**KnowledgeArticleVO**：`articleId`, `categoryId`, `categoryName`, `title`, `summary`, `content`, `coverImage`, `attachments`, `tags`, `source`, `author`, `viewCount`, `likeCount`, `topFlag`, `publishStatus`, `publishTime`, `stationId`, `editable`, `createTime`, `updateTime`

### 3.3 快捷问答 `/knowledge/question`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/knowledge/question/page` |
| 启用列表 | GET | `/knowledge/question/list` |
| 详情 | GET | `/knowledge/question/{questionId}` |
| 新增 | POST | `/knowledge/question` |
| 更新 | PUT | `/knowledge/question` |
| 启停 | PUT | `/knowledge/question/{questionId}/status?status=` |
| 删除 | DELETE | `/knowledge/question/{questionId}` |

**新增/更新 Body**：`questionId`(更新必填), `questionName*`, `keyword*`, `prompt*`, `icon`, `sortOrder`, `status`

**KnowledgeQuickQuestionVO**：`questionId`, `questionName`, `keyword`, `prompt`, `icon`, `sortOrder`, `status`, `stationId`, `editable`, `createTime`, `updateTime`

---

## 4. 管家服务 `/housekeeper`

**模块标识**：`housekeeper`  
**后端**：`HousekeeperController`

### 4.1 管家服务主体 `/housekeeper/service`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/housekeeper/service/page` |
| 启用列表 | GET | `/housekeeper/service/list` |
| 详情 | GET | `/housekeeper/service/{housekeeperId}` |
| 新增 | POST | `/housekeeper/service` |
| 更新 | PUT | `/housekeeper/service` |
| 启停 | PUT | `/housekeeper/service/{housekeeperId}/status?status=` |
| 删除 | DELETE | `/housekeeper/service/{housekeeperId}` |

**分页 Query**：`pageNum*`, `pageSize*`, `name`, `status`(1/2)

**新增/更新 Body**：`housekeeperId`(更新必填), `name*`, `description`, `icon`, `coverImage`, `contactName`, `contactPhone`, `merchantId`, `sortOrder`, `status`

**HousekeeperServiceVO**：`housekeeperId`, `stationId`, `name`, `description`, `icon`, `coverImage`, `contactName`, `contactPhone`, `merchantId`, `sortOrder`, `status`, `staffCount`, `createTime`, `updateTime`

### 4.2 服务人员 `/housekeeper/staff`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/housekeeper/staff/page` |
| 启用列表 | GET | `/housekeeper/staff/list?housekeeperId=` |
| 详情 | GET | `/housekeeper/staff/{staffId}` |
| 新增 | POST | `/housekeeper/staff` |
| 更新 | PUT | `/housekeeper/staff` |
| 启停 | PUT | `/housekeeper/staff/{staffId}/status?status=` |
| 删除 | DELETE | `/housekeeper/staff/{staffId}` |

**分页 Query**：`pageNum*`, `pageSize*`, `housekeeperId`, `staffName`, `status`

**新增/更新 Body**：`staffId`(更新必填), `housekeeperId*`, `staffName*`, `phone`, `avatar`, `title`, `userId`, `sortOrder`, `status`

**HousekeeperStaffVO**：`staffId`, `housekeeperId`, `housekeeperName`, `stationId`, `staffName`, `phone`, `avatar`, `title`, `userId`, `sortOrder`, `status`, `createTime`, `updateTime`

### 4.3 服务分类 `/housekeeper/category`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/housekeeper/category/page` |
| 启用列表 | GET | `/housekeeper/category/list` |
| 详情 | GET | `/housekeeper/category/{categoryId}` |
| 新增 | POST | `/housekeeper/category` |
| 更新 | PUT | `/housekeeper/category` |
| 启停 | PUT | `/housekeeper/category/{categoryId}/status?status=` |
| 删除 | DELETE | `/housekeeper/category/{categoryId}` |

**新增/更新 Body**：`categoryId`(更新必填), `categoryName*`, `categoryCode`, `icon`, `description`, `sortOrder`, `status`

**ServiceCategoryVO**：`categoryId`, `categoryName`, `categoryCode`, `icon`, `description`, `sortOrder`, `status`, `stationId`, `providerCount`, `createTime`, `updateTime`

### 4.4 分类分配人员

| 说明 | 方法 | 路径 |
|------|------|------|
| 已分配列表 | GET | `/housekeeper/category/{categoryId}/providers` |
| 全量覆盖分配 | PUT | `/housekeeper/category/providers` |
| 删除单条分配 | DELETE | `/housekeeper/category/providers/{id}` |

**分配 Body**

```json
{
  "categoryId": 1,
  "providers": [
    { "housekeeperId": 1, "staffId": 10, "sortOrder": 1 }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | Long | 是 | 分类ID |
| providers | Array | 否 | 空数组=清空 |
| providers[].housekeeperId | Long | 是 | 管家服务ID |
| providers[].staffId | Long | 否 | 人员ID |
| providers[].sortOrder | Integer | 否 | 排序 |

**CategoryProviderVO**：`id`, `categoryId`, `housekeeperId`, `housekeeperName`, `staffId`, `staffName`, `sortOrder`, `status`

---

## 5. 居民管理 `/resident`

**模块标识**：`resident`  
**后端**：`ResidentController`  
**说明**：只读列表/详情，按当前站长 `stationId` 隔离。

### 5.1 分页列表

- **方法/路径**：`GET /resident/page`
- **完整 URL**：`https://content.icitychina.net/residential-web/web/resident/page`
- **Query**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum / pageSize | Long | 是 | 分页 |
| keyword | String | 否 | 昵称/手机/门牌/楼栋 |
| identityType | Integer | 否 | 1业主/2租户/3家属 |
| verifyStatus | Integer | 否 | 0未认证/1认证中/2已认证/3失败 |
| status | Integer | 否 | 1启用/2禁用 |
| buildingNo | String | 否 | 楼栋号 |

### 5.2 详情

- **方法/路径**：`GET /resident/{residentId}`

### ResidentVO

| 字段 | 类型 | 说明 |
|------|------|------|
| residentId / userId / stationId | Long | ID |
| nickname / avatar / phone | String | 用户信息 |
| gender | Integer | 0未知/1男/2女 |
| buildingNo / unitNo / roomNo / doorplate | String | 住址 |
| houseArea | Number | 面积 |
| houseType | String | 户型 |
| identityType / identityTypeLabel | Integer/String | 身份 |
| verifyStatus / verifyStatusLabel / verifyTime | — | 认证 |
| aiToolCount | Integer | AI工具使用次数 |
| lastActiveTime | DateTime | 最近活跃 |
| remark / status | — | 备注/状态 |
| createTime / updateTime | DateTime | 时间 |

---

## 6. 居民AI工具 `/resident/ai-tool`

**模块标识**：`resident-ai-tool`  
**后端**：`ResidentAiToolController`  
**约定**：
- 分类固定 City Data `cate.type = 10`（AI助手）
- 已开通固定 `service.type = 17`，`otherCode = SkillTool.thirdId`
- 候选工具：当前站长已分配 + `ai_skill_tool.type = 2`（Agent）
- **不写** `ai_skill_user_assign`（开通只写社区服务）

### 6.1 分类

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/resident/ai-tool/cate/page?keyword=` |
| 全部（下拉） | GET | `/resident/ai-tool/cate/list` |
| 新增 | POST | `/resident/ai-tool/cate` |
| 更新 | PUT | `/resident/ai-tool/cate` |
| 删除 | DELETE | `/resident/ai-tool/cate/{uniqueCode}` |

**新增 Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 分类名称 |
| describe | String | 否 | 描述 |
| torder | Integer | 否 | 排序 |
| isEnable | Integer | 否 | 1启用/2禁用 |
| parentCode | String | 否 | 父级，默认 0 |

**更新 Body**：同上 + `uniqueCode*`

**响应分类结构 `TblCommunityCateResp`**：`uniqueCode`, `parentCode`, `name`, `describe`, `torder`, `type`, `tempType`, `isEnable`, `partnerId`, `createTime`, `operatorTime`

### 6.2 已开通 / 候选 / 分配

| 说明 | 方法 | 路径 |
|------|------|------|
| 已开通分页 | GET | `/resident/ai-tool/page` |
| 候选工具分页 | GET | `/resident/ai-tool/candidates` |
| 开通分配 | POST | `/resident/ai-tool/assign` |
| 更新 | PUT | `/resident/ai-tool` |
| 取消开通 | DELETE | `/resident/ai-tool/{uniqueCode}` |

**已开通分页 Query**：`pageNum*`, `pageSize*`, `cateCode`, `keyword`

**候选分页 Query**：`pageNum*`, `pageSize*`, `name`（工具名模糊）

**开通 Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cateCode | String | 是 | 分类 uniqueCode |
| skillId | Long | 是 | 候选工具 skillId |
| name / poster / describe | String | 否 | 不传则用工具信息 |
| torder / isEnable | Integer | 否 | — |

**更新 Body**：`uniqueCode*`, `cateCode`, `cateName`, `name`, `poster`, `describe`, `torder`, `isEnable`

**ResidentAiToolVO**

| 字段 | 类型 | 说明 |
|------|------|------|
| uniqueCode | String | 服务唯一标识 |
| name / poster / describe | String | 展示信息 |
| torder / isEnable | Integer | 排序/启停 |
| cateCode / cateName | String | 分类 |
| otherCode | String | = thirdId |
| skillId / skillName / skillIcon | — | 反查技能信息 |
| createTime | DateTime | 创建时间 |

**MySkillVO（候选）**：`skillId`, `name`, `icon`, `thirdId`, `type`, `description`, `inputType`, `tags`, `toolMode`

**推荐前端流程**

```text
1. GET /resident/ai-tool/cate/list          → 选分类
2. GET /resident/ai-tool/candidates         → 选 Agent 工具
3. POST /resident/ai-tool/assign            → 开通
4. GET /resident/ai-tool/page?cateCode=     → 看已开通
```

---

## 7. 社区电话 `/community/phone`

**模块标识**：`community-phone`  
**后端**：`StationCommunityController`

| 说明 | 方法 | 路径 |
|------|------|------|
| 父级列表 | GET | `/community/phone/parentList?keyword=` |
| 分页 | GET | `/community/phone/page` |
| 新增 | POST | `/community/phone` |
| 更新 | PUT | `/community/phone` |
| 删除 | DELETE | `/community/phone/{uniqueCode}` |

**新增/更新 Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uniqueCode | String | 更新必填 | — |
| title | String | 是 | 标题 |
| parentCode | String | 否 | 父级；顶级用父级列表（parentCode=0） |
| poster | String | 否 | 图片 |
| regionPhone | String | 否 | 值班电话 |
| workTime | String | 否 | 工作时间 |
| isEnable | Integer | 否 | 1启用/2禁用 |
| type | Integer | 否 | 1管理员/2服务 |
| contactUser / contactPhone | String | 否 | 联系人/电话 |
| customerServiceWeixin / wechatQrcode | String | 否 | 微信/二维码 |
| partnerId | String | 否 | 后端填充 |

**TblCommunityPhoneResp**：`uniqueCode`, `parentCode`, `title`, `poster`, `type`, `regionName`, `regionPhone`, `workTime`, `isEnable`, `partnerId`, `contactUser`, `contactPhone`, `customerServiceWeixin`, `wechatQrcode`, `createTime`, `operatorTime`

---

## 8. 办事指南 `/community/serviceGuide`

**模块标识**：`community-service-guide`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/community/serviceGuide/page` |
| 新增 | POST | `/community/serviceGuide` |
| 更新 | PUT | `/community/serviceGuide` |
| 删除 | DELETE | `/community/serviceGuide/{uniqueCode}` |

**新增/更新 Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uniqueCode | String | 更新必填 | — |
| title | String | 是 | 标题 |
| parentCode | String | 否 | 父级 |
| type | Integer | 否 | 1主体/2受理条件/3申请材料/4办理流程 |
| poster / unit / address / phone / describe | String | 否 | — |
| isEnable | Integer | 否 | 1/2 |
| worktime | String | 否 | 工作时间 |
| acceptanceConditions | String | 否 | 受理条件 |
| applicationMaterials | String | 否 | 申请材料 |
| handlingProcedures | String | 否 | 办理流程 |
| partnerId | String | 否 | 后端填充 |

**TblCommunityServiceGuideResp**：`id`, `uniqueCode`, `parentCode`, `title`, `poster`, `unit`, `address`, `phone`, `describe`, `type`, `regionName`, `isEnable`, `partnerId`, `partnerPid`, `worktime`, `acceptanceConditions`, `applicationMaterials`, `handlingProcedures`, `createTime`, `operatorTime`

---

## 9. 小区公告 `/community/notice`

**模块标识**：`community-notice`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/community/notice/page` |
| 详情 | GET | `/community/notice/detail?uniqueCode=` |
| 新增 | POST | `/community/notice` |
| 更新 | PUT | `/community/notice` |
| 删除 | DELETE | `/community/notice/{uniqueCode}` |

**新增/更新 Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uniqueCode | String | 更新必填 | — |
| title | String | 是 | 标题 |
| introduction | String | 否 | 简介 |
| content | String | 否 | 正文（contentType=1） |
| contentType | Integer | 否 | 1文本/2外部链接 |
| h5Url | String | 否 | 链接（contentType=2） |
| isPublic | Integer | 否 | 1公有/2私有 |
| resCode | String | 否 | 关联内容编码 |
| torder | Integer | 否 | 排序 |
| partnerId | String | 否 | 后端填充 |

**列表 VO `CommunityNoticeVO`**：`id`, `uniqueCode`, `title`, `introduction`, `contentType`, `h5Url`, `isPublic`, `resCode`, `torder`, `partnerId`, `createTime`, `updateTime`

**详情 `TblNoticeResp`**：含 `content`, `type` 等完整字段

---

## 10. 小区动态 `/community/dynamic`

**模块标识**：`community-dynamic`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/community/dynamic/page` |
| 详情 | GET | `/community/dynamic/detail?uniqueCode=` |
| 新增 | POST | `/community/dynamic` |
| 更新 | PUT | `/community/dynamic` |
| 删除 | DELETE | `/community/dynamic/{uniqueCode}` |

**新增/更新 Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uniqueCode | String | 更新必填 | — |
| title | String | 是 | 标题 |
| poster / content / original | String | 否 | 封面/内容/来源 |
| keywords | String | 否 | 关键词，英文逗号分隔 |
| userName / userPoster / userUniqueCode | String | 否 | 作者 |
| sourceUrl | String | 否 | 来源网址 |
| auditStatus | Integer | 否 | 0待审核/1拒绝/2通过 |
| isEnable | Integer | 否 | 1/2 |
| describes / auditMsg | String | 否 | 介绍/审核说明 |
| communityUniqueCode | String | 否 | 社区标识 |
| partnerId | String | 否 | 后端填充 |

**TblCommunityDynamicResp**：`id`, `uniqueCode`, `poster`, `title`, `content`, `original`, `keywords`, `userName`, `userPoster`, `userUniqueCode`, `sourceUrl`, `auditStatus`, `isEnable`, `partnerId`, `partnerPid`, `isDeleted`, `describes`, `auditMsg`, `communityUniqueCode`, `createTime`, `operatorTime`

---

## 11. 小区栏目 `/community/column`

**模块标识**：`community-column`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/community/column/page` |
| 新增 | POST | `/community/column` |
| 更新 | PUT | `/community/column` |
| 删除 | DELETE | `/community/column/{uniqueCode}` |

**新增/更新 Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uniqueCode | String | 更新必填 | — |
| name | String | 是 | 名称 |
| logo | String | 否 | logo |
| type | Integer | 否 | 见[枚举](#14-枚举速查)栏目类型 |
| torder / isEnable | Integer | 否 | 排序/启停 |
| appId / readingCode / h5Url / resCode | String | 否 | — |
| partnerId | String | 否 | 后端填充 |

**TblCommunityColumnResp**：`id`, `uniqueCode`, `name`, `logo`, `torder`, `isEnable`, `type`, `appId`, `readingCode`, `h5Url`, `partnerId`, `createTime`, `updateTime`

---

## 12. 小区分类 `/community/cate`

**模块标识**：`community-cate`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/community/cate/page` |
| 按类型全部（下拉） | GET | `/community/cate/list?type=` |
| 新增 | POST | `/community/cate` |
| 更新 | PUT | `/community/cate` |
| 删除 | DELETE | `/community/cate/{uniqueCode}` |

**分页 Query**：`pageNum*`, `pageSize*`, `keyword`, `type`（可选过滤）

**下拉 Query**：`type` **必填**（1社区服务/2居委会/3物业/4生活/5服务/9商品/10AI助手）

**新增/更新 Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uniqueCode | String | 更新必填 | — |
| name | String | 是 | 名称 |
| parentCode | String | 否 | 父级 |
| describe / torder | — | 否 | — |
| type | Integer | 否 | 分类类型 |
| tempType | Integer | 否 | 模板类型 |
| isEnable | Integer | 否 | 1/2 |
| partnerId | String | 否 | 后端填充 |

> 居民 AI 工具分类请优先使用 `/resident/ai-tool/cate/*`（后端已固定 type=10）。

---

## 13. 小区服务 `/community/service`

**模块标识**：`community-service`

| 说明 | 方法 | 路径 |
|------|------|------|
| 分页 | GET | `/community/service/page` |
| 新增 | POST | `/community/service` |
| 更新 | PUT | `/community/service` |
| 删除 | DELETE | `/community/service/{uniqueCode}` |

**分页 Query**：`pageNum*`, `pageSize*`, `keyword`, `cateCode`, `type`（可选，如 17=居民AI工具）

**新增/更新 Body 核心字段**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uniqueCode | String | 更新必填 | — |
| name | String | 是 | 名称 |
| poster / backgroundPoster / describe | String | 否 | — |
| torder / isEnable / location | Integer | 否 | location:1顶/2中/3底 |
| type | Integer | 否 | 服务类型，见枚举 |
| cateCode / cateName | String | 否 | 分类 |
| serviceType | Integer | 否 | 1社区服务/2阅读服务 |
| otherCode | String | 否 | 外部标识（商户码/thirdId等） |
| appId / originalAppId / bdAppKey | String | 否 | 小程序 |
| readingCode / serviceCode | String | 否 | 阅览室 |
| h5Url / appUrl / linkUrl | String | 否 | 跳转 |
| address / businessHours | String | 否 | — |
| serviceList | String | 否 | 多服务栏目 |
| partnerId | String | 否 | 后端填充 |

**TblCommunityServiceResp**：`id`, `uniqueCode`, `name`, `poster`, `backgroundPoster`, `describe`, `torder`, `linkUrl`, `isEnable`, `location`, `type`, `cateCode`, `cateName`, `serviceType`, `appId`, `originalAppId`, `bdAppKey`, `otherCode`, `readingCode`, `serviceCode`, `h5Url`, `appUrl`, `address`, `businessHours`, `partnerId`, `serviceList`, `createTime`, `operatorTime`

> 居民 AI 工具开通请优先使用 `/resident/ai-tool/assign`（后端固定 type=17 且写入 thirdId）。

---

## 14. 枚举速查

### 通用启停

| 值 | 含义 |
|----|------|
| 1 | 启用 |
| 2 | 禁用 |

### 意见反馈

| 字段 | 值 | 含义 |
|------|----|------|
| status | 1/2/3 | 待处理/已处理/已回复 |
| feedbackType | 1/2/3/4 | 建议/表扬/投诉/其他 |

### 知识

| 字段 | 值 | 含义 |
|------|----|------|
| categoryType | 1/2 | 安法治/科普 |
| publishStatus | 0/1/2 | 草稿/已发布/已下架 |
| topFlag | 1/0 | 置顶/否 |

### 居民

| 字段 | 值 | 含义 |
|------|----|------|
| identityType | 1/2/3 | 业主/租户/家属 |
| verifyStatus | 0/1/2/3 | 未认证/认证中/已认证/失败 |
| gender | 0/1/2 | 未知/男/女 |

### 小区分类 type

| 值 | 含义 |
|----|------|
| 1 | 社区服务 |
| 2 | 居委会 |
| 3 | 物业 |
| 4 | 生活 |
| 5 | 服务 |
| 9 | 商品 |
| 10 | AI助手 |

### 小区服务 type（常用）

| 值 | 含义 |
|----|------|
| 1 | 小程序 |
| 2 | H5网页 |
| 3 | 阅览室 |
| 14 | 商户 |
| 15 | AI助手 |
| 16 | 社区商品 |
| 17 | 社区AI助手（关联 cate type=10） |

### 小区栏目 type（常用）

| 值 | 含义 |
|----|------|
| 1 | 社区公告 |
| 2 | 办事指南 |
| 3 | AI客服 |
| 4 | 社区周边 |
| 5 | 读书会 |
| 6 | 百度小程序 |
| 7 | 微信小程序 |
| 8 | 社区动态 |
| 57 | 居委会 |
| 84 | AI百事通 |
| 87 | 社区动态详情 |
| 88 | 社区分栏 |
| 89 | 全民阅读 |

### 技能工具 type（候选过滤）

| 值 | 含义 |
|----|------|
| 1 | 扣子 Coze |
| 2 | Agent（居民AI工具候选） |
| 3 | AI AgentSkill |

### 社区电话 / 办事指南 / 公告 / 动态

| 模块 | 字段 | 值 | 含义 |
|------|------|----|------|
| 电话 | type | 1/2 | 管理员/服务 |
| 办事指南 | type | 1/2/3/4 | 主体/受理条件/申请材料/办理流程 |
| 公告 | contentType | 1/2 | 文本/外链 |
| 公告 | isPublic | 1/2 | 公有/私有 |
| 动态 | auditStatus | 0/1/2 | 待审/拒绝/通过 |

---

## 附录：模块路径速查表

| 模块 | 前缀 | 完整 Base |
|------|------|-----------|
| 意见反馈 | `/feedback` | `https://content.icitychina.net/residential-web/web/feedback` |
| 知识服务 | `/knowledge` | `https://content.icitychina.net/residential-web/web/knowledge` |
| 管家服务 | `/housekeeper` | `https://content.icitychina.net/residential-web/web/housekeeper` |
| 居民管理 | `/resident` | `https://content.icitychina.net/residential-web/web/resident` |
| 居民AI工具 | `/resident/ai-tool` | `https://content.icitychina.net/residential-web/web/resident/ai-tool` |
| 社区电话 | `/community/phone` | `https://content.icitychina.net/residential-web/web/community/phone` |
| 办事指南 | `/community/serviceGuide` | `https://content.icitychina.net/residential-web/web/community/serviceGuide` |
| 小区公告 | `/community/notice` | `https://content.icitychina.net/residential-web/web/community/notice` |
| 小区动态 | `/community/dynamic` | `https://content.icitychina.net/residential-web/web/community/dynamic` |
| 小区栏目 | `/community/column` | `https://content.icitychina.net/residential-web/web/community/column` |
| 小区分类 | `/community/cate` | `https://content.icitychina.net/residential-web/web/community/cate` |
| 小区服务 | `/community/service` | `https://content.icitychina.net/residential-web/web/community/service` |

---

*文档对应工程：`residential-station-manager` / `residential-web`。如与线上不一致，以部署环境 Swagger（Knife4j）为准。*
