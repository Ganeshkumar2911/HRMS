<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
    :class="toneClass"
  >
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: { type: [String, null], default: null },
  label: { type: String, default: "" },
});

const displayLabel = computed(() => props.label || props.status || "—");

const toneClass = computed(() => {
  const value = String(props.status || "").toUpperCase();
  if (["ACTIVE", "APPROVED", "PRESENT", "COMPLETED", "SUCCESS"].includes(value)) {
    return "bg-primary-green/15 text-primary-green";
  }
  if (["PENDING", "UPCOMING", "PICK_LATER", "HALF_DAY", "ON_LEAVE", "ON_NOTICE", "WFH"].includes(value)) {
    return "bg-primary-yellow/15 text-primary-yellow";
  }
  if (["INACTIVE", "REJECTED", "CANCELLED", "ABSENT", "FAILED", "TERMINATED", "SUSPENDED"].includes(value)) {
    return "bg-primary-red/15 text-primary-red";
  }
  if (["HOLIDAY", "WEEK_OFF", "UNMARKED", "DRAFT"].includes(value)) {
    return "bg-secondary-text/15 text-secondary-text";
  }
  return "bg-primary-blue/15 text-primary-blue";
});

const label = displayLabel;
</script>
