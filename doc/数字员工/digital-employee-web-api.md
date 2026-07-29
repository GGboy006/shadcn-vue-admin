# 数字员工功能 - 站长工作台接口文档（residential-web）

**context-path**：`/web`

## 通用响应结构

```json
{
  "code": 0,
  "level": null,
  "msg": "success",
  "data": {}
}
```

---

### 1 查询部门分类列表+子集已分配数字员工（含每分类数量）

```
GET /web/digital-employee/department/list
```

**说明**：查询所有启用的部门分类，每个分类下包含已分配给当前站长的数字员工列表及数量。用于前端展示「分类+数字员工」页面。

**响应**：`BaseResponse<List<DepartmentEmployeeVO>>`

```json
{
  "code": 0,
  "data": [
    {
      "departmentId": 1,
      "departmentName": "总经理办公室",
      "logo": "https://oss.xxx.com/dept1.png",
      "description": "公司战略决策与整体运营管理",
      "sortOrder": 1,
      "employeeCount": 2,
      "employeeList": [
        {
          "employeeId": 1001,
          "employeeName": "小智",
          "logo": "https://oss.xxx.com/avatar.png",
          "title": "首席执行官",
          "levelLabel": "企业级AI大脑",
          "departmentId": 1,
          "departmentName": "总经理办公室",
          "employeeType": 4,
          "description": "负责整体运营管理",
          "aiType": 2,
          "aiThirdId": "agent-001",
          "tags": ["战略决策"],
          "taskCount": 128,
          "scoring": 4.50,
          "onlineStatus": 1,
          "status": 1
        }
      ]
    },
    {
      "departmentId": 4,
      "departmentName": "客服部",
      "logo": null,
      "description": "居民服务、问题解答、工单处理",
      "sortOrder": 4,
      "employeeCount": 0,
      "employeeList": []
    }
  ]
}
```

---

## 数据结构定义

### 枚举值

#### 数字员工类型（employeeType）

| 值 | 说明 |
|----|------|
| 4 | 商户 |
| 5 | 物业 |
| 6 | 居委会 |
| 7 | 居民 |

#### AI类型（aiType）

| 值 | 说明 |
|----|------|
| 1 | 扣子(Coze) |
| 2 | Agent |
| 3 | AI AgentSkill |

#### 状态（status）

| 值 | 说明 |
|----|------|
| 1 | 启用 |
| 2 | 禁用 |

#### 在线状态（onlineStatus）

| 值 | 说明 |
|----|------|
| 0 | 离线 |
| 1 | 在线 |
| 2 | 忙碌 |

### VO 字段说明

#### DigitalEmployeeVO

| 字段 | 类型 | 说明 |
|------|------|------|
| employeeId | Long | 数字员工ID |
| employeeName | String | 数字员工名称 |
| logo | String | LOGO/头像（OSS地址） |
| title | String | 职位头衔 |
| levelLabel | String | AI等级标签 |
| departmentId | Long | 部门分类ID |
| departmentName | String | 部门名称 |
| employeeType | Integer | 数字员工类型 |
| description | String | 数字员工描述 |
| aiType | Integer | AI类型 |
| aiThirdId | String | 第三方平台标识ID |
| tags | List\<String\> | 能力标签 |
| taskCount | Integer | 任务执行次数 |
| scoring | BigDecimal | 评分 |
| onlineStatus | Integer | 在线状态 |
| status | Integer | 状态 |

#### DepartmentEmployeeVO

| 字段 | 类型 | 说明 |
|------|------|------|
| departmentId | Long | 部门ID |
| departmentName | String | 部门名称 |
| logo | String | 部门LOGO |
| description | String | 部门描述 |
| sortOrder | Integer | 排序权重 |
| employeeCount | Integer | 该部门下已分配的数字员工数量 |
| employeeList | List\<DigitalEmployeeVO\> | 该部门下已分配的数字员工列表 |
