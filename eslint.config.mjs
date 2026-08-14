import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default antfu({
  type: 'app',
  vue: {
    overrides: {
      'vue/block-lang': ['warn', {
        script: { lang: ['ts', 'tsx'] },
      }],
      // 拦截「模板用了未导入的组件」—— Vue 对此不报错,会渲染成未知 HTML 元素,
      // strictTemplates 默认关闭时 vue-tsc 也会当 any 放过,属于纯隐形缺陷。
      // ignorePatterns 放行 unplugin-vue-components 按 directoryAsNamespace
      // 生成的全局名(本规则只看 import,不认识构建期注册),否则会有数百误报。
      'vue/no-undef-components': ['error', {
        ignorePatterns: [
          '^Ui[A-Z]', // src/components/ui/**
          '^PropUi[A-Z]', // src/components/prop-ui/**
          '^router-(view|link)$', // vue-router
        ],
      }],
    },
  },
  typescript: true,
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },

  ignores: [
    '**/build/**',
    '**/components/ui/**',
    '**/*.md',
  ],
  settings: {
    'import/core-modules': ['vue-router/auto-routes'],
  },
  globals: {
    definePage: 'readonly',
  },

  imports: {
    overrides: {
      'perfectionist/sort-imports': ['error', {
        tsconfig: { rootDir: '.' },
      }],
    },
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
  },
  ...pluginQuery.configs['flat/recommended'],
})
