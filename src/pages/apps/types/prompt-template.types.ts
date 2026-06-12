export interface IPromptTemplateFieldCondition {
  when: string
  operator: string
  value: string
}

export interface IPromptTemplateOption {
  label: string
  value: string
}

export interface IPromptTemplateComponent {
  name: 'input' | 'select'
  value?: string
  attrs: {
    type?: 'text' | 'textarea'
    placeholder?: string
    multiple?: boolean
    /** select 展示模式：空=下拉，grid=平铺 */
    displayMode?: 'grid'
    orginOptions?: IPromptTemplateOption[]
  }
}

export interface IPromptTemplateField {
  prop: string
  label: string
  /** 字段说明/占位提示 */
  remarks?: string
  widthRatio?: 1 | 2 | 3 | 4
  /** 是否必填 */
  isRequired?: boolean
  conditions?: IPromptTemplateFieldCondition
  component: IPromptTemplateComponent
}

export interface IPromptTemplateRule {
  required?: boolean | string
  message?: string
  trigger?: string
  [key: string]: unknown
}

export interface IPromptTemplateForm {
  form: IPromptTemplateField[]
  rules?: Record<string, IPromptTemplateRule[]>
  /** 提示词模板，含 {字段标签} 占位符 */
  user_msg?: string
}
