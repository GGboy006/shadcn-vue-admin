# 流式对话页面设计文档（Type 1/2）

> 本文档与已实现代码存在冲突时，以 `src/pages/apps/stream.vue` 及 `src/pages/apps/composables/use-chat-stream.ts` 的当前实现为准。
> 当前已实现：基础流式对话、历史消息加载、会话列表路由、Markdown 增量渲染。
> 下一步：Phase 3 Agent 表单模式。

## 一、需求概述

为 AI 工具类型 1（Coze/扣子）和类型 2（Agent）开发流式对话页面，共用一套对话交互界面，根据技能类型动态调用不同详情接口和对话接口。

| 类型 | 名称 | 详情接口 | 特点 |
|------|------|---------|------|
| 1 | Coze（扣子） | `GET /aiCommon/cozeOnlineInfo?botId={thirdId}` | 支持开场白、推荐问题、快捷指令、背景图 |
| 2 | Agent | `GET /aiCommon/agent/detail/{thirdId}` | 支持表单模板（`promptTemplateList`）、问候语、提示词引导 |

## 二、路由与入口

### 2.1 路由参数

```
/apps/stream?chatId={chatId}&skillId={skillId}&thirdId={thirdId}&type={type}
```

| 参数 | 说明 |
|------|------|
| `chatId` | 已有会话 ID（从会话列表进入时携带） |
| `skillId` | 内部技能 ID |
| `thirdId` | 第三方平台 ID：Coze 的 botId / Agent 的 agentId |
| `type` | 1=Coze，2=Agent |

### 2.2 列表页跳转

```typescript
function openSkill(skill: ISkill) {
  if (skill.type === 3) {
    router.push(`/apps/${skill.skillId}`)
  }
  else {
    router.push(`/apps/stream?skillId=${skill.skillId}&thirdId=${skill.thirdId}&type=${skill.type}`)
  }
}
```

### 2.3 会话列表跳转

```typescript
function handleViewDetail(item: IConversation) {
  if (item.type === 1 || item.type === 2) {
    router.push(`/apps/stream?chatId=${item.chatId}&skillId=${item.skillId}&thirdId=${item.thirdId}&type=${item.type}`)
  }
  else {
    router.push(`/conversations/${item.chatId}`)
  }
}
```

## 三、文件结构（已实现 + 计划）

```
src/pages/apps/
├── index.vue                      # AI 工具列表（已修改跳转）
├── [skillId].vue                  # 类型 3 向导（现有）
├── stream.vue                     # 类型 1/2 流式对话（已实现）
├── composables/
│   └── use-chat-stream.ts         # 流式对话状态管理（已实现，Agent 表单提交需扩展传参）
├── components/                    # 计划新增
│   └── AgentPromptTemplateForm.vue # Agent 表单模板渲染
└── utils/                         # 计划新增
    └── prompt-template.ts         # templateForm 解析 + user_msg 占位符替换

src/components/chat/
├── StreamChatMessageList.vue      # 流式消息列表（已实现）
└── StreamMarkdownContent.vue      # 增量 Markdown 渲染（已实现）

src/services/api/
├── skill.api.ts                   # Agent/Coze 详情、消息列表、创建会话
└── conversation.api.ts            # 会话列表、消息类型定义
```

## 四、接口清单

### 4.1 Coze 详情

```http
GET /aiCommon/cozeOnlineInfo?botId={thirdId}
```

关键字段：
- `name` / `iconURL`：技能名称与图标
- `onboardingInfo.prologue`：开场白
- `onboardingInfo.suggestedQuestions`：推荐问题
- `cityQuickCommands`：城市业务快捷指令

### 4.2 Agent 详情

```http
GET /aiCommon/agent/detail/{thirdId}
```

关键字段：
- `name` / `icon`：技能名称与图标
- `greeting`：问候语（开场白）
- `promptGuideList`：提示词引导列表
- `promptTemplateList`：表单模板列表（关键）
- `mcpMethod`：Agent MCP 方法名，流式对话时传给后端
- `agentVisionList`：可视化能力列表（PPT/网页/Word，后续迭代）

### 4.3 AgentPromptTemplate

```typescript
interface AgentPromptTemplate {
  agentPromptTemplateId: number
  templateName: string       // 模板名称
  templateDesc: string       // 模板描述
  templateForm: string       // 表单 JSON 字符串（需解析）
  user_msg: string           // 提示词模板，含 {字段标签} 占位符
  subtitle: string           // 副标题
}
```

### 4.4 templateForm 格式

解析后结构：

```typescript
interface IPromptTemplateForm {
  form: IPromptTemplateField[]
  rules?: Record<string, any[]
}

interface IPromptTemplateField {
  prop: string              // 字段 key
  label: string             // 显示标签
  widthRatio?: number       // 宽度占比（1-4，对应 25%/50%/75%/100%）
  conditions?: {             // 显示条件
    when: string
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'include' | 'exclude'
    value: string
  }
  component: {
    name: 'input' | 'select'
    value?: string          // 示例值
    attrs: {
      type?: 'text' | 'textarea'
      placeholder?: string
      multiple?: boolean
      orginOptions?: Array<{ label: string, value: string }>
    }
  }
}
```

### 4.5 创建会话

```http
GET /aiCommon/createConversation?skillId={skillId}&role=user&content={content}&type={type}
```

注意：首次发送消息时调用，后端用首条消息作为会话标题，不真正发消息。

### 4.6 流式对话

```http
POST /aiChat/chat/stream/completion
Content-Type: application/json
Accept: text/event-stream
```

请求体：

```typescript
interface ChatCompletionDTO {
  chatId: string             // 会话 ID（字符串，避免精度丢失）
  aiChatType?: number        // 仅 Coze 传 201
  agentId?: string           // Agent 第三方 ID
  mcpMethod?: string         // Agent MCP 方法名
  aiChatMessages: Array<{
    role: string
    content: string
    skillId: string
    contentId?: string
  }>
}
```

SSE 事件：`[DATA]`、`[DONE]`、`[ERROR]`、`[FAILED]`、`[REASONING]`、`[REASONING_END]`。

### 4.7 历史消息

```http
GET /aiCommon/messageList?chatId={chatId}&pageNum=1&pageSize=100
```

## 五、核心实现要点（已确认）

1. **chatId 使用字符串**：前端所有 chatId、skillId、thirdId 均按字符串处理，避免 number 精度丢失。
2. **历史消息加载**：在 `use-chat-stream.ts` 内通过 `useGetMessageListQuery` 加载，仅在 `messages` 为空时回填。
3. **消息顺序**：`StreamChatMessageList` 使用 `flex-col-reverse` 布局，`stream.vue` 通过 `computed(() => [...messages.value].reverse())` 传入。
4. **Markdown 渲染**：AI 消息使用 `streaming-markdown` 库增量渲染，配合 `highlight.js` 代码高亮。
5. **首次创建会话**：`createConversation` 成功后，若 URL 已带 `chatId` 则优先保留，防止后端 number 精度丢失覆盖当前会话。

## 六、Phase 3：Agent 表单模式

### 6.1 触发条件

Agent（`type === 2`）详情返回的 `promptTemplateList` 非空，且当前没有任何消息时，在欢迎区渲染表单。

```typescript
const hasPromptTemplate = computed(() => {
  if (skillType.value !== 2) return false
  const agent = agentDetail.value?.data
  return agent?.promptTemplateList && agent.promptTemplateList.length > 0
})
```

### 6.2 表单渲染

新增 `AgentPromptTemplateForm.vue`：

- Props: `template: AgentPromptTemplate`
- Emits: `submit(content: string)`
- 解析 `templateForm` 为字段配置
- 使用 `vee-validate` + `zod` 做校验
- 支持字段类型：
  - `input` + `text` → `<UiInput />`
  - `input` + `textarea` → `<UiTextarea />`
  - `select` + 非 grid → `<Select />`
  - `select` + grid + multiple → Checkbox group
  - `select` + grid + 单选 → Radio group
- 支持条件显示（`conditions`）
- 支持联动清空（选择变化后清空依赖字段）
- 提供"示例"和"清空"按钮

### 6.3 提示词生成

用户提交后，根据 `user_msg` 模板和表单值生成最终 prompt：

```typescript
function replacePlaceholders(
  template: string,
  fields: IPromptTemplateField[],
  formData: Record<string, any>,
): string {
  // 1. 按 label 建立映射
  // 2. 将模板中 {字段标签} 替换为实际值
  // 3. 若某字段无值，连同其前面/后面的分隔符一起移除
}
```

### 6.4 表单提交到对话

在 `stream.vue` 中：

```typescript
function handleTemplateSubmit(content: string) {
  sendMessage(content)
}
```

### 6.5 Agent 流式参数扩展

`use-chat-stream.ts` 的 `sendMessage` 增加可选参数：

```typescript
interface SendMessageOptions {
  agentId?: string
  mcpMethod?: string
}

async function sendMessage(content: string, options?: SendMessageOptions)
```

`doStreamCompletion` 请求体增加：

```typescript
{
  chatId: chatId.value,
  aiChatType: skillType.value === 1 ? 201 : undefined,
  agentId: options?.agentId,
  mcpMethod: options?.mcpMethod,
  aiChatMessages: buildChatMessages(),
}
```

### 6.6 页面展示逻辑

```vue
<StreamChatMessageList
  :messages="displayMessages"
  :streaming="isStreaming"
  empty-text=""
>
  <template #header>
    <!-- Agent 表单模式 -->
    <AgentPromptTemplateForm
      v-if="skillType === 2 && hasPromptTemplate && messages.length === 0"
      :template="agentDetail?.data?.promptTemplateList[0]"
      @submit="handleTemplateSubmit"
    />
    <!-- Coze 欢迎区 -->
    <CozeWelcome
      v-else-if="skillType === 1 && messages.length === 0"
      ...
    />
    <!-- Agent 普通欢迎区 -->
    <AgentWelcome
      v-else-if="skillType === 2 && messages.length === 0"
      ...
    />
  </template>
</StreamChatMessageList>
```

### 6.7 待确认事项

1. 当前项目 Agent 详情接口是否已返回 `mcpMethod`？如未返回，需后端补充或在本地根据 `agentId` 映射。
2. 表单提交后是否保留表单区域可供再次填写？（参考项目提交后隐藏输入框）
3. 多个 `promptTemplate` 之间是否需要 Tab 切换，还是只取第一个？

## 七、开发阶段

```
Phase 1：基础流式对话 ✅
Phase 2：历史消息与会话路由 ✅
Phase 3：Agent 表单模式 🚧
  ├── 扩展 Agent 详情类型（mcpMethod、agentVisionList 等）
  ├── prompt-template.ts 解析与占位符替换工具
  ├── AgentPromptTemplateForm.vue 表单渲染
  ├── use-chat-stream.ts 扩展 agentId/mcpMethod 传参
  ├── stream.vue 集成表单提交
  └── 验证表单提交流式回复

Phase 4：Agent 可视化输出（后续迭代）
  ├── agentVisionList 并行生成
  ├── PPT/Word/网页预览与下载
  └── Preview 抽屉组件
```
