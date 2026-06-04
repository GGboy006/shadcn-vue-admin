# 技能流程 - Prompt 生成接口设计文档

> 本文档面向后端开发，描述 AI 工具向导页面重构后需要后端新增的接口规范。
> 前端不再自行组装 prompt，而是将用户每一步的完整选择数据以表单形式提交给后端，由后端生成优化后的 prompt。

---

## 1. 背景与目标

### 1.1 当前问题
- `render` 步骤的 `promptTemplate` 为空字符串，前端无法组装 prompt
- `content` 步骤的 promptTemplate 占位符 `${goods}` 与字段名 `dishes` 不匹配
- 动态数据源（`merchant_goods`、`merchant_promo_rules`）只传递了 `uniqueCode`，后端无法直接识别具体选了什么

### 1.2 重构目标
- 前端不再依赖 `promptTemplate` 组装 prompt
- 前端将用户每一步的**完整选择数据**（含选项详情）传递给后端
- 后端根据技能配置 + 用户选择，生成/优化 prompt 并返回
- 前端用返回的 prompt 调用图片生成接口

---

## 2. 接口清单

### 2.1 新增接口：生成优化 Prompt（SSE 流式）

```
POST /skill/flow/generate-prompt
Content-Type: application/json
Accept: text/event-stream
```

#### 请求体

```typescript
interface IWizardSubmitForm {
  /** 技能ID */
  skillId: string
  /** 会话ID（首次为空，后端创建后返回） */
  chatId: number | null
  /** 所有步骤的选择数据（仅包含 actionType=1 的用户选择步骤） */
  steps: IWizardStepForm[]
}

interface IWizardStepForm {
  /** 流程节点ID（数据库主键） */
  flowId: number
  /** 步骤编码（业务标识） */
  stepCode: string
  /** 步骤名称 */
  stepName: string
  /** 该步骤的所有字段选择 */
  fieldValues: IWizardFieldValue[]
}

interface IWizardFieldValue {
  /** 字段名（如 scene, dishes, style） */
  field: string
  /** 字段标签（如 "营销场景", "选择菜品"） */
  label: string
  /** 选中的值（单选为 string，多选为 string[]） */
  value: string | string[]
  /** 选中的选项完整信息 */
  selectedOptions: ISelectedOption[]
}

interface ISelectedOption {
  /** 选项值 */
  value: string
  /** 选项显示名称 */
  label: string
  /** 描述文案 */
  desc?: string
  /** 图标/Emoji */
  icon?: string
  /** 预览图URL */
  preview?: string
  /** 金额（动态数据源-商品用） */
  salePrice?: number
  /** 内容（动态数据源用） */
  content?: string
}
```

#### 请求示例

```json
{
  "skillId": "2059531175008096233",
  "chatId": null,
  "steps": [
    {
      "flowId": 1,
      "stepCode": "scene",
      "stepName": "营销场景",
      "fieldValues": [
        {
          "field": "scene",
          "label": "营销场景",
          "value": "festival",
          "selectedOptions": [
            {
              "value": "festival",
              "label": "节日海报",
              "desc": "春节/端午/中秋等节日营销",
              "icon": "🎉"
            }
          ]
        }
      ]
    },
    {
      "flowId": 2,
      "stepCode": "content",
      "stepName": "展示内容",
      "fieldValues": [
        {
          "field": "dishes",
          "label": "选择菜品",
          "value": "GOODS_001",
          "selectedOptions": [
            {
              "value": "GOODS_001",
              "label": "宫保鸡丁",
              "desc": "经典川菜，麻辣鲜香",
              "preview": "https://xxx.com/dish1.jpg",
              "salePrice": 38.00
            }
          ]
        },
        {
          "field": "promo",
          "label": "促销信息",
          "value": "PROMO_001",
          "selectedOptions": [
            {
              "value": "PROMO_001",
              "label": "满100减20",
              "desc": "全场通用，限时三天"
            }
          ]
        },
        {
          "field": "time",
          "label": "时间信息",
          "value": "week",
          "selectedOptions": [
            {
              "value": "week",
              "label": "本周有效"
            }
          ]
        }
      ]
    },
    {
      "flowId": 3,
      "stepCode": "template",
      "stepName": "视觉风格",
      "fieldValues": [
        {
          "field": "style",
          "label": "视觉风格",
          "value": "red_gold",
          "selectedOptions": [
            {
              "value": "red_gold",
              "label": "喜庆红金风",
              "desc": "适合节日/店庆",
              "preview": "https://citymedia.oss-cn-wulanchabu.aliyuncs.com/.../red-gold.jpg"
            }
          ]
        }
      ]
    }
  ]
}
```

#### 响应格式（SSE 流式）

```
event: message
data: {"content": "正在"}

event: message
data: {"content": "为您"}

event: message
data: {"content": "生成"}

event: message
data: {"content": "海报"}

event: message
data: {"content": "prompt..."}

event: complete
data: {"chatId": 12345, "prompt": "请根据以下信息生成一张高质量餐饮营销海报：..."}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `chatId` | number | 会话ID（首次创建，后续复用） |
| `prompt` | string | 后端生成的完整优化 prompt |

#### 后端处理逻辑建议

1. **解析表单数据**：遍历 `steps` 数组，提取每个字段的选择值
2. **获取技能配置**：根据 `skillId` 查询技能详情（含 flows 配置）
3. **组装基础 prompt**：根据技能类型 + 用户选择，生成基础 prompt
4. **AI 优化**：调用 LLM 对基础 prompt 进行优化（流式返回优化过程）
5. **返回结果**：SSE 流式返回优化后的完整 prompt

#### 基础 prompt 组装示例

后端可以根据技能配置自行组装，例如：

```
请根据以下信息生成一张高质量餐饮营销海报：

【营销场景】节日海报（春节/端午/中秋等节日营销）
【展示菜品】宫保鸡丁 - 经典川菜，麻辣鲜香（¥38.00）
【促销信息】满100减20 - 全场通用，限时三天
【生效时间】本周有效
【视觉风格】喜庆红金风 - 适合节日/店庆

要求：
1. 海报文案吸睛，突出菜品特色和促销力度
2. 配色和排版严格符合喜庆红金风风格定位
3. 整体构图适合朋友圈/门店展示
4. 文案简短有力，不超过30字主标题
```

---

## 3. 前端调用时序

```
用户进入页面
    │
    ▼
GET /skill/detail/{skillId} ──→ 获取技能详情 + 流程节点
    │
    ▼
渲染第一步（scene）：展示 AI 话术 + 选项卡片
    │
    ▼
用户选择 "节日海报" → 点击下一步
    │
    ▼
渲染第二步（content）：展示 AI 话术 + 选项卡片（含动态数据）
    │
    ▼
用户选择菜品/促销/时间 → 点击下一步
    │
    ▼
渲染第三步（template）：展示 AI 话术 + 风格预览卡片
    │
    ▼
用户选择 "喜庆红金风" → 点击下一步
    │
    ▼
渲染第四步（render）：自动触发
    │
    ├──→ POST /skill/flow/generate-prompt
    │      请求体：IWizardSubmitForm（含所有步骤的完整选择数据）
    │      ←── SSE 流式返回 AI 优化后的 prompt
    │
    ▼
用户看到完整优化 prompt 后，点击"下一步"
    │
    ├──→ POST /aiImage/quicklyCreate/generations
    │      { chatId, prompt: "优化后的prompt", size: "auto" }
    │      ←── 返回 { id, status: 0, chatId }
    │
    ├──→ 轮询 GET /aiImage/quicklyCreate/{id}
    │      每 3 秒查询一次
    │      ←── status: 0（继续轮询）/ 1（成功）/ 2（失败）
    │
    ▼
渲染第五步（completed）：展示生成结果图片
```

---

## 4. 现有接口变更说明

### 4.1 无需变更的接口

| 接口 | 说明 |
|------|------|
| `GET /skill/detail/{skillId}` | 保持不变，但建议 `render` 步骤的 `promptTemplate` 可配置为 null 或空字符串 |
| `POST /aiImage/quicklyCreate/generations` | 保持不变，前端用后端返回的 `prompt` 调用 |
| `GET /aiImage/quicklyCreate/{id}` | 保持不变 |
| `GET /skill/flow/data-search` | 保持不变 |

### 4.2 废弃的接口（前端不再调用）

| 接口 | 说明 |
|------|------|
| `POST /web/agentScopeChat/chat/stream/completion` | 前端不再直接调用，改为调用 `/skill/flow/generate-prompt` |

> 注：如果其他模块仍在使用 `/web/agentScopeChat/chat/stream/completion`，则保留该接口，前端向导页面不再直接调用。

---

## 5. 数据字段映射参考

### 5.1 静态数据源（dataSourceType=1）

前端直接传递 `dataSourceConfig` 中的选项数据。

### 5.2 动态数据源（dataSourceType=4）

前端调用 `/skill/flow/data-search` 获取数据后，将选中的完整数据映射为 `ISelectedOption`：

| SkillFlowDataVO 字段 | ISelectedOption 字段 | 说明 |
|---------------------|---------------------|------|
| `uniqueCode` | `value` | 选项唯一值 |
| `name` | `label` | 显示名称 |
| `describes` | `desc` | 描述文案 |
| `poster` | `preview` | 预览图片 |
| `salePrice` | `salePrice` | 金额 |
| `content` | `content` | 内容 |

---

## 6. 注意事项

1. **promptTemplate 字段**：`render` 步骤的 `promptTemplate` 可以为空或 null，前端不再依赖该字段
2. **chatId 管理**：首次调用 `chatId` 为 null，后端创建会话后返回；后续前端复用该 `chatId`
3. **SSE 格式**：参考现有 `/web/agentScopeChat/chat/stream/completion` 的 SSE 格式
4. **错误处理**：SSE 流中可通过 `event: error` 返回错误信息
5. **并发控制**：同一用户的同一技能，建议限制同时只能有一个生成任务

---

## 7. 附录：前端数据结构定义（TypeScript）

```typescript
/** 提交表单 */
interface IWizardSubmitForm {
  skillId: string
  chatId: number | null
  steps: IWizardStepForm[]
}

/** 步骤表单 */
interface IWizardStepForm {
  /** 流程节点ID（数据库主键） */
  flowId: number
  /** 步骤编码（业务标识） */
  stepCode: string
  /** 步骤名称 */
  stepName: string
  /** 该步骤的所有字段选择 */
  fieldValues: IWizardFieldValue[]
}

/** 字段值 */
interface IWizardFieldValue {
  field: string
  label: string
  value: string | string[]
  selectedOptions: ISelectedOption[]
}

/** 选中选项详情 */
interface ISelectedOption {
  value: string
  label: string
  desc?: string
  icon?: string
  preview?: string
  salePrice?: number
  content?: string
}
```
