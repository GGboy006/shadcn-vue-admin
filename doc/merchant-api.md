# 商户后台 API 文档（BusinessMerchantController）

> 对应类：`residential-web/.../merchant/controller/BusinessMerchantController.java`
> 基础路径：`/merchant`

## 通用说明

### 认证

所有接口需在请求头携带 `Authorization: Bearer {token}`。

### 权限模型

统一通过 `merchantId` 路径参数鉴权，后端自动识别当前用户身份：

| 当前用户身份 | 权限范围 |
|---|---|
| 商户（userType=4） | 只能操作 `merchantId` 等于自己商户的接口 |
| 站长（userType=3） | 可操作名下所有商户的 `merchantId` |
| 其他身份 | 无权限（返回 30038） |

### 统一响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| code | Integer | 0=成功，其他=错误码 |
| msg | String | 消息 |
| data | T | 响应数据 |

### 分页请求参数（PageParam）

GET 请求通过 query 传递：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| pageNum | Long | 是 | 页码，从1开始 |
| pageSize | Long | 是 | 每页数量，最大200 |
| searchCount | Boolean | 否 | 是否查询总条数 |

### 分页响应格式（PageResult\<T\>）

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

---

## 一、商户信息

### 1.1 查看商户信息

`GET /merchant/myMerchantInfo/{merchantId}`

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| merchantId | Long | 商户ID |

**响应** `BusinessMerchantVO`

| 字段 | 类型 | 说明 |
|---|---|---|
| merchantId | Long | 商户ID |
| merchantCode | String | 商户编号 |
| merchantName | String | 商户/物业/居委会名称 |
| type | Integer | 类型：4=商户，5=物业，6=居委会 |
| logo | String | 店铺Logo |
| poster | String | 门头照 |
| bannerImages | List\<String\> | 轮播图URL数组 |
| otherImages | List\<String\> | 其他图URL数组 |
| contactName | String | 联系人 |
| contactPhone | String | 联系电话 |
| address | String | 详细地址 |
| externalUrl | String | 外部链接（物业使用） |
| signDate | LocalDate | 签约日期 |
| signFee | BigDecimal | 签约费用 |
| businessStatus | Integer | 营业状态：1=营业中，2=休息中，3=已打烊，4=暂停营业 |
| businessHours | String | 营业时间 |
| minDeliveryAmount | BigDecimal | 起送金额 |
| deliveryFee | BigDecimal | 配送费 |
| settlementCycle | Integer | 结算周期：1=T+1，2=T+7，3=T+30 |
| status | Integer | 状态：1=启用，2=禁用 |
| remark | String | 备注 |
| nickname | String | 用户昵称 |
| phone | String | 手机号 |
| avatar | String | 头像 |
| gender | Integer | 性别：0=未知，1=男，2=女 |
| userStatus | Integer | 用户状态：1=正常，2=禁用 |
| lastLoginTime | LocalDateTime | 最后登录时间 |

### 1.2 更新商户信息

`PUT /merchant/updateMyMerchantInfo`

**请求体** `BusinessMerchantUpdateDTO`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| merchantId | Long | 是 | 商户ID |
| nickname | String | 否 | 用户昵称 |
| phone | String | 否 | 手机号 |
| password | String | 否 | 登录密码（传空则不修改） |
| avatar | String | 否 | 头像 |
| gender | Integer | 否 | 性别：0=未知，1=男，2=女 |
| merchantName | String | 否 | 商户名称 |
| logo | String | 否 | Logo |
| bannerImages | List\<String\> | 否 | 轮播图 |
| otherImages | List\<String\> | 否 | 其他图 |
| type | Integer | 是 | 类型：4=商户，5=物业，6=居委会 |
| systemFaqId | Long | 否 | FAQ字典ID |
| contactName | String | 否 | 联系人 |
| contactPhone | String | 否 | 联系电话 |
| address | String | 否 | 详细地址 |
| externalUrl | String | 否 | 外部链接 |
| signDate | LocalDate | 否 | 签约日期 |
| signFee | BigDecimal | 否 | 签约费用 |
| businessStatus | Integer | 否 | 营业状态 |
| businessHours | String | 否 | 营业时间 |
| consumptionPerCapita | Double | 否 | 人均消费 |
| settlementCycle | Integer | 否 | 结算周期 |
| remark | String | 否 | 备注 |
| status | Integer | 否 | 状态：1=启用，2=禁用 |

> 字段为 null 时不更新该字段。type=4(商户)时同步更新城市数据中心。

**响应** `Boolean`

---

## 二、商品分类

### 2.1 全部分类

`GET /merchant/cate/{merchantId}/all`

**响应** `List<TblAppEnterpriseCateResp>`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Long | 主键ID |
| uniqueCode | String | 唯一标识 |
| orgCode | String | 企业标识 |
| name | String | 分类名称 |
| type | Integer | 类型：1=企业活动，2=商品 |
| torder | Integer | 排序 |
| isEnable | Integer | 启用状态：1=启用，2=禁用 |

### 2.2 分类-分页列表

`GET /merchant/cate/{merchantId}/page`

**参数** PageParam（pageNum, pageSize）

**响应** `PageResult<TblAppEnterpriseCateVO>`

| 字段 | 类型 | 说明 |
|---|---|---|
| uniqueCode | String | 唯一标识 |
| orgCode | String | 企业标识 |
| name | String | 分类名称 |
| torder | Integer | 排序 |
| isEnable | Integer | 启用状态 |
| goodsCount | Long | 分类下商品数量 |

### 2.3 分类-新增

`POST /merchant/cate/{merchantId}`

**请求体** `EnterpriseCateAddReq`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| name | String | 是 | 分类名称 |
| torder | Integer | 否 | 排序 |

> `merchantCode` 由后端自动注入，前端无需传。

**响应** `Boolean`

### 2.4 分类-更新

`PUT /merchant/cate/{merchantId}`

**请求体** `EnterpriseCateUpdateReq`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| cateCode | String | 是 | 分类唯一标识 |
| name | String | 是 | 分类名称 |
| torder | Integer | 否 | 排序 |

**响应** `Boolean`

### 2.5 分类-删除

`DELETE /merchant/cate/{merchantId}/{cateCode}`

| 参数 | 位置 | 类型 | 说明 |
|---|---|---|---|
| merchantId | path | Long | 商户ID |
| cateCode | path | String | 分类标识 |

**响应** `Boolean`

---

## 三、商品

### 3.1 商品-分页列表

`GET /merchant/goods/{merchantId}/page`

| 参数 | 位置 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| merchantId | path | Long | 是 | 商户ID |
| cateCode | query | String | 否 | 分类标识 |
| keyword | query | String | 否 | 关键词 |
| pageNum | query | Long | 是 | 页码 |
| pageSize | query | Long | 是 | 每页数量 |

**响应** `PageResult<TblAppEnterpriseGoodsVO>`

| 字段 | 类型 | 说明 |
|---|---|---|
| uniqueCode | String | 唯一标识 |
| orgCode | String | 企业标识 |
| name | String | 商品名称 |
| poster | String | 封面图 |
| cateName | String | 分类名称 |
| describes | String | 简介 |
| salePrice | Double | 金额 |
| content | String | 内容 |
| isRecommend | Integer | 是否推荐：1=是，2=否 |
| isEnable | Integer | 启用状态：1=启用，2=禁用 |

### 3.2 商品-详情

`GET /merchant/goods/{merchantId}/detail?goodsCode=xxx`

**响应** `TblAppEnterpriseGoodsResp`

| 字段 | 类型 | 说明 |
|---|---|---|
| uniqueCode | String | 唯一标识 |
| orgCode | String | 企业标识 |
| name | String | 商品名称 |
| poster | String | 封面图 |
| detailPoster | String | 详情图片 |
| cateCode | String | 分类标识 |
| cateName | String | 分类名称 |
| describes | String | 简介 |
| content | String | 内容 |
| salePrice | Double | 金额 |
| torder | Integer | 排序 |
| isRecommend | Integer | 是否推荐 |
| isEnable | Integer | 启用状态 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |

### 3.3 商品-新增

`POST /merchant/goods/{merchantId}`

**请求体** `EnterpriseGoodsAddReq`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| cateCode | String | 否 | 分类标识 |
| cateName | String | 否 | 分类名称 |
| name | String | 是 | 商品名称 |
| poster | String | 否 | 封面图 |
| detailPoster | String | 否 | 详情图片 |
| describes | String | 否 | 简介 |
| content | String | 否 | 内容 |
| salePrice | Double | 否 | 金额 |
| torder | Integer | 否 | 排序 |
| isRecommend | Integer | 否 | 是否推荐：1=是，2=否 |
| freeFlag | Integer | 否 | 0=收费，1=免费 |

> `merchantCode` 由后端自动注入，前端无需传。

**响应** `String`（商品唯一标识）

### 3.4 商品-更新

`PUT /merchant/goods/{merchantId}`

**请求体** `EnterpriseGoodsUpdateReq`（继承 AddReq，增加）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| goodsCode | String | 是 | 商品唯一标识 |
| ... | | | 其余同新增 |

**响应** `Boolean`

### 3.5 商品-删除

`DELETE /merchant/goods/{merchantId}/{goodsCode}`

**响应** `Boolean`

---

## 四、FAQ

### 4.1 FAQ-分页列表

`GET /merchant/faq/{merchantId}/page`

| 参数 | 位置 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| keyword | query | String | 否 | 关键词 |
| pageNum | query | Long | 是 | 页码 |
| pageSize | query | Long | 是 | 每页数量 |

**响应** `PageResult<TblCouponMerchantFaqResp>`

| 字段 | 类型 | 说明 |
|---|---|---|
| uniqueCode | String | 唯一标识 |
| merchantCode | String | 商户标识 |
| categoryName | String | 标签（如：制作工艺/退换政策/食材新鲜） |
| question | String | 问题标题 |
| answer | String | 答案内容 |
| torder | Integer | 排序 |
| isEnable | Integer | 状态：1=启用，2=禁用 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |

### 4.2 FAQ-新增

`POST /merchant/faq/{merchantId}`

**请求体** `MerchantFaqAddReq`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| categoryName | String | 否 | 标签 |
| question | String | 是 | 问题标题 |
| answer | String | 是 | 答案内容 |
| torder | Integer | 否 | 排序 |
| isEnable | Integer | 否 | 状态：1=启用，2=禁用 |

> `merchantCode` 由后端自动注入，前端无需传。

**响应** `String`（FAQ唯一标识）

### 4.3 FAQ-更新

`PUT /merchant/faq/{merchantId}`

**请求体** `MerchantFaqUpdateReq`（继承 AddReq，增加）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| faqCode | String | 是 | FAQ唯一标识 |
| ... | | | 其余同新增 |

**响应** `Boolean`

### 4.4 FAQ-删除

`DELETE /merchant/faq/{merchantId}/{faqCode}`

**响应** `Boolean`

---

## 五、优惠活动

### 5.1 优惠活动-分页列表

`GET /merchant/activity/{merchantId}/page`

| 参数 | 位置 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| keyword | query | String | 否 | 关键词 |
| pageNum | query | Long | 是 | 页码 |
| pageSize | query | Long | 是 | 每页数量 |

**响应** `PageResult<TblAppEnterpriseActivityResp>`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Long | 主键ID |
| uniqueCode | String | 唯一标识 |
| orgCode | String | 企业标识 |
| name | String | 活动名称 |
| poster | String | 封面图 |
| detailPoster | String | 详情图片 |
| sponsorName | String | 主办单位名称 |
| cateCode | String | 活动分类 |
| cateName | String | 分类名称 |
| describes | String | 简介 |
| content | String | 内容 |
| address | String | 地址 |
| isCharge | Integer | 是否收费：1=收费，2=免费 |
| salePrice | Double | 金额 |
| startTime | LocalDateTime | 开始时间 |
| endTime | LocalDateTime | 结束时间 |
| status | Integer | 活动状态：0=待审核，1=审核通过，2=审核未通过 |
| auditTime | LocalDateTime | 审核时间 |
| auditRemark | String | 审核评论 |
| torder | Integer | 排序 |
| isRecommend | Integer | 是否推荐：1=是，2=否 |
| isEnable | Integer | 启用状态：1=启用，2=禁用 |
| createTime | LocalDateTime | 创建时间 |
| updateTime | LocalDateTime | 更新时间 |

### 5.2 优惠活动-详情

`GET /merchant/activity/{merchantId}/detail?activityCode=xxx`

**响应** `TblAppEnterpriseActivityResp`（字段同上）

### 5.3 优惠活动-新增

`POST /merchant/activity/{merchantId}`

**请求体** `MerchantActivityAddReq`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| name | String | 是 | 活动名称 |
| poster | String | 否 | 封面图 |
| detailPoster | String | 否 | 详情图片 |
| sponsorName | String | 否 | 主办单位名称 |
| cateCode | String | 否 | 活动分类 |
| cateName | String | 否 | 分类名称 |
| describes | String | 否 | 简介 |
| content | String | 否 | 内容 |
| address | String | 否 | 地址 |
| isCharge | Integer | 否 | 是否收费：1=收费，2=免费 |
| salePrice | Double | 否 | 金额 |
| startTime | LocalDateTime | 是 | 开始时间 |
| endTime | LocalDateTime | 是 | 结束时间 |
| status | Integer | 否 | 活动状态：0=待审核，1=审核通过，2=审核未通过 |
| torder | Integer | 否 | 排序 |
| isRecommend | Integer | 否 | 是否推荐：1=是，2=否 |
| isEnable | Integer | 否 | 启用状态：1=启用，2=禁用 |

> `orgCode`（企业标识）由后端自动注入，前端无需传。

**响应** `String`（活动唯一标识）

### 5.4 优惠活动-更新

`PUT /merchant/activity/{merchantId}`

**请求体** `MerchantActivityUpdateReq`（继承 AddReq，增加）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| uniqueCode | String | 是 | 活动唯一标识 |
| ... | | | 其余同新增 |

**响应** `Boolean`

### 5.5 优惠活动-删除

`DELETE /merchant/activity/{merchantId}/{activityCode}`

**响应** `Boolean`

---

## 六、订单

### 6.1 订单-分页列表

`GET /merchant/order/{merchantId}/page`

| 参数 | 位置 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| statusType | query | Integer | 否 | 订单状态：2=已完成，3=待付款，4=已退款 |
| keyword | query | String | 否 | 关键词 |
| pageNum | query | Long | 是 | 页码 |
| pageSize | query | Long | 是 | 每页数量 |

**响应** `PageResult<StationOrderListVO>`

| 字段 | 类型 | 说明 |
|---|---|---|
| orderid | String | 订单号 |
| customerName | String | 客户姓名 |
| goodsDesc | String | 商品描述 |
| price | BigDecimal | 金额 |
| payWay | Integer | 支付方式编码 |
| payWayLabel | String | 支付方式文案 |
| statusType | Integer | 订单状态：2=已完成，3=待付款，4=已退款 |
| statusLabel | String | 订单状态文案 |
| createTime | LocalDateTime | 下单时间 |

### 6.2 订单-详情

`GET /merchant/order/{merchantId}/detail?orderid=xxx`

**响应** `StationOrderDetailVO`

| 字段 | 类型 | 说明 |
|---|---|---|
| orderid | String | 订单号 |
| customerName | String | 客户姓名 |
| price | BigDecimal | 订单金额 |
| goodsDesc | String | 商品明细 |
| createTime | LocalDateTime | 下单时间 |
| payTime | LocalDateTime | 支付时间 |
| payWay | Integer | 支付方式编码 |
| payWayLabel | String | 支付方式文案 |
| statusType | Integer | 订单状态：2=已完成，3=待付款，4=已退款 |
| statusLabel | String | 订单状态文案 |

### 6.3 订单-导出

`GET /merchant/order/{merchantId}/export`

| 参数 | 位置 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| statusType | query | Integer | 否 | 订单状态 |
| keyword | query | String | 否 | 关键词 |

**响应**：二进制文件流（`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`），文件名 `订单导出.xlsx`

前端处理示例：
```javascript
const res = await fetch(`/merchant/order/${merchantId}/export?statusType=${statusType}`, {
  headers: { Authorization: `Bearer ${token}` }
});
const blob = await res.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = '订单导出.xlsx';
a.click();
URL.revokeObjectURL(url);
```

---

## 前端对接要点

### merchantId 的获取

| 场景 | 获取方式 |
|---|---|
| 商户自己登录 | 登录后从用户信息获取自己的 `merchantId`，后续所有请求都带上 |
| 站长进入商户后台 | 从站长商户列表 `GET /station/merchant/page` 获取目标 `merchantId`，通过 URL 参数 `?mId=xxx` 传递到商户后台页面 |

### 多标签页 Token 隔离

- 商户后台页面和站长后台页面使用独立的 `sessionStorage` 存储 Token
- 关闭标签页时 Token 自动销毁，互不影响

### 请求头

```
Authorization: Bearer {token}
Content-Type: application/json
```
