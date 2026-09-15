import type { ComputedRef, InjectionKey } from "vue"

export interface TimelineContext {
  activeStep: ComputedRef<number>
  setActiveStep: (step: number) => void
  orientation: ComputedRef<"horizontal" | "vertical">
}

export const TIMELINE_INJECTION_KEY: InjectionKey<TimelineContext> = Symbol("Timeline")
