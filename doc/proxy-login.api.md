# 站长代客换商户 token API 文档

> 基础路径：`/web/login`
> 用途：站长代客进入商户后台。前端在新标签页打开商户后台前，用站长 token 换取该商户视角的 token，使新标签页等同商户自己登录。
>
> 说明：本文「商户」泛指商户后台的三种用户类型--`4`=商户 / `5`=物业 / `6`=居委会，三者同级，共用商户后台。代客进入哪个，就返回哪个的真实 userType。

## 背景

商户后台接口（`/merchant/*`）的鉴权模型是「token 识别身份 + merchantId 路径参数」。旧方案前端用站长 token + 路径里的 merchantId 代客，但部分接口依赖商户 session 中的 `merchantCode`，站长 session 不携带，导致「商户标识不能为空」等问题。

新方案：站长点击商户 -> 前端打开新标签页 -> 调用本接口换取商户 token -> 新标签页用商户 token 调 `/merchant/myMerchantInfo` 取商户详情（含 merchantCode）-> 等同商户自己登录。token 隔离由前端按标签页存储实现，后端无需关心。

## 认证

请求头携带 `Authorization: Bearer {站长token}`。仅站长（userType=3）可调用。

## 接口

### 代客换商户 token

```
GET /web/login/merchantToken/{merchantId}
```

**路径参数**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| merchantId | string | 是 | 目标商户 ID（来自商户列表行数据） |

**请求头**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| Authorization | string | 是 | `Bearer {站长token}` |

**响应**

统一响应格式，`data` 为对象，含 `token` 与 `user`（**不含 merchantInfo**，后者由前端用新 token 调 `/merchant/myMerchantInfo` 获取）：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "token": "商户视角的新token",
    "user": {
      "nickname": "星巴克",
      "avatar": "https://...",
      "gender": 0,
      "phone": "13800000000",
      "userType": 4
    }
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| data.token | string | 新签发的商户视角 token（不复用站长 token） |
| data.user | object | 商户视角的用户信息 |
| data.user.userType | number | 等于被代客商户的 type：`4`=商户 / `5`=物业 / `6`=居委会。后端按 merchantId 查出的商户 type 透传，前端不硬编码 |

**错误响应**

| code | 场景 | 说明 |
|---|---|---|
| 30038 | 非站长调用，或站长无权代客该商户 | 无权限 |
| 40001 | merchantId 缺失/无效 | 参数错误 |
| 30002 | 站长 token 失效 | 未登录/登录过期 |

## 后端实现要点

### 权限校验

1. 校验 `Authorization` token 对应身份为站长（userType=3），非站长直接拒绝（30038）
2. 校验该站长对请求的 `merchantId` 有代客权限（该商户在站长名下），否则返回 30038
3. `merchantId` 须做服务端越权校验，**不能仅凭前端传入**

### token 签发

1. 通过校验后，签发该商户视角的新 token（权限边界 = 该商户自身）
2. 商户 token 不得越权访问其他商户的数据
3. 不复用站长 token

### merchantInfo

本接口**不返回 merchantInfo**。前端拿到新 token 后，自行调用 `GET /merchant/myMerchantInfo` 获取商户详情（含 `merchantCode`），与正常 password 登录的两步流程一致，便于复用现有逻辑、保证字段一致。

## 安全要求

- 仅站长（userType=3）可调用本接口
- `merchantId` 须服务端校验归属，防越权
- 返回的商户 token 权限边界 = 该商户自身
- 商户 token 有效期建议与普通登录 token 一致

## 前端调用方

两步流程：

1. **站长标签页**（有站长 token）：`src/composables/use-enter-merchant-business.ts` 调本接口换 token，中转存 `{token, user}` 到 localStorage，并 `window.open` 代客入口页
2. **代客入口页**（`/auth/proxy-entry`）：`src/composables/use-proxy-entry.ts` 读中转 -> `setToken`/`setUserInfo` -> 用新 token 调 `/merchant/myMerchantInfo`（复用 `useUserInfo.fetchUserInfo`）-> 跳商户概览

- 接口定义：`src/services/api/proxy-login.api.ts`（`fetchMerchantToken`）
