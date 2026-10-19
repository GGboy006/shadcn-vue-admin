<route lang="yaml">
meta:
  roles: [9]
</route>

<script setup lang="ts">
import OrderBrowser from '../community/steward-orders/order-browser.vue'
import KindGate from './components/kind-gate.vue'
</script>

<template>
  <KindGate v-slot="{ kind }">
    <OrderBrowser :scope="kind === 'partner' ? 'partner' : 'self'" />
  </KindGate>
</template>
