<route lang="yaml">
meta:
  roles: [9]
</route>

<script setup lang="ts">
import KindGate from './components/kind-gate.vue'
import LocalStaff from './components/local-staff.vue'
import StaffBrowser from './components/partner-staff/staff-browser.vue'
</script>

<template>
  <KindGate v-slot="{ kind }">
    <StaffBrowser v-if="kind === 'partner'" />
    <LocalStaff v-else />
  </KindGate>
</template>
