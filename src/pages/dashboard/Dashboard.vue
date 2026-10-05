<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-primary-border/60">
      <div>
        <h1 class="title-text text-primary-text">HRMS Dashboard</h1>
        <p class="sub-text text-secondary-text">Overview of workforce operations, attendance, and administrative tasks.</p>
      </div>

      <div class="flex items-center gap-2">
        <button type="button" class="btn-secondary text-xs">
          <span class="material-symbols-rounded text-base">download</span>
          <span>Export Summary</span>
        </button>
        <button type="button" class="btn-primary text-xs">
          <span class="material-symbols-rounded text-base">person_add</span>
          <span>New Employee</span>
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="stat in stats" 
        :key="stat.title"
        class="bg-card-background border border-primary-border/60 rounded-xl p-4 flex flex-col justify-between"
      >
        <div class="flex items-center justify-between text-secondary-text mb-3">
          <span class="text-xs font-medium">{{ stat.title }}</span>
          <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span class="material-symbols-rounded text-base">{{ stat.icon }}</span>
          </div>
        </div>
        <div class="flex items-baseline justify-between">
          <span class="text-2xl font-semibold text-primary-text">{{ stat.value }}</span>
          <span 
            class="text-[11px] font-medium px-1.5 py-0.5 rounded"
            :class="stat.isPositive ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-yellow/10 text-primary-yellow'"
          >
            {{ stat.change }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Activity / Overview Card -->
    <div class="bg-card-background border border-primary-border/60 rounded-xl p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="normal-text text-primary-text">Workforce Operations</h2>
          <p class="sub-text text-secondary-text">System status and live operational feeds</p>
        </div>
        <span class="text-xs font-medium text-primary-green flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-primary-green animate-pulse"></span>
          All systems operational
        </span>
      </div>

      <div class="p-8 text-center text-secondary-text text-xs border border-dashed border-primary-border/80 rounded-lg">
        <span class="material-symbols-rounded text-3xl text-secondary-text mb-2 block">space_dashboard</span>
        <p class="font-medium text-primary-text">Welcome to your new HRMS Portal</p>
        <p class="text-secondary-text mt-1 max-w-sm mx-auto">
          Single top navigation bar active. Layout configured with subtle slate tones, zero drop shadows, and hairline borders.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const stats = [
  { title: 'Total Employees', value: '248', change: '+12% this month', icon: 'group', isPositive: true },
  { title: 'Present Today', value: '231', change: '93.1% attendance', icon: 'check_circle', isPositive: true },
  { title: 'Pending Leaves', value: '8', change: '3 urgent reviews', icon: 'event_busy', isPositive: false },
  { title: 'Open Requisitions', value: '5', change: '2 in interview', icon: 'person_search', isPositive: true },
]
</script>
