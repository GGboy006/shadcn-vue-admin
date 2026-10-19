import type { ComputedRef, InjectionKey } from 'vue'

export type HousekeeperOrderScope = 'station' | 'self' | 'partner'

export const housekeeperOrderScopeKey: InjectionKey<ComputedRef<HousekeeperOrderScope>> = Symbol('housekeeperOrderScope')
