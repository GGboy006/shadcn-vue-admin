# AI 工具向导容器页面需求文档

## 1. 页面概述

### 1.1 页面定位
- **页面路径**: `/apps/:skillId`
- **文件位置**: `src/pages/apps/[skillId].vue`
- **目标用户**: 主要C 端商户用户（管理员也可用）
- **页面性质**: 多步骤向导容器，引导用户通过选择/输入完成 AI 内容生成

### 1.2 核心流程
用户点击 AI 工具卡片 → 进入向导页面 → 按步骤选择/输入 → AI 生成内容 → 查看/下载结果

---

## 2. 接口定义

### 2.1 已有接口（需新增封装）

#### 2.1.1 获取技能详情（含流程节点）
```
GET /skill/detail/{skillId}
```
**响应**: `BaseResponse<SkillDetailVO>`

**SkillDetailVO 扩展字段**:
```typescript
interface ISkillDetail extends ISkill {
  /** 分配状态：1=生效中，2=暂停，3=过期 */
  assignStatus: SkillAssignStatus
  /** 工具模式：1=单次对话，2=流程式向导 */
  toolMode: SkillToolMode
  /** 流程节点列表 */
  flows: ISkillFlow[]
}
```

**ISkillFlow 流程节点**:
```typescript
interface ISkillFlow {
  /** 流程节点ID */
  flowId: number
  /** 所属技能ID */
  skillId: number
  /** 步骤编码（唯一标识） */
  stepCode: string
  /** 步骤名称 */
  stepName: string
  /** 步骤排序 */
  stepOrder: number
  /** 动作类型：1=用户选择 2=AI生成 3=用户输入 4=确认/结束 */
  actionType: 1 | 2 | 3 | 4
  /** 步骤引导文案（AI气泡话术） */
  description: string
  /** Prompt模板，支持占位符如 ${scene} */
  promptTemplate: string
  /** 步骤配置（含多字段定义） */
  stepConfig: IStepConfig | null
  /** 默认下一步编码，null表示流程结束 */
  nextStepCode: string | null
  /** 分支规则（JSON）：根据当前选择跳不同步骤 */
  branchRule: string | null  // JSON字符串，需解析
  /** 是否必填：1=是 0=否 */
  isRequired: 1 | 0
  /** 状态：1=启用 2=禁用 */
  status: 1 | 2
}
```

**IStepConfig 步骤配置**:
```typescript
interface IStepConfig {
  /** 步骤整体布局：single=单字段 grouped=多字段组 list/grid=兼容旧格式 none=无选择 */
  layout: 'single' | 'grouped' | 'list' | 'grid' | 'none'
  /** 步骤标题 */
  title: string
  /** 字段配置数组 */
  fields: IStepField[]
}
```

**IStepField 步骤字段**:
```typescript
interface IStepField {
  /** 字段名（存入选项结果的key，如 scene/dishes/style） */
  field: string
  /** 字段显示标签 */
  label: string
  /** 输入类型：1=单选 2=多选 3=文本 4=图片上传 */
  inputType: number
  /** 是否必填 */
  required: boolean
  /** 选项渲染方式：list=垂直列表 grid=网格卡片 */
  layout: 'list' | 'grid'
  /** 数据来源：0=无 1=静态JSON 4=内置数据源 */
  dataSourceType: 0 | 1 | 4
  /** 具体数据配置：静态数组 或 {builtin, limit} 对象 */
  dataSourceConfig: IChoiceOption[] | { builtin: string, limit?: number, show_fields?: string[] }
}
```

#### 2.1.2 流程式对话（非流式）
```
POST /agentScopeChat/flow/completion
Content-Type: application/json

{
  "skillId": "123",           // 技能ID
  "chatId": null,             // 首次为空，后端创建新会话
  "steps": [                  // 所有步骤的用户选择数据
    {
      "flowId": 1,
      "stepCode": "scene",
      "stepName": "营销场景",
      "fieldValues": [
        {
          "field": "scene",
          "label": "营销场景",
          "value": "promotion",
          "selectedOptions": [
            { "value": "promotion", "label": "促销活动" }
          ]
        }
      ]
    }
  ]
}
```
**响应**: `BaseResponse<FlowCompletionVO>`

**FlowCompletionVO**:
```typescript
interface IFlowCompletionVO {
  /** 会话ID */
  chatId: number
  /** AI文本回复内容 */
  aiContent: string
  /** 图片生成记录ID */
  imageGenerationId: number
  /** 图片生成状态：0-生成中 1-成功 2-失败 */
  imageStatus: 0 | 1 | 2
  /** 用户消息ID */
  userMessageId: string
  /** AI消息ID */
  aiMessageId: string
}
```

**说明**: 前端提交完整表单给后端，后端生成优化 prompt 并启动图片生成，返回 `aiContent` + `imageGenerationId` + `imageStatus`。`aiContent` 用于前端打字机效果展示。

#### 2.1.3 速创平台图片生成（后端已集成）

> **注意**: 图片生成功能已由后端在 `/agentScopeChat/flow/completion` 中自动触发，前端**无需**单独调用此接口。前端只需使用返回的 `imageGenerationId` 轮询查询结果。

```
POST /aiImage/quicklyCreate/generations
Content-Type: application/json

{
  "chatId": 123,
  "prompt": "...",
  "model": "",
  "size": "auto",
  "urls": []
}
```
**响应**: `BaseResponse<AIImageGenerationVO>`

**AIImageGenerationVO**:
```typescript
interface IAIImageGeneration {
  id: number              // 生成记录ID
  chatId: number          // 会话ID
  status: 0 | 1 | 2       // 0=生成中 1=成功 2=失败
  imageUrl: string        // OSS图片地址（status=1时有效）
  prompt: string          // 提示词
  taskId: string          // 外部平台任务ID
}
```

#### 2.1.4 速创平台结果查询
```
GET /aiImage/quicklyCreate/{id}
```
**响应**: `BaseResponse<AIImageGenerationVO>`

#### 2.1.5 技能流程数据查询（动态数据源）
```
GET /skill/flow/data-search?dataSourceBuiltin={builtin}&merchantCode={merchantCode}
```
**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `dataSourceBuiltin` | string | 是 | 内置数据源标识（如 `merchant_goods`） |
| `merchantCode` | string | 是 | 当前登录商户的 merchantCode |

**响应**: `BaseResponse<List<SkillFlowDataVO>>`

**SkillFlowDataVO**:
```typescript
interface ISkillFlowDataVO {
  /** 商户标识 */
  merchantCode: string
  /** 唯一标识（作为选项 value） */
  uniqueCode: string
  /** 名称（作为选项 label） */
  name: string
  /** 封面图URL（作为选项 preview） */
  poster: string
  /** 简介（作为选项 desc） */
  describes: string
  /** 金额 */
  salePrice: number
  /** 内容 */
  content: string
}
```

**字段映射规则**（转换为 IChoiceOption）:
| SkillFlowDataVO 字段 | IChoiceOption 字段 | 说明 |
|---------------------|-------------------|------|
| `uniqueCode` | `value` | 选项唯一值 |
| `name` | `label` | 显示名称 |
| `describes` | `desc` | 描述文案 |
| `poster` | `preview` | 预览图片（grid 布局用） |
| `salePrice` | - | 可附加到 desc 中展示 |

---

### 2.2 接口调用时序图

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
渲染第二步（content）：展示 AI 话术 + 选项卡片
    │
    ▼
用户选择菜品/促销/时间 → 点击下一步
    │
    ▼
渲染第三步（template）：展示 AI 话术 + 风格预览卡片
    │
    ▼
用户选择 "喜庆红金风" → 进入 AI 生成步骤
    │
    ▼
渲染第四步（render）：展示 aiContent 打字机效果 + "生成中..."
    │
    ├──→ POST /agentScopeChat/flow/completion
    │      提交完整向导表单（skillId + chatId + steps）
    │      ←── 返回 { aiContent, imageGenerationId, imageStatus }
    │
    ├──→ 轮询 GET /aiImage/quicklyCreate/{imageGenerationId}
    │      每 3 秒查询一次
    │      ←── status: 0（继续轮询）/ 1（成功）/ 2（失败）
    │
    ▼
渲染第五步（completed）：自动跳转，展示生成结果图片
    │
    ▼
用户可：重新生成 / 下载图片 / 返回修改
```

---

## 3. 页面设计

### 3.1 整体布局

```
┌─────────────────────────────────────────────────────────┐
│  ← 返回          节日海报（技能名称）         [进度指示器]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🤖 AI头像                                       │   │
│  │                                                 │   │
│  │  嗨！我是活动策划师小策。你想做什么类型的营销？    │   │
│  │  我来帮你规划！                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │     🎉      │  │     ☀️      │  │     🆕      │    │
│  │   节日海报   │  │   日常营业   │  │   上新推广   │    │
│  │  春节/端午   │  │  早安图     │  │  新品上市   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │     🎁      │  │     ❤️      │                      │
│  │   促销活动   │  │   口碑传播   │                      │
│  │  满减/折扣   │  │  顾客好评   │                      │
│  └─────────────┘  └─────────────┘                      │
│                                                         │
│              [        下一步        ]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 布局规范

- **外层容器**: 居中布局，最大宽度 `max-w-3xl mx-auto`
- **背景**: 使用 `bg-muted/30` 或渐变背景，营造沉浸式体验
- **返回按钮**: 左上角，文字 + 箭头图标
- **技能名称**: 顶部居中，大标题
- **进度指示器**: 顶部右侧或标题下方，显示当前步骤 / 总步骤

---

## 4. 组件设计

### 4.1 组件清单

| 组件名 | 文件路径 | 职责 |
|--------|----------|------|
| `WizardContainer` | `[skillId].vue` | 向导容器，管理步骤流转、状态、数据收集 |
| `AIChatBubble` | `components/ai-chat-bubble.vue` | AI 对话气泡，展示引导文案 |
| `ChoiceGrid` | `components/choice-grid.vue` | 选项网格布局（单选/多选） |
| `ChoiceList` | `components/choice-list.vue` | 选项列表布局（垂直排列） |
| `StylePreviewCard` | `components/style-preview-card.vue` | 带预览图的视觉风格卡片 |
| `GenerationLoading` | `components/generation-loading.vue` | AI 生成 Loading 动画 |
| `ResultPreview` | `components/result-preview.vue` | 生成结果展示（图片 + 操作按钮） |
| `StepIndicator` | `components/step-indicator.vue` | 步骤进度指示器 |

### 4.1.1 布局与数据字段映射规则

**创建流程时的字段使用规范**：

| field.layout | 支持字段 | 字段优先级 | 说明 |
|-------------|---------|-----------|------|
| `grid` | `preview` / `icon` | `preview` > `icon` | 网格卡片，顶部显示预览图片；无图片时 fallback 显示 emoji 图标 |
| `list` | `icon` only | `icon` | 垂直列表，左侧显示 emoji 图标；**不支持 `preview`** |

**使用建议**：
- **风格/场景选择**（需要视觉预览）→ 选 `grid` 布局，填 `preview` 字段
- **普通文字选项**（无需图片）→ 选 `list` 布局，填 `icon` 字段

### 4.2 核心组件详细设计

#### 4.2.1 WizardContainer（向导容器）

**状态管理**:
```typescript
interface WizardState {
  // 技能信息
  skillId: string
  skillDetail: ISkillDetail | null
  
  // 步骤控制
  currentStepIndex: number           // 当前步骤索引
  currentStepCode: string            // 当前步骤编码
  completedStepCodes: string[]       // 已完成步骤编码列表
  
  // 用户数据收集
  userChoices: Record<string, any>   // { scene: 'festival', dishes: 'xxx', ... }
  stepForms: IWizardStepForm[]       // 提交给后端的完整表单数据
  
  // AI 生成状态
  chatId: number | null              // 会话ID
  isGenerating: boolean              // 是否生成中
  generationId: number | null        // 生成记录ID
  generatedImageUrl: string | null   // 生成结果图片URL
  generationStatus: 0 | 1 | 2 | null // 生成状态
  generationError: string | null     // 生成错误信息
  
  // AI 生成内容（非流式，使用打字机效果展示）
  aiContent: string                  // AI 文本回复内容
  isProcessing: boolean              // 是否处理中
}
```

**核心方法**:
```typescript
// 初始化：获取技能详情，定位到第一步
function initWizard(skillId: string)

// 进入指定步骤
function goToStep(stepCode: string)

// 用户做出选择（同时记录完整选项信息到 stepForms）
function makeChoice(field: string, value: string, option?: IChoiceOption)

// 点击下一步
function handleNext()

// 点击上一步（可选）
function handleBack()

// 流程式对话：自动调用，获取 aiContent 和图片生成任务ID
async function streamPrompt()

// 图片生成查询：轮询检查生成状态（后端已集成图片生成）
async function pollGenerationResult(id: number)

// 重新生成
function handleRegenerate()
```

#### 4.2.2 AIChatBubble（AI 对话气泡）

**Props**:
```typescript
interface Props {
  content: string        // 引导文案（description）
  avatar?: string        // AI 头像URL（默认使用技能icon）
  isTyping?: boolean     // 是否正在输入（打字机效果）
}
```

**设计要点**:
- 左侧头像 + 右侧气泡的经典聊天布局
- 气泡使用圆角卡片，背景色与页面形成对比
- 支持打字机效果（逐字显示文案）
- 头像使用技能 icon， fallback 为默认 AI 图标

#### 4.2.2a TypewriterText（打字机效果文本）

**职责**: 将 `aiContent` 以打字机效果逐字展示在 AI 生成步骤中

**使用方式**:
```typescript
// 在 [skillId].vue 中使用
const { displayText: typewriterText, isTyping: isTypewriterTyping } = useTypewriter(wizard.aiContent, 30)
```

**设计要点**:
- 监听 `aiContent` 变化，自动开始打字
- 30ms/字 的打字速度
- 打字过程中显示闪烁光标 `▍`
- 打字完成后光标消失

#### 4.2.3 ChoiceGrid / ChoiceList（选项组件）

**Props**:
```typescript
interface Props {
  options: ChoiceOption[]    // 选项列表
  layout: 'grid' | 'list'    // 布局方式
  selectionMode: 'single' | 'multiple'  // 单选/多选
  selectedValue: string | string[] | null  // 当前选中值
}

interface ChoiceOption {
  value: string      // 选项值
  label: string      // 显示标签
  desc?: string      // 描述文案
  icon?: string      // 图标/emoji
  preview?: string   // 预览图URL（视觉风格用）
}
```

**设计要点**:
- **Grid 布局**: 2-3 列卡片，适合选项较少且有图标的情况
- **List 布局**: 垂直排列，适合选项较多或需要详细描述的情况
- **选中状态**: 边框高亮 + 勾选图标 + 背景色变化
- **视觉风格卡片**: 带预览图的大卡片，图片上方叠加文字标签

#### 4.2.4 GenerationLoading（生成 Loading）

**设计要点**:
- 居中展示，占据主要视觉区域
- 动态 Loading 动画（如：图片轮廓逐渐填充效果）
- 文案："正在为您生成海报..." / "AI 正在构思创意..."
- 可选：展示当前步骤的摘要信息（已选择的参数）
- **注意**: 当前实现中，AI 生成步骤主要展示 `aiContent` 的打字机效果 + "生成中..." 按钮状态，Loading 动画作为辅助

#### 4.2.5 ResultPreview（结果预览）

**设计要点**:
- 大图展示生成的海报
- 下方操作按钮区：
  - 「重新生成」- 回到 render 步骤重新触发
  - 「下载图片」- 打开 imageUrl 下载
  - 「返回修改」- 回到上一步修改选择
- 可选：展示生成参数摘要（使用了什么场景、风格等）

---

## 5. 步骤渲染逻辑

### 5.1 根据 actionType + inputType 渲染对应组件

| actionType | inputType | 渲染组件 | 用户交互 |
|------------|-----------|----------|----------|
| 1=用户选择 | 1=单选 | `ChoiceGrid` 或 `ChoiceList` | 点击选择一项 |
| 1=用户选择 | 2=多选 | `ChoiceGrid` 或 `ChoiceList` | 点击选择多项 |
| 1=用户选择 | 3=文本输入 | `TextInput` | 输入文本 |
| 1=用户选择 | 4=图片上传 | `ImageUpload` | 上传图片 |
| 2=AI生成 | 5=无 | `TypewriterText` + `GenerationLoading` → 自动跳转 `ResultPreview` | 自动执行，展示打字机效果，轮询成功后自动跳转 |
| 4=确认/结束 | 5=无 | `ResultPreview` | 查看结果，操作按钮 |

**AI 生成步骤（actionType=2）交互流程**:
1. 用户进入 AI 生成步骤，自动触发 `streamPrompt()`
2. 展示 `aiContent` 打字机效果 + "生成中..." 按钮
3. 后端异步生成图片，前端轮询查询状态
4. 检测到 `status === 1`（成功），自动调用 `goToNextStep()` 跳转完成页面
5. 用户无需点击"查看效果"，全程自动完成

### 5.2 布局类型映射

根据 `stepConfig.layout` 字段决定整体渲染方式：

| layout | 说明 | fields数量 | 适用场景 |
|--------|------|-----------|----------|
| `single` | 单字段步骤，不显示字段标签 | 1 | 场景选择、风格选择 |
| `grouped` | 多字段分组，显示字段标签 | >1 | 内容选择（菜品+促销+时间） |
| `list` | 兼容旧格式，同 single | 1 | 场景选择 |
| `grid` | 兼容旧格式，同 single | 1 | 风格选择 |
| `none` | 无选择区域 | 0/null | 生成步骤、完成步骤 |

每个 field 的 `layout` 决定该字段选项的渲染方式：

| field.layout | 说明 | 适用场景 |
|-------------|------|----------|
| `list` | 垂直列表，每项带图标+文字 | 场景选择、促销信息 |
| `grid` | 网格卡片，可带预览图 | 菜品选择、视觉风格 |

---

## 6. 数据源处理

### 6.1 静态数据源（field.dataSourceType = 1）

`field.dataSourceConfig` 为选项数组，直接作为选项列表：

```json
[
  {"value":"festival","label":"节日海报","desc":"春节/端午/中秋等节日营销","icon":"🎉"},
  {"value":"daily","label":"日常营业","desc":"早安图/营业时间/天气问候","icon":"☀️"}
]
```

### 6.2 内置数据源（field.dataSourceType = 4）

`field.dataSourceConfig` 包含内置数据源标识：

```json
{"builtin": "merchant_goods", "limit": 50, "show_fields": ["name","price","image"]}
```

**处理逻辑**:
1. 识别 `builtin` 字段值
2. 调用对应的数据获取接口（预留扩展）
3. 将返回数据映射为 `ChoiceOption` 格式

**当前预留的内置数据源**:
| builtin 值 | 说明 | 返回格式 |
|-----------|------|----------|
| `merchant_goods` | 商户商品列表 | `{ name, price, image }[]` |
| `merchant_promo_rules` | 商户促销规则 | `{ value, label }[]` |

### 6.3 无数据源（field.dataSourceType = 0）

不渲染选择组件，直接展示 AI 话术，自动进入下一步（如 render 步骤）。

### 6.4 数据结构示例

#### single 布局（单字段）
```json
{
  "stepConfig": {
    "layout": "single",
    "title": "你想做什么类型的设计？",
    "fields": [
      {
        "field": "scene",
        "label": "营销场景",
        "inputType": 1,
        "required": true,
        "layout": "list",
        "dataSourceType": 1,
        "dataSourceConfig": [
          {"value":"festival","label":"节日海报","desc":"春节/端午/中秋等节日营销","icon":"🎉"},
          {"value":"daily","label":"日常营业","desc":"早安图/营业时间/天气问候","icon":"☀️"}
        ]
      }
    ]
  }
}
```

#### grouped 布局（多字段）
```json
{
  "stepConfig": {
    "layout": "grouped",
    "title": "选择要展示的内容",
    "fields": [
      {
        "field": "dishes",
        "label": "选择菜品",
        "inputType": 1,
        "required": true,
        "layout": "grid",
        "dataSourceType": 4,
        "dataSourceConfig": {"builtin": "merchant_goods", "limit": 50}
      },
      {
        "field": "promo",
        "label": "促销信息",
        "inputType": 1,
        "required": false,
        "layout": "list",
        "dataSourceType": 4,
        "dataSourceConfig": {"builtin": "merchant_promo_rules"}
      },
      {
        "field": "time",
        "label": "时间信息",
        "inputType": 1,
        "required": true,
        "layout": "list",
        "dataSourceType": 1,
        "dataSourceConfig": [
          {"value":"now","label":"立即开始"},
          {"value":"week","label":"本周有效"}
        ]
      }
    ]
  }
}
```

#### none 布局（无选择）
```json
{
  "stepConfig": null
}
```

---

## 7. Prompt 模板处理

### 7.1 Prompt 生成职责转移

> **重要变更**: Prompt 生成已由后端接管。前端只需提交完整表单数据，后端根据 `stepForms` 自动生成优化后的 prompt 并触发图片生成。

前端提交的数据结构：
```typescript
interface IWizardSubmitForm {
  skillId: string
  chatId: number | null
  steps: IWizardStepForm[]
}

interface IWizardStepForm {
  flowId: number
  stepCode: string
  stepName: string
  fieldValues: IWizardFieldValue[]
}

interface IWizardFieldValue {
  field: string
  label: string
  value: string | string[]
  selectedOptions: ISelectedOption[]
}
```

### 7.2 表单数据收集

用户每做出一个选择，`makeChoice` 同时更新：
1. `userChoices` — 简化的键值对，用于步骤验证和分支判断
2. `stepForms` — 完整的表单结构，用于提交给后端

**示例**:
```typescript
// 用户选择 "促销活动"
makeChoice('scene', 'promotion', { value: 'promotion', label: '促销活动' })

// userChoices 变为 { scene: 'promotion' }
// stepForms 中当前步骤的 fieldValues 添加完整选项信息
```

### 7.3 后端返回 aiContent

后端返回的 `aiContent` 是 AI 生成的文本内容，前端用打字机效果展示：
```
请根据以下信息生成宣传图片：

【营销场景】
营销场景：促销活动（满减/折扣/会员日/充值送）

【展示内容】
选择菜品：红烧牛肉面（¥30 · 红烧牛肉面）
促销信息：满50减20（一次消费50减20元）
时间信息：立即开始

【视觉风格】
视觉风格：高端黑金风（适合高端菜品）

【生成海报】
```

---

## 8. 流式对话处理

### 8.1 非流式对话处理

```typescript
// 调用流程式对话接口（非流式）
const result = await mockFlowCompletion(submitForm)
// 或真实接口：await flowCompletion(submitForm)

if (result.code === 0 && result.data) {
  chatId.value = result.data.chatId
  aiContent.value = result.data.aiContent
  
  // 后端已启动图片生成，保存任务ID用于轮询
  if (result.data.imageGenerationId > 0) {
    generationId.value = result.data.imageGenerationId
  }
  
  // 如果图片已经生成成功（同步返回）
  if (result.data.imageStatus === 1) {
    generationStatus.value = 1
    isGenerating.value = false
  }
  // 如果图片生成失败
  else if (result.data.imageStatus === 2) {
    generationStatus.value = 2
    generationError.value = '图片生成失败'
    isGenerating.value = false
  }
  // imageStatus === 0 继续轮询
}
```

### 8.2 aiContent 打字机效果展示

- 后端一次性返回完整 `aiContent`
- 前端使用 `useTypewriter` composable 逐字展示
- 打字速度：30ms/字
- 打字过程中显示闪烁光标 `▍`
- 打字完成后光标消失，保持显示完整文本

---

## 9. 图片生成轮询

### 9.1 轮询逻辑

```typescript
// 使用 TanStack Query 轮询（真实接口模式）
const { data: generationResult } = useGetImageGenerationResultQuery(pollId, generationStatus)

// 或使用 setInterval 手动轮询（Mock 模式）
let pollTimer: ReturnType<typeof setInterval> | null = null

watch(generationId, (id) => {
  // 清除旧定时器
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  
  if (!id || generationStatus.value === 1 || generationStatus.value === 2)
    return
  
  // 启动轮询（3秒间隔）
  pollTimer = setInterval(async () => {
    const result = await mockImageGenerationQuery(id)
    // 或真实接口：await apiFetch(`/aiImage/quicklyCreate/${id}`)
    
    if (result.data.status === 1) {
      // 生成成功，自动跳转完成页面
      generationStatus.value = 1
      generatedImageUrl.value = result.data.imageUrl
      isGenerating.value = false
      if (pollTimer) clearInterval(pollTimer)
      goToNextStep()  // 自动跳转
    } else if (result.data.status === 2) {
      // 生成失败
      generationStatus.value = 2
      generationError.value = '图片生成失败'
      isGenerating.value = false
      if (pollTimer) clearInterval(pollTimer)
    }
    // status === 0 继续轮询
  }, 3000)
})
```

### 9.2 状态展示

| 状态 | 展示 |
|------|------|
| 生成中 (0) | Loading 动画 + "正在生成..." |
| 成功 (1) | 展示图片 + 操作按钮 |
| 失败 (2) | 错误提示 + 「重新生成」按钮 |

---

## 10. 分支规则（预留）

### 10.1 branchRule 格式

```json
{
  "field": "scene",
  "conditions": [
    { "value": "festival", "nextStep": "festival_template" },
    { "value": "daily", "nextStep": "daily_template" }
  ]
}
```

### 10.2 处理逻辑

1. 用户做出选择后，检查当前步骤的 `branchRule`
2. 如果存在分支规则，根据用户选择匹配条件
3. 使用条件中的 `nextStep` 替代默认的 `nextStepCode`

**当前实现**: 预留字段，默认使用 `nextStepCode`。

---

## 11. 状态持久化（可选）

### 11.1 本地存储

用户刷新页面后，可恢复之前的进度：

```typescript
// 使用 localStorage 存储
const STORAGE_KEY = `wizard_${skillId}`

// 保存状态
localStorage.setItem(STORAGE_KEY, JSON.stringify({
  currentStepCode,
  userChoices,
  chatId,
  generationId
}))

// 恢复状态
const saved = localStorage.getItem(STORAGE_KEY)
if (saved) {
  const state = JSON.parse(saved)
  // 恢复到对应步骤
}
```

### 11.2 清理状态

- 流程完成后清理 localStorage
- 用户点击「重新开始」时清理

---

## 12. 错误处理

| 场景 | 处理方式 |
|------|----------|
| 获取技能详情失败 | 展示错误页面 + 「重试」按钮 |
| 流式对话连接失败 | Toast 提示 + 「重试」按钮 |
| 图片生成接口失败 | Toast 提示 + 「重试」按钮 |
| 轮询超时 | 提示超时 + 「重新生成」按钮 |
| 生成失败 (status=2) | 提示失败原因 + 「重新生成」按钮 |
| 用户未选择必填项 | 禁用下一步按钮 / 提示「请完成选择」 |
| 动态数据源获取失败 | Toast 提示 + 展示空状态 / 「重试」按钮 |

---

## 13. 动画与交互

### 13.1 页面进入动画
- 步骤切换时，内容区域淡入 + 轻微上移
- AI 气泡使用打字机效果逐字显示

### 13.2 选项选择动画
- 选中时：边框颜色变化 + 缩放反馈
- 多选时：勾选图标动画

### 13.3 生成过程动画
- Loading 使用骨架屏或创意动画
- 进度条或步骤提示（"正在构思..." → "正在绘制..." → "即将完成..."）

### 13.4 结果展示动画
- 图片加载完成后，从模糊到清晰的淡入效果
- 操作按钮依次出现

---

## 14. 响应式设计

| 断点 | 布局调整 |
|------|----------|
| Desktop (≥1024px) | 选项网格 3 列，图片预览大尺寸 |
| Tablet (768-1023px) | 选项网格 2 列，保持居中布局 |
| Mobile (<768px) | 选项网格 1-2 列，全宽按钮，底部固定操作区 |

---

## 15. 开发顺序建议

### Phase 1: 基础框架
1. 创建 `[skillId].vue` 页面框架
2. 封装 `GET /skill/detail/{skillId}` 接口
3. 实现步骤流转逻辑（WizardContainer）
4. 实现 AIChatBubble 组件

### Phase 2: 用户选择步骤
5. 实现 ChoiceGrid / ChoiceList 组件
6. 解析 stepConfig 静态数据源
7. 实现用户选择数据收集（支持多字段）

### Phase 2.5: 动态数据源支持
7.5. 封装 `GET /skill/flow/data-search` 接口
7.6. 实现 `useSkillFlowData` / `useSkillFlowDataByBuiltin` 组合式函数（动态数据获取 + 映射转换）
7.7. 在 `use-wizard` 中集成动态数据源解析（`dataSourceType=4`）

> **实现注意**：Vue Query 的 `useQuery` 必须在 `setup()` 顶层调用，禁止在 `computed()` / `watch()` 回调中动态创建。因此 `use-wizard.ts` 在 `setup()` 顶层预创建所有已知 builtin 的查询（`merchant_goods`、`merchant_promo_rules`），通过 `ref` 控制查询激活。如需支持新的 builtin 类型，需在 `use-wizard.ts` 中添加对应的预创建查询。

### Phase 3: AI 生成流程
8. 封装 `POST /agentScopeChat/flow/completion` 接口（非流式）
9. 实现 `aiContent` 打字机效果展示（`useTypewriter` composable）
10. 实现轮询查询逻辑（`useGetImageGenerationResultQuery` 或手动轮询）
11. 实现轮询成功后自动跳转完成页面

### Phase 4: 结果展示
12. 实现 ResultPreview 组件
13. 实现重新生成 / 下载功能

### Phase 5: 优化
14. 添加动画效果
15. 实现本地状态持久化
16. 响应式适配
17. 错误处理完善

---

## 16. 文件结构

```
src/pages/apps/
├── [skillId].vue                    # 向导容器主页面
├── [skillId]-design.md              # 本需求文档
├── index.vue                        # AI工具列表页（已有）
├── components/
│   ├── app-card.vue                 # 工具卡片（已有）
│   ├── ai-chat-bubble.vue           # AI对话气泡
│   ├── choice-grid.vue              # 选项网格
│   ├── choice-list.vue              # 选项列表
│   ├── style-preview-card.vue       # 风格预览卡片
│   ├── generation-loading.vue       # 生成Loading
│   ├── result-preview.vue           # 结果预览
│   └── step-indicator.vue           # 步骤指示器
├── composables/
│   ├── use-wizard.ts                # 向导逻辑组合式函数
│   ├── use-skill-flow-data.ts       # 技能流程动态数据获取
│   ├── use-typewriter.ts            # 打字机效果（aiContent 展示）
│   └── use-mock-flow.ts             # Mock 数据（本地静态返回）
└── types/
    └── wizard.types.ts              # 向导相关类型定义
```

---

## 17. 类型定义补充

```typescript
// src/pages/apps/types/wizard.types.ts

/** 向导状态 */
export interface IWizardState {
  skillId: string
  skillDetail: ISkillDetail | null
  currentStepIndex: number
  currentStepCode: string
  completedStepCodes: string[]
  userChoices: Record<string, any>
  stepForms: IWizardStepForm[]       // 提交给后端的完整表单数据
  chatId: number | null
  isGenerating: boolean
  generationId: number | null
  generatedImageUrl: string | null
  generationStatus: 0 | 1 | 2 | null
  generationError: string | null
  aiContent: string                  // AI 文本回复内容
  isProcessing: boolean              // 是否处理中
}

/** 选项数据 */
export interface IChoiceOption {
  value: string
  label: string
  desc?: string
  icon?: string
  preview?: string
}

/** 步骤配置 */
export interface IStepConfig {
  layout: 'single' | 'grouped' | 'list' | 'grid' | 'none'
  title: string
  fields: IStepField[]
}

/** 步骤字段 */
export interface IStepField {
  field: string
  label: string
  inputType: number
  required: boolean
  layout: 'list' | 'grid'
  dataSourceType: 0 | 1 | 4
  dataSourceConfig: IChoiceOption[] | { builtin: string, limit?: number, show_fields?: string[] }
}

/** 分支规则 */
export interface IBranchRule {
  field: string
  conditions: { value: string, nextStep: string }[]
}

/** 技能流程动态数据 VO */
export interface ISkillFlowDataVO {
  merchantCode: string
  uniqueCode: string
  name: string
  poster: string
  describes: string
  salePrice: number
  content: string
}

/** 流程式对话结果 VO */
export interface IFlowCompletionVO {
  chatId: number
  aiContent: string
  imageGenerationId: number
  imageStatus: 0 | 1 | 2
  userMessageId: string
  aiMessageId: string
}

/** 提交给后端的完整向导表单 */
export interface IWizardSubmitForm {
  skillId: string
  chatId: number | null
  steps: IWizardStepForm[]
}

/** 单个步骤的表单数据 */
export interface IWizardStepForm {
  flowId: number
  stepCode: string
  stepName: string
  fieldValues: IWizardFieldValue[]
}

/** 字段选择值 */
export interface IWizardFieldValue {
  field: string
  label: string
  value: string | string[]
  selectedOptions: ISelectedOption[]
}

/** 选中选项的完整信息 */
export interface ISelectedOption {
  value: string
  label: string
  desc?: string
  icon?: string
  preview?: string
  salePrice?: number
  content?: string
}
```

---

## 18. 注意事项

1. **skillId 类型**: 保持字符串类型，与路由参数一致
2. **数据结构变更**: flow 级别使用 `stepConfig`（对象），field 级别使用 `dataSourceConfig`，不再需要将 JSON 字符串解析为对象
3. **接口变更**: 已废弃 SSE 流式接口 `/agentScopeChat/chat/stream/completion`，改用非流式接口 `/agentScopeChat/flow/completion`
4. **内存泄漏**: 组件卸载时清理轮询定时器（`pollTimer`）
5. **图片加载**: 生成结果图片可能较大，使用懒加载和加载占位符
6. **并发控制**: 防止用户快速点击「下一步」导致状态混乱
7. **多字段验证**: `isCurrentStepValid` 需检查所有必填字段是否都已选择
8. **动态数据源**: `dataSourceType=4` 时，使用 `useSkillFlowData` 组合式函数获取数据，需传入当前登录用户的 `merchantCode`
9. **Mock 模式**: 当前使用 `use-mock-flow.ts` 本地静态 Mock 数据，切回真实接口时需恢复 `useFlowCompletionMutation` 和 `useGetImageGenerationResultQuery`
10. **自动跳转**: 轮询检测到 `status === 1` 时自动调用 `goToNextStep()`，用户无需点击"查看效果"
