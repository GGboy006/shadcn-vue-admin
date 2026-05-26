/**
 * 接口业务状态码（与后端对齐）
 * code = 0 表示成功
 */
export enum ApiStatus {
  /** 成功 */
  success = 0,
  /** 通用错误 */
  error = 400,

  // HTTP 标准状态码
  forbidden = 403,
  notFound = 404,
  methodNotAllowed = 405,
  requestTimeout = 408,
  internalServerError = 500,
  badGateway = 502,
  serviceUnavailable = 503,
  gatewayTimeout = 504,

  // 1xxxx 系统级错误
  systemError = 10001,
  ossError = 10008,
  ossUnavailable = 10009,

  // 3xxxx 用户/认证相关
  paramError = 30001,
  unauthorized = 30002,
  userNotExist = 30003,
  userDisabled = 30004,
  userDeleted = 30005,
  passwordError = 30007,
  smsCodeInvalid = 30008,
  menuNotExist = 30029,
  menuCodeDuplicate = 30030,
  menuHasChildren = 30031,
  roleNotExist = 30032,
  roleNameDuplicate = 30033,
  roleIsSuper = 30034,
  userPhoneDuplicate = 30035,
  userIsSuper = 30036,
  userRoleExist = 30037,
  noPermission = 30038,
  userTypeNotAllowed = 30039,
  userMerchantRole = 30040,
  roleTypeDuplicate = 30041,

  // 4xxxx 业务参数/权限错误
  bizParamError = 40001,
  dataNotFound = 40002,
  bizNoPermission = 40003,
  aiError = 40021,
  aiFileError = 40023,
}

/**
 * 状态码对应的中文错误信息
 */
export const ApiStatusMessage: Record<number, string> = {
  [ApiStatus.success]: '操作成功',
  [ApiStatus.error]: '请求失败',
  [ApiStatus.forbidden]: '禁止访问',
  [ApiStatus.notFound]: '资源不存在',
  [ApiStatus.internalServerError]: '服务器内部错误',
  [ApiStatus.systemError]: '系统错误',
  [ApiStatus.paramError]: '参数错误',
  [ApiStatus.unauthorized]: '未登录或登录已失效',
  [ApiStatus.userNotExist]: '用户不存在',
  [ApiStatus.userDisabled]: '用户已被禁用',
  [ApiStatus.userDeleted]: '用户已注销',
  [ApiStatus.passwordError]: '账号或密码错误',
  [ApiStatus.smsCodeInvalid]: '验证码错误或已失效',
  [ApiStatus.noPermission]: '无权限执行此操作',
  [ApiStatus.dataNotFound]: '数据不存在',
}

/**
 * 判断请求是否成功
 */
export function isSuccess(code: number): boolean {
  return code === ApiStatus.success
}

/**
 * 判断是否未登录
 */
export function isUnauthorized(code: number): boolean {
  return code === ApiStatus.unauthorized
}
