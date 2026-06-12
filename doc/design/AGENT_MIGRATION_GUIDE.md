# Agent 智能体功能完整迁移文档

> 目标：把 `AI图书馆员` 项目中的 Agent 智能体功能（表单生成提示词 + PPT/Word/网页生成）完整迁移到**已有 Coze 流式对话基础**的另一个项目中。
>
> 本文档包含接口字段、页面结构、组件拆分、状态管理、数据流、关键代码片段，可直接交给 AI 开发。

---

## 一、前置条件

另一个项目必须已经具备：

1. **Vue 3 + Vite + Pinia** 技术栈
2. **Coze 流式对话基础能力**：
   - 已有 `CreateChat` 创建会话
   - 已有 `stream/completion` SSE 流式对话
   - 已有 AI 消息 Markdown 渲染
3. **Element Plus** UI 组件库 （我使用shadui组件库）
4. **marked + highlight.js** Markdown 渲染（我使用了基于marked的更优秀的仓库）
5. **Tailwind CSS** 或等效样式方案

> 如果以上基础能力不足，请先补全流式对话能力，再接入 Agent。

---

## 二、Agent 功能整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户界面层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Agent 列表页 │  │ Agent 详情页 │  │      对话页            │  │
│  │  Gpts.vue   │  │ServerCenter │  │   chat/index.vue        │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│         └────────────────┴──────────────────────┘                │
│                          │                                       │
│              点击 Agent / 提交表单 / 发起对话                      │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     业务逻辑层                               │ │
│  │  - GetAgentDetail 获取 Agent 详情                            │ │
│  │  - AgentForm 表单渲染 + 提示词生成                            │ │
│  │  - createTextSSE 流式对话（带 mcpMethod）                     │ │
│  │  - usePreviewNew 并行生成可视化内容                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     可视化输出层                             │ │
│  │  - PptPreviewNew.vue  PPT 生成 + 下载                         │ │
│  │  - HtmlPreview.vue    网页/Word 渲染 + 下载                   │ │
│  │  - PreviewNew.vue     右侧抽屉预览容器                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 三、后端接口清单

### 3.1 获取 Agent 详情

```http
GET /customer/aiChat/agent/detail/{agentId}
```

**请求参数：**

| 参数      | 类型     | 位置 | 说明           |
| --------- | -------- | ---- | -------------- |
| `agentId` | `string` | Path | Agent 唯一标识 |

**返回数据（核心字段）：**

```json
{
  "code": 0,
  "data": {
    "id": "agent-123",
    "agentId": "agent-123",
    "name": "PPT 助手",
    "botName": "PPT助手",
    "greeting": "你好，我是PPT助手，请告诉我你的需求",
    "icon": "https://xxx/icon.png",
    "iconURL": "https://xxx/icon.png",
    "type": 3,
    "aiProvider": 101,
    "mcpMethod": "pptAgent",
    "promptTemplateList": [
      {
        "templateForm": "{...JSON...}",
        "user_msg": "请根据主题：{主题}，风格：{风格}，生成PPT大纲"
      }
    ],
    "agentVisionList": [
      {
        "id": "vision-1",
        "name": "PPT",
        "visionAliasName": "PPT预览",
        "visionType": 2,
        "visionAgentId": "agent-ppt-001",
        "done": false,
        "visionContent": ""
      },
      {
        "id": "vision-2",
        "name": "网页",
        "visionAliasName": "网页预览",
        "visionType": 1,
        "visionAgentId": "agent-html-001",
        "done": false,
        "visionContent": ""
      }
    ],
    "cozeBotInfo": {
      "onboardingInfo": {
        "suggestedQuestions": ["帮我做一个产品介绍PPT", "生成一份工作总结"]
      }
    }
  }
}
```

**字段说明：**

| 字段                                            | 类型     | 说明                                     |
| ----------------------------------------------- | -------- | ---------------------------------------- |
| `id` / `agentId`                                | `string` | Agent 唯一标识                           |
| `name` / `botName`                              | `string` | Agent 名称                               |
| `greeting`                                      | `string` | 欢迎语                                   |
| `icon` / `iconURL`                              | `string` | 头像，不同 `aiProvider` 用的字段不同     |
| `type`                                          | `number` | **关键字段**：`2`=建议问题型，`3`=表单型 |
| `aiProvider`                                    | `number` | `101`=Coze                               |
| `mcpMethod`                                     | `string` | MCP 方法名，流式对话时传给后端           |
| `promptTemplateList`                            | `array`  | 表单配置列表，通常取第 0 个              |
| `agentVisionList`                               | `array`  | 可视化能力列表                           |
| `cozeBotInfo.onboardingInfo.suggestedQuestions` | `array`  | 建议问题（type=2 时用）                  |

**`agentVisionList` 单条字段：**

| 字段              | 类型      | 说明                             |
| ----------------- | --------- | -------------------------------- |
| `id`              | `string`  | 可视化能力 ID                    |
| `name`            | `string`  | 名称                             |
| `visionAliasName` | `string`  | 展示名称                         |
| `visionType`      | `number`  | `1`=网页/HTML，`2`=PPT，`3`=Word |
| `visionAgentId`   | `string`  | 可视化子 Agent ID                |
| `visionContent`   | `string`  | 生成结果内容                     |
| `done`            | `boolean` | 是否生成完成                     |

---

### 3.2 Agent 流式对话

```http
POST /customer/aiChat/chat/stream/completion
```

**请求体：**

```json
{
  "aiChatType": 201,
  "chatId": "chat-xxx",
  "agentId": "agent-123",
  "mcpMethod": "pptAgent",
  "aiChatMessages": [
    {
      "role": "user",
      "content": "请根据主题：AI图书馆，生成PPT大纲",
      "enableKnowledgeFlag": true,
      "resCode": "agent-123",
      "contentId": ""
    }
  ]
}
```

**与普通 Coze 对话的区别：**

| 字段                       | 普通 Coze              | Agent 类型                      |
| -------------------------- | ---------------------- | ------------------------------- |
| `agentId`                  | 传入 Coze bot 的 ID    | 传入 `agentId`                  |
| `mcpMethod`                | 不传                   | **必须传** Agent 的 `mcpMethod` |
| `aiChatMessages[].resCode` | TemplateCode / resCode | `agentId`                       |

---

### 3.3 可视化内容并行生成

```http
POST /customer/aiChat/chat/stream/agentVisionCompletion
```

**请求体：**

```json
{
  "agentId": "agent-ppt-001",
  "contentId": "msg-xxx",
  "agentVisionId": "vision-1",
  "chatId": "chat-xxx",
  "aiChatMessages": [
    {
      "role": "user",
      "content": "请根据主题：AI图书馆，生成PPT大纲",
      "contentId": "msg-xxx"
    }
  ]
}
```

**说明：**

- 每个 `agentVisionList` 中的 tab 都要单独发一次 SSE 请求
- 并行生成多个可视化内容
- 返回事件类型和普通流式对话一致：`[DATA]`、`[DONE]`、`[ERROR]`

---

### 3.4 PPT 生成任务

```http
POST /customer/aiChat/vision/convertPPT
```

**请求体：**

```json
{
  "content": "请根据主题：AI图书馆，生成PPT大纲",
  "contentId": "msg-xxx",
  "agentVisionId": "vision-1",
  "agentId": "agent-ppt-001",
  "color": "purple",
  "complex": 2,
  "aiPicture": true
}
```

**返回：**

```json
{
  "code": 0,
  "data": "task-id-xxx"
}
```

---

### 3.5 查询 PPT 生成结果

```http
GET /customer/chatPPT/result?id={taskId}
```

**返回：**

```json
{
  "code": 0,
  "data": {
    "status": 2,
    "ppt_title": "AI图书馆介绍",
    "download_url": "https://xxx/xxx.pptx"
  }
}
```

**status 状态：**

| 状态码 | 含义     |
| ------ | -------- |
| `0`    | 等待生成 |
| `1`    | 生成中   |
| `2`    | 生成完成 |
| `3`    | 生成失败 |

---

### 3.6 下载 PPT

```http
GET /customer/chatPPT/download?id={taskId}&type=pptx
```

**返回：**

```json
{
  "code": 0,
  "data": {
    "download_url": "https://xxx/xxx.pptx"
  }
}
```

---

### 3.7 下载 Word

```http
GET /customer/aiChat/vision/downloadWord?htmlContent={htmlString}
```

**说明：**

- 把 HTML 内容传给后端，后端返回 Word 文件下载链接

---

## 四、状态管理扩展

在 Pinia store 中增加以下字段：

```js
// store/modules/mainInfo.js
export const useMainInfoStore = defineStore('main', {
  state: () => ({
    // ... 已有字段
    showTemplate: 1, // 当前页面类型，5=Agent服务中心
    TemplateCode: '', // 当前资源码/AgentId
    agentName: '', // Agent名称
    agentInfo: null, // Agent详情对象
    mcpMethod: '', // Agent的mcpMethod
    isShowInput: true, // 是否显示输入框
  }),
  actions: {
    // ... 已有方法
    setTemplate(e, code, name, str) {
      this.showTemplate = e;
      this.TemplateCode = code;
      this.agentName = name;
      this.mcpMethod = str || '';
    },
    setInput(e) {
      this.isShowInput = e;
    },
  },
});
```

---

## 五、组件清单

### 5.1 需要新增/修改的组件

| 组件                | 路径                                      | 说明                              |
| ------------------- | ----------------------------------------- | --------------------------------- |
| `Gpts.vue`          | `src/components/chat/Gpts.vue`            | Agent 服务列表页，已存在需扩展    |
| `ServerCenter.vue`  | `src/components/chat/ServerCenter.vue`    | Agent 详情页（新增）              |
| `AgentForm.vue`     | `src/components/chat/agent/AgentForm.vue` | 动态表单渲染 + 提示词生成（新增） |
| `PreviewNew.vue`    | `src/components/PreviewNew.vue`           | 右侧抽屉预览容器（新增）          |
| `HtmlPreview.vue`   | `src/components/HtmlPreview.vue`          | 网页/Word 预览 + 下载（新增）     |
| `PptPreviewNew.vue` | `src/components/PptPreviewNew.vue`        | PPT 生成 + 下载（新增）           |
| `chat/index.vue`    | `src/views/chat/index.vue`                | 修改 onDone 触发可视化生成        |

### 5.2 需要新增的工具函数

| 文件                      | 说明                     |
| ------------------------- | ------------------------ |
| `src/utils/usePreview.js` | Agent 可视化内容并行生成 |
| `src/utils/usePPT.js`     | PPT 生成、轮询、下载逻辑 |

---

## 六、详细实现步骤

### 步骤 1：扩展 API 接口

在 `src/api/index.js` 中新增：

```js
export default {
  // ... 已有接口
  GetAgentDetail: (id) => request.get(`/customer/aiChat/agent/detail/${id}`),
  aiChatVisionConvertPPT: (data) =>
    request.post('/customer/aiChat/vision/convertPPT', data),
  getPPTResult: (params) => request.get('/customer/chatPPT/result', { params }),
  downloadPPT: (params) =>
    request.get('/customer/chatPPT/download', { params }),
  downloadWord: (params) =>
    request.get('/customer/aiChat/vision/downloadWord', { params }),
};
```

### 步骤 2：扩展状态管理

按第四节扩展 `mainInfo.js`。

### 步骤 3：实现 Agent 列表页

`Gpts.vue` 中 `childType === 5` 的处理：

```js
const serverAsk = (item) => {
  if (item.type === 3 || item.type === 4) {
    // Agent 智能体：有表单或可视化能力
    serverCode = item.agentId;
    useMainInfoStore().setTemplate(5, item.agentId, item.name, item.mcpMethod);
    api.GetAgentDetail(item.agentId).then((res) => {
      useMainInfoStore().agentInfo = res;
      // type=3 表单型隐藏输入框
      res.type === 3
        ? useMainInfoStore().setInput(false)
        : useMainInfoStore().setInput(true);
      questions.value = res;
      show.value = 2; // 显示 ServerCenter
    });
  } else {
    // 普通 Coze Bot
    serverCode = item.resCode;
    useMainInfoStore().setTemplate(5, item.resCode, item.name);
    getDetail(item.resCode).then(() => {
      show.value = 2;
    });
  }
};
```

### 步骤 4：实现 Agent 详情页

`ServerCenter.vue`：

```vue
<template>
  <div class="w-[760px] flex flex-col justify-start items-start pb-[20px]">
    <!-- 头部 -->
    <div class="flex justify-start items-center">
      <div @click="serverBack" class="cursor-pointer mr-[10px]">
        <img src="@/assets/images/back.png" class="w-[39px] h-[34px]" />
      </div>
      <img
        :src="questions.icon || questions.iconURL"
        class="w-[40px] h-[40px] rounded-[50%] mr-[6px]"
      />
      <div class="text-[32px] font-semibold">你好,{{ questions.name }}</div>
    </div>

    <!-- 欢迎语 -->
    <div class="text-[16px] mb-[28px] pl-[46px]">{{ questions.greeting }}</div>

    <!-- type=2：建议问题 -->
    <div class="w-full pl-[46px]" v-if="questions.type === 2">
      <div class="flex flex-wrap">
        <div
          @click="ask(item)"
          v-for="(item, index) in suggestedQuestions"
          :key="index"
          class="w-[326px] p-[16px] bg-white rounded-[8px] border border-gray-200 mr-[10px] mb-[10px] cursor-pointer hover:shadow"
        >
          <div class="text-[16px] font-semibold">{{ item }}</div>
        </div>
      </div>
    </div>

    <!-- type=3：表单 -->
    <div class="w-full pl-[46px] pr-[10px]" v-if="questions.type === 3">
      <AgentForm
        :formConfig="questions.promptTemplateList[0]"
        @subFormPrompt="subFormPrompt"
      />
    </div>
  </div>
</template>

<script setup>
import { useMainInfoStore } from '@/store';
import { storeToRefs } from 'pinia';
import AgentForm from '@/components/chat/agent/AgentForm.vue';

const { TemplateCode } = storeToRefs(useMainInfoStore());

const props = defineProps({
  questions: { type: Object },
  serverCode: { type: String },
});

const serverBack = inject('serverBack');
const incoming = inject('incoming');
const creat = inject('creat');

const suggestedQuestions = computed(() => {
  if (props.questions.aiProvider === 101) {
    return (
      props.questions.cozeBotInfo?.onboardingInfo?.suggestedQuestions || []
    );
  }
  return props.questions.onboardingInfo?.suggestedQuestions || [];
});

const ask = (item) => {
  creat(TemplateCode.value, item, 201, props.serverCode).then(() => {
    incoming({ content: item }, 201, props.serverCode);
  });
};

const subFormPrompt = (content) => {
  creat(TemplateCode.value, content, 201, props.serverCode).then(() => {
    useMainInfoStore().setInput(true);
    incoming({ content }, 201, props.serverCode);
  });
};
</script>
```

### 步骤 5：实现表单生成提示词

`AgentForm.vue` 核心逻辑：

```vue
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-position="top"
    size="large"
  >
    <el-row :gutter="10">
      <template v-for="field in formConfigData.form" :key="field.prop">
        <el-col
          v-if="
            !field.conditions || evaluateCondition(field.conditions, formData)
          "
          :span="6 * (field.widthRatio || 4)"
        >
          <el-form-item :label="field.label" :prop="field.prop">
            <!-- select -->
            <template v-if="field.component.name === 'select'">
              <el-select
                v-if="field.component.displayMode !== 'grid'"
                v-model="formData[field.prop]"
                :placeholder="field.component.attrs.placeholder"
                class="w-full"
                :multiple="field.component.attrs.multiple"
                clearable
                @change="onSelectChange(field.prop)"
              >
                <el-option
                  v-for="option in field.component.attrs.orginOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>

              <el-checkbox-group
                v-else-if="field.component.attrs.multiple"
                v-model="formData[field.prop]"
              >
                <el-checkbox-button
                  v-for="option in field.component.attrs.orginOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </el-checkbox-button>
              </el-checkbox-group>

              <el-radio-group v-else v-model="formData[field.prop]">
                <el-radio-button
                  v-for="option in field.component.attrs.orginOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </el-radio-button>
              </el-radio-group>
            </template>

            <!-- input -->
            <el-input
              v-else-if="field.component.name === 'input'"
              v-model="formData[field.prop]"
              :rows="6"
              :placeholder="field.component.attrs.placeholder"
              :type="field.component.attrs.type"
              clearable
            />
          </el-form-item>
        </el-col>
      </template>
    </el-row>
  </el-form>

  <div class="p-4 flex justify-between bg-white shadow rounded-xl">
    <el-button @click="clearFormData">清空</el-button>
    <el-button @click="setFormData">示例</el-button>
    <el-button type="primary" @click="submitForm">提交</el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  formConfig: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['subFormPrompt']);

const formData = ref({});
const formRules = ref({});
const formRef = ref();
const formConfigData = ref({});

watchEffect(() => {
  try {
    formConfigData.value = JSON.parse(props.formConfig.templateForm);
    formConfigData.value?.form?.forEach((field) => {
      formRules.value[field.prop] =
        formConfigData.value?.rules?.[field.prop] || [];
    });
  } catch {
    console.error('解析 templateForm 失败');
  }
});

const setFormData = () => {
  formConfigData.value?.form?.forEach((field) => {
    formData.value[field.prop] = field.component.attrs.multiple
      ? field.component.value?.split(',').filter((item) => !!item.trim())
      : field.component.value?.trim();
  });
};

const clearFormData = () => {
  formData.value = {};
};

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const prompt = replacePlaceholders(
        formConfigData.value.user_msg,
        formConfigData.value,
        formData.value,
      );
      emit('subFormPrompt', prompt);
    }
  });
};

function replacePlaceholders(template, formConfig, data) {
  const labelToPropMap = {};
  formConfig.form.forEach((item) => {
    labelToPropMap[item.label] = data[item.prop] ?? '';
  });

  const processValue = (v) => {
    if (Array.isArray(v)) {
      const filtered = v.filter(
        (item) => typeof item !== 'object' || item === null,
      );
      return filtered.length > 0 ? filtered.join('，') : '';
    }
    if (v && typeof v === 'object') return '';
    return v ?? '';
  };

  const separators = [];
  for (let i = 0; i < template.length; i++) {
    if (template[i] === '\n' || ['，', ','].includes(template[i])) {
      separators.push(template[i]);
    }
  }

  const segments = template.split(/[,，\n]/);
  const resultSegments = [];
  const resultSeparators = [];
  let sepIdx = 0;

  for (const segment of segments) {
    const trimmedSegment = segment.trim();
    if (!trimmedSegment) {
      sepIdx++;
      continue;
    }

    const labels = [];
    let processedSegment = trimmedSegment.replace(
      /\{([^}]+)\}/g,
      (match, label) => {
        labels.push(label);
        return processValue(labelToPropMap[label]);
      },
    );

    const hasValue =
      labels.length === 0 ||
      labels.some((label) => {
        const v = labelToPropMap[label];
        if (Array.isArray(v))
          return v.some((item) => typeof item !== 'object' || item === null);
        if (v && typeof v === 'object') return false;
        return v !== undefined && v !== null && v !== '';
      });

    if (hasValue) {
      resultSegments.push(processedSegment);
      if (sepIdx < separators.length) {
        resultSeparators.push(separators[sepIdx]);
      }
    }
    sepIdx++;
  }

  let result = '';
  resultSegments.forEach((segment, index) => {
    result += segment;
    if (index < resultSeparators.length) {
      result += resultSeparators[index];
    }
  });
  return result;
}

const evaluateCondition = (conditions, formData) => {
  if (!conditions || !conditions.when) return true;
  const watchValue = formData[conditions.when];
  const targetValue = conditions.value;

  switch (conditions.operator) {
    case '==':
      return watchValue == targetValue;
    case '!=':
      return watchValue != targetValue;
    case '>':
      return watchValue > targetValue;
    case '<':
      return watchValue < targetValue;
    case '>=':
      return watchValue >= targetValue;
    case '<=':
      return watchValue <= targetValue;
    case 'include':
      return targetValue
        ?.split(',')
        .map((v) => v.trim())
        .includes(watchValue);
    case 'exclude':
      return !targetValue
        ?.split(',')
        .map((v) => v.trim())
        .includes(watchValue);
    default:
      return true;
  }
};

const clearDependentFields = (parentField) => {
  const dependentFields = formConfigData.value.form.filter(
    (field) => field.conditions?.when === parentField,
  );
  dependentFields.forEach((field) => {
    formData.value[field.prop] = field.component.attrs.multiple ? [] : '';
    clearDependentFields(field.prop);
  });
};

const onSelectChange = (prop) => {
  nextTick(() => clearDependentFields(prop));
};
</script>
```

### 步骤 6：修改流式对话参数

在 `chat/index.vue` 中发起流式请求的地方：

```js
let data = {
  aiChatType,
  chatId,
  agentId: showTemplate.value === 5 ? TemplateCode.value : agentId,
  aiChatMessages: [],
};

// Agent 类型额外传 mcpMethod
if (showTemplate.value === 5) {
  data.mcpMethod = mcpMethod.value;
}

arr.forEach((item) => {
  data.aiChatMessages.push({
    content: item.content,
    enableKnowledgeFlag: true,
    resCode: TemplateCode.value,
    role: item.role,
    contentId: item.id,
  });
});
```

### 步骤 7：实现可视化内容生成

`src/utils/usePreview.js`：

```js
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useMainInfoStore, useUserStore } from '@/store';
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';

const isShowPreview = ref(false);

export const usePreviewNew = () => {
  const { accessToken } = storeToRefs(useUserStore());
  const { agentInfo } = storeToRefs(useMainInfoStore());

  const tabListData = computed(() => agentInfo.value?.agentVisionList || []);

  const start = async (chatItem, content) => {
    isShowPreview.value = true;

    tabListData.value.forEach((tab) => {
      tab.content = content;
      tab.contentId = chatItem.contentId;
      tab.done = false;

      // 跳过 visionType === 2 可以直接展示的类型，或者根据业务调整
      if (tab.visionType === 2) return;

      tab.visionContent = '';
      const ctrl = new AbortController();

      fetchEventSource(
        import.meta.env.VITE_AXIOS_BASE_URL +
          '/customer/aiChat/chat/stream/agentVisionCompletion',
        {
          method: 'POST',
          body: JSON.stringify({
            agentId: tab.visionAgentId,
            contentId: chatItem.contentId,
            agentVisionId: tab.id,
            chatId: chatItem.chatId,
            aiChatMessages: [
              {
                role: 'user',
                content,
                contentId: chatItem.contentId,
              },
            ],
          }),
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
            'content-type': 'application/json',
          },
          signal: ctrl.signal,
          openWhenHidden: true,
          onmessage(e) {
            const data = JSON.parse(e.data);
            if (data.event === '[DATA]') {
              tab.visionContent += data.data.content || '';
            }
          },
          onclose() {
            tab.done = true;
          },
        },
      );
    });
  };

  return {
    tabListData,
    start,
    isShowPreview,
  };
};
```

### 步骤 8：在 onDone 中触发可视化生成

在 `chat/index.vue` 的 `useAi.onDone` 中：

```js
import { usePreviewNew } from '@/utils/usePreview';

const { start } = usePreviewNew();

const useAi = {
  // ... onOpen, onMessage, onTools
  onDone: (data) => {
    // ... 其他处理

    if (showTemplate.value === 5) {
      if (agentInfo.value?.agentVisionList?.length) {
        try {
          const chatItem = JSON.parse(data.data.content);
          const text = content[content.length - 1].content;
          start(chatItem, text);
        } catch (e) {
          console.error('解析 agent vision 数据失败', e);
        }
      }
    }

    // ...
  },
};
```

### 步骤 9：实现预览抽屉

`PreviewNew.vue`：

```vue
<template>
  <el-drawer
    v-model="isShowPreview"
    direction="rtl"
    :size="isMobile ? '97%' : '780'"
  >
    <div class="preview-container h-full bg-white">
      <div class="preview-tabs flex items-center justify-center border-b pb-2">
        <div class="flex items-center bg-[#f2f2f2] rounded-full">
          <div
            v-for="item in tabListData"
            :key="item.id"
            class="px-3 py-1 text-sm cursor-pointer rounded-full"
            :class="{ 'text-white bg-[#1765FF]': activeTab.id === item.id }"
            @click="activeTab = item"
          >
            {{ item.visionAliasName }}
          </div>
        </div>
      </div>

      <div class="p-2 h-full overflow-y-auto">
        <template v-for="item in tabListData" :key="`i_${item.id}`">
          <div v-show="activeTab.id === item.id" class="h-full">
            <ChatHtmlPreview
              v-if="[1, 3].includes(item.visionType)"
              :data="item"
            />
            <ChatPptPreviewNew v-if="item.visionType == 2" :data="item" />
          </div>
        </template>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import ChatHtmlPreview from '@/components/HtmlPreview.vue';
import ChatPptPreviewNew from '@/components/PptPreviewNew.vue';
import { usePreviewNew } from '@/utils/usePreview';
import { useMainInfoStore } from '@/store';
import { storeToRefs } from 'pinia';

const { isMobile } = storeToRefs(useMainInfoStore());
const { tabListData, isShowPreview } = usePreviewNew();

const activeTab = ref({});
watchEffect(() => {
  activeTab.value = tabListData.value[0];
});
</script>
```

### 步骤 10：实现 PPT 生成组件

`src/utils/usePPT.js`：

```js
import { ref } from 'vue';
import api from '@/api';

export const useChatPerviewPPT = () => {
  const status = ref(0); // 0等待 1生成中 2完成 3失败
  const pptData = ref([]);
  const pptParams = ref({
    aiPicture: true,
    color: '',
    complex: 2,
    content: '',
    contentId: '',
    agentVisionId: '',
    agentId: '',
  });
  const requestParams = ref({ id: '' });

  let timer = null;

  const getPPTRequestData = async () => {
    try {
      const data = await api.getPPTResult({ id: requestParams.value.id });
      status.value = data.status;
      pptData.value = data;
      if (data.status !== 1) {
        clearInterval(timer);
      }
    } catch (err) {
      clearInterval(timer);
    }
  };

  const getPPTData = async () => {
    if (timer) return;
    status.value = 1;
    const pptResult = await api.aiChatVisionConvertPPT(pptParams.value);
    if (pptResult) {
      requestParams.value.id = pptResult;
      timer = setInterval(getPPTRequestData, 1000);
    }
  };

  const requestDownloadPPT = async ({ id, type = 'pptx', title }) => {
    const downloadResult = await api.downloadPPT({ id, type });
    if (downloadResult?.download_url) {
      // window.open(downloadResult.download_url)
    }
  };

  return {
    pptData,
    pptParams,
    getPPTData,
    status,
    requestParams,
    requestDownloadPPT,
  };
};
```

`PptPreviewNew.vue` 核心逻辑：

```vue
<script setup>
import { useChatPerviewPPT } from '@/utils/usePPT';

const props = defineProps({
  data: { type: Object, default: () => ({}) },
});

const {
  pptData,
  getPPTData,
  pptParams,
  status,
  requestParams,
  requestDownloadPPT,
} = useChatPerviewPPT();

onMounted(() => {
  pptParams.value.content = props.data.content || '';
  pptParams.value.contentId = props.data.contentId || '';
  pptParams.value.agentVisionId = props.data.id;
  pptParams.value.agentId = props.data.visionAgentId;

  if (props.data.visionContent) {
    requestParams.value.id = props.data.visionContent;
  } else {
    getPPTData();
  }
});
</script>
```

### 步骤 11：实现 HTML/Word 预览组件

`HtmlPreview.vue` 核心逻辑：

````vue
<template>
  <div class="h-full relative">
    <iframe v-show="detail.done" :srcdoc="htmlContent" class="w-full h-full" />
    <el-scrollbar v-if="!detail.done" class="h-full">
      <div v-html="html"></div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import api from '@/api';
import { Marked } from 'marked';
import { markedHighlight } from '@/utils';
import hljs from 'highlight.js';

const props = defineProps({
  data: { type: Object, default: () => ({}) },
});

const detail = computed(() => props.data || {});

const htmlContent = computed(() => {
  return detail.value?.visionContent
    ?.replace(/^```html/g, '')
    ?.replace(/```$/g, '');
});

const downloadWord = () => {
  const params = {
    htmlContent: detail.value?.visionContent
      ?.replace(/^```html/g, '')
      ?.replace(/```$/g, ''),
  };
  api.downloadWord(params).then((res) => {
    // 处理下载
  });
};
</script>
````

---

## 七、数据流时序图

```
用户                    Gpts                    ServerCenter              chat/index              usePreview              后端
 │                       │                            │                      │                      │                    │
 │─点击 Agent 服务──────▶│                            │                      │                      │                    │
 │                       │─GetAgentDetail(agentId)────────────────────────────────────────────────▶│
 │                       │◀──────────────────────────返回 agentInfo─────────────────────────────────│
 │                       │                            │                      │                      │                    │
 │                       │─show=2, 渲染 ServerCenter─▶│                      │                      │                    │
 │                       │                            │                      │                      │                    │
 │─填写表单/点击建议问题─▶│                            │                      │                      │                    │
 │                       │                            │─生成 prompt─────────▶│                      │                    │
 │                       │                            │                      │─CreateChat()────────▶│
 │                       │                            │                      │◀────chatId───────────│
 │                       │                            │                      │                      │                    │
 │                       │                            │                      │─stream/completion───▶│
 │                       │                            │                      │◀────SSE [DATA]───────│
 │                       │                            │                      │                      │                    │
 │                       │                            │                      │─onDone: 有agentVisionList?
 │                       │                            │                      │─usePreviewNew.start()▶│
 │                       │                            │                      │                      │─agentVisionCompletion▶
 │                       │                            │                      │                      │◀────SSE [DATA]──────│
 │                       │                            │                      │                      │                    │
 │                       │                            │                      │◀─打开 PreviewNew 抽屉─┤                    │
 │                       │                            │                      │                      │                    │
```

---

## 八、迁移检查清单

- [ ] 后端已提供 `GetAgentDetail` 接口
- [ ] 后端已提供 `stream/agentVisionCompletion` 接口
- [ ] 后端已提供 PPT/Word 相关接口
- [ ] 状态管理已扩展 `showTemplate`、`TemplateCode`、`agentName`、`agentInfo`、`mcpMethod`
- [ ] API 层已新增相关接口方法
- [ ] 已新增 `ServerCenter.vue`
- [ ] 已新增 `AgentForm.vue`
- [ ] 已新增 `usePreview.js`
- [ ] 已新增 `usePPT.js`
- [ ] 已新增 `PreviewNew.vue`
- [ ] 已新增 `HtmlPreview.vue`
- [ ] 已新增 `PptPreviewNew.vue`
- [ ] `chat/index.vue` 已修改 `onDone` 触发可视化生成
- [ ] `chat/index.vue` 已修改流式请求参数，Agent 类型传 `mcpMethod`
- [ ] 已安装依赖：`marked`、`highlight.js`

---

## 九、常见问题

### Q1：为什么 Agent 类型要传 `mcpMethod`？

`mcpMethod` 是后端路由到不同 MCP 服务的标识。例如 `pptAgent`、`htmlAgent` 等，后端根据这个字段调用对应的工具服务。

### Q2：`contentId` 从哪来？

第一次用户提问时 `contentId` 为空。流式对话结束后，后端返回的 AI 消息带有 `id`，前端把这个 `id` 同时赋给前一条 user 消息和当前 assistant 消息。下一轮对话时，这些消息的 `contentId` 就会传给后端。

### Q3：`agentVisionList` 中的 `visionType` 怎么区分？

| visionType | 含义      | 处理组件            |
| ---------- | --------- | ------------------- |
| `1`        | 网页/HTML | `HtmlPreview.vue`   |
| `2`        | PPT       | `PptPreviewNew.vue` |
| `3`        | Word      | `HtmlPreview.vue`   |

### Q4：Agent 表单配置 `templateForm` 是什么格式？

`templateForm` 是一个 JSON 字符串，包含表单字段配置。前端解析后动态渲染 Element Plus 表单组件，用户提交后根据 `user_msg` 模板生成最终 prompt。

---

## 十、最小复用路径

如果另一个项目只想先跑通 Agent 表单 + 流式对话，按这个顺序：

1. 扩展 store 和 API
2. 实现 `AgentForm.vue`（表单渲染 + 提示词生成）
3. 实现 `ServerCenter.vue`（展示 Agent 详情和表单）
4. 修改 `chat/index.vue` 流式参数，Agent 时传 `mcpMethod`
5. 先不做可视化生成（PPT/Word），等主流程跑通再接入

这样可以用最小的改动先验证 Agent 核心能力。
