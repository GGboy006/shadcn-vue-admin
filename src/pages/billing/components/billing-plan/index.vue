<script lang="ts" setup>
import PlanCard from './plan-card.vue'

const plans = [
  {
    title: '免费版',
    price: 0,
    billingCycle: 'month',
    description: '从免费套餐开始，探索所有功能。',
    features: [
      '功能 1',
      '功能 2',
      '功能 3',
    ],
    buttonLabel: '当前套餐',
    active: true,
  },
  {
    title: '小型企业版',
    price: 19.99,
    discount: 49.99,
    billingCycle: 'month',
    description: '使用小型企业套餐，开始发展您的业务。',
    features: [
      '包含免费版所有功能',
      '10 个用户',
      '10G 存储空间',
    ],
    buttonLabel: '切换到此套餐',
  },
  {
    title: '企业版',
    price: 199.99,
    discount: 499.99,
    billingCycle: 'month',
    description: '使用企业套餐，尽享一切最佳功能。',
    features: [
      '包含小型企业版所有功能',
      '无限用户',
      '无限存储空间',
    ],
    buttonLabel: '切换到此套餐',
  },
]
</script>

<template>
  <div class="p-2 rounded-md bg-secondary">
    <div class="grid grid-cols-1 gap-2 md:grid-cols-1 lg:grid-cols-3">
      <PlanCard
        v-for="(plan, index) in plans"
        :key="index"
        :title="plan.title"
        :price="plan.price"
        :discount="plan.discount"
        :billing-cycle="plan.billingCycle"
        :description="plan.description"
        :features="plan.features"
        :button-label="plan.buttonLabel"
        :active="plan.active"
      />
    </div>
  </div>
</template>
