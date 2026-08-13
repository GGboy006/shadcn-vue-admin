# 居民 AI 工具对接文档（ResidentAiToolController）

> **适用端**：residential-web 站长工作台（PC）  
> **后端类**：`com.city.web.resident.controller.ResidentAiToolController`  
> **模块标识**：`resident-ai-tool`  
> **请求前缀（Base URL）**：`https://content.icitychina.net/residential-web/web`  
> **接口前缀**：`/resident/ai-tool`  
> **Content-Type**：`application/json`（POST/PUT Body）  
> **鉴权**：请求头 `Authorization: Bearer {token}`（站长账号）  
> **统一响应**：`BaseResponse<T>` → `{ code, level, msg, data }`，成功时 `code = 0`  
> **时间格式**：`yyyy-MM-dd HH:mm:ss`

---

## 1. 业务说明

| 概念 | 说明 |
|------|------|
| 分类 | 走城市数据 `cate.type = 10`（AI助手），按小区站 `partnerId=stationCode` 隔离 |
| 居民工具分配 | 本地表 `ai_skill_user_assign`：`userId=站长`，`type=7`，`cate_code=分类uniqueCode` |
| 候选工具 | 平台已分给站长的技能（`type=1`）且 `ai_skill_tool.type=2`（Agent） |
| 批量分配 | 按**单个分类**全量覆盖；同一工具可出现在不同分类（唯一键含 `cate_code`） |
| 城市同步 | 分配成功后调用城市 `batchSaveAiService`，同步该分类下 `service.type=17` |

**推荐前端流程**

```text
1. GET /resident/ai-tool/cate/list          → 选/管理分类
2. GET /resident/ai-tool/assign-list?cateCode=xxx → 勾选工具（看 checked）
3. POST /resident/ai-tool/assign           → 提交该分类下最终 skillIds
4. GET /resident/ai-tool/list?cateCode=xxx → 查看已分配
```

**完整 URL 示例**

```text
https://content.icitychina.net/residential-web/web/resident/ai-tool/cate/list
```

---

## 2. 接口一览

### 2.1 分类

| 说明 | 方法 | 路径 |
|------|------|------|
| 分类分页 | GET | `/resident/ai-tool/cate/page` |
| 分类下拉 | GET | `/resident/ai-tool/cate/list` |
| 分类新增 | POST | `/resident/ai-tool/cate` |
| 分类更新 | PUT | `/resident/ai-tool/cate` |
| 分类删除 | DELETE | `/resident/ai-tool/cate/{uniqueCode}` |

### 2.2 工具分配

| 说明 | 方法 | 路径 |
|------|------|------|
| 已分配列表（不分页） | GET | `/resident/ai-tool/list` |
| 分配候选列表（不分页） | GET | `/resident/ai-tool/assign-list` |
| 批量分配（按分类全量覆盖） | POST | `/resident/ai-tool/assign` |

---

## 3. 分类接口

### 3.1 分类分页

- **GET** `/resident/ai-tool/cate/page`

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| keyword | Query | String | 否 | 名称模糊 |
| pageNum | Query | Long | 是 | 页码 |
| pageSize | Query | Long | 是 | 每页条数 |

**响应** `data`：`PageResult<TblCommunityCateResp>`

### 3.2 分类下拉（全部）

- **GET** `/resident/ai-tool/cate/list`

无参数。

**响应** `data`：`List<TblCommunityCateResp>`

### 3.3 分类新增

- **POST** `/resident/ai-tool/cate`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 分类名称 |
| describe | String | 否 | 描述 |
| torder | Integer | 否 | 排序 |
| isEnable | Integer | 否 | 1启用 / 2禁用 |
| parentCode | String | 否 | 父级标识，默认 0 |

**响应** `data`：`Boolean`

### 3.4 分类更新

- **PUT** `/resident/ai-tool/cate`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uniqueCode | String | 是 | 分类唯一标识 |
| name | String | 是 | 分类名称 |
| describe | String | 否 | 描述 |
| torder | Integer | 否 | 排序 |
| isEnable | Integer | 否 | 1启用 / 2禁用 |
| parentCode | String | 否 | 父级标识 |

**响应** `data`：`Boolean`

### 3.5 分类删除

- **DELETE** `/resident/ai-tool/cate/{uniqueCode}`

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| uniqueCode | Path | String | 是 | 分类唯一标识 |

**响应** `data`：`Boolean`

### 3.6 TblCommunityCateResp

| 字段 | 类型 | 说明 |
|------|------|------|
| uniqueCode | String | 分类唯一标识 |
| parentCode | String | 父级标识 |
| name | String | 名称 |
| describe | String | 描述 |
| torder | Integer | 排序 |
| type | Integer | 固定为 10（AI助手） |
| tempType | Integer | 模板类型 |
| isEnable | Integer | 1启用 / 2禁用 |
| partnerId | String | 小区站编码 |
| createTime | DateTime | 创建时间 |
| operatorTime | DateTime | 更新时间 |

---

## 4. 工具分配接口

### 4.1 已分配列表

本地 `ai_skill_user_assign`（`type=7`），**不分页**。

- **GET** `/resident/ai-tool/list`

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| cateCode | Query | String | 否 | 按分类过滤 |
| keyword | Query | String | 否 | 工具名称模糊 |

**响应** `data`：`List<ResidentAiToolVO>`

### 4.2 分配候选列表

站长已拥有的 Agent 工具 + 指定分类下是否已分配（`checked`），**不分页**。

- **GET** `/resident/ai-tool/assign-list`

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| cateCode | Query | String | **是** | 分类 uniqueCode |
| name | Query | String | 否 | 工具名称模糊 |

**响应** `data`：`List<AssignSkillVO>`

| 字段 | 类型 | 说明 |
|------|------|------|
| skillId | Long | 技能 ID |
| name | String | 名称 |
| icon | String | 图标 |
| description | String | 描述 |
| inputType | Integer | 1文本 / 2图片 / 3音频 / 4混合 |
| tags | String[] | 能力标签 |
| assignStatus | Integer | 站长侧分配状态：1生效 / 2暂停 / 3过期 |
| toolMode | Integer | 1单次对话 / 2流程式向导 |
| checked | Boolean | **当前 cateCode 下**是否已对居民开放 |

### 4.3 批量分配（按分类全量覆盖）

- **POST** `/resident/ai-tool/assign`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cateCode | String | 是 | 分类 uniqueCode |
| skillIds | Long[] | 是 | 该分类最终要保留的技能 ID 列表；**传 `[]` 表示清空该分类** |

**示例**

```json
{
  "cateCode": "xxxxxxxx",
  "skillIds": [2059531175008096257, 2061723543308242946]
}
```

**响应** `data`：`Boolean`

**覆盖规则（在同一 cateCode 内）**

| 集合 | 含义 |
|------|------|
| current | 该站长 + type=7 + 该 cateCode 下已有 skillId |
| target | 本次 `skillIds` |

```text
新增 = target − current
删除 = current − target
保留 = target ∩ current
```

说明：

- 仅影响当前 `cateCode`，其他分类下的同一 `skillId` 不受影响  
- 本地写入后同步城市：该分类下 `service.type=17`，`otherCode=SkillTool.thirdId`  
- `skillIds` 中的工具必须是站长已拥有的 Agent，且已配置 `thirdId`

### 4.4 ResidentAiToolVO

| 字段 | 类型 | 说明 |
|------|------|------|
| uniqueCode | String | 城市服务唯一标识（本地列表可能为空） |
| name | String | 展示名称 |
| poster | String | 封面 |
| describe | String | 描述 |
| torder | Integer | 排序 |
| isEnable | Integer | 启用状态 |
| cateCode | String | 分类标识 |
| cateName | String | 分类名称 |
| otherCode | String | = SkillTool.thirdId |
| skillId | Long | 技能 ID |
| skillName | String | 技能名称 |
| skillIcon | String | 技能图标 |
| createTime | DateTime | 分配创建时间 |

---

## 5. 统一响应示例

```json
{
  "code": 0,
  "level": null,
  "msg": "success",
  "data": true
}
```

---

## 6. 枚举速查

| 项 | 值 | 说明 |
|----|----|------|
| 城市分类 type | 10 | AI助手分类 |
| 城市服务 type | 17 | 社区 AI 助手（挂 cate 10） |
| 技能 type | 2 | Agent（居民工具候选） |
| 分配 type | 1 | 用户主体（站长/商户等） |
| 分配 type | 7 | 居民开放（挂站长 userId + cate_code） |
| isEnable | 1 / 2 | 启用 / 禁用 |
