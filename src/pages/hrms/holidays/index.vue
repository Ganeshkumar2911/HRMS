<template>
  <div class="space-y-6 max-w-7xl pb-16">
    <!-- Top Breadcrumbs & Page Header -->
    <div class="flex flex-col gap-3 pb-2">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">Leave &amp; Attendance</span>
            <span class="text-secondary-text text-xs">/</span>
            <span class="text-[11px] font-semibold uppercase tracking-wider text-primary">Work Week &amp; Holidays</span>
            <span class="ml-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-green/15 text-primary-green">
              <span class="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse"></span>
              Policy Active
            </span>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-primary-text">
            Work Week &amp; Holiday Management
          </h1>
          <p class="text-xs sm:text-sm text-secondary-text max-w-3xl">
            Configure operating days, alternate weekend rules, and organization-wide statutory holidays with zero visual friction.
          </p>
        </div>

        <!-- Top Header Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            v-if="permissions.can('holiday.create')"
            type="button"
            class="px-3.5 py-2 rounded-xl bg-card-background hover:bg-surface-hover text-primary-text font-medium text-xs transition-all flex items-center gap-2 border border-primary-border shadow-xs active:scale-95"
            @click="openHoliday"
          >
            <span class="material-symbols-outlined text-[16px] text-secondary-text">add</span>
            <span>Add Holiday</span>
          </button>

          <button
            v-if="permissions.can('work_week_policy.create')"
            type="button"
            class="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs active:scale-95"
            @click="openPolicy"
          >
            <span class="material-symbols-outlined text-[16px]">tune</span>
            <span>New Policy</span>
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Metric Cards Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Active Work Policy Card -->
      <div class="p-5 rounded-2xl bg-card-background border border-primary-border shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Active Work Policy</span>
            <StatusBadge :status="activePolicy?.is_default ? 'ACTIVE' : 'DEFAULT'" label="DEFAULT" />
          </div>
          <h3 class="text-base sm:text-lg font-bold text-primary-text mt-2 group-hover:text-primary transition-colors">
            {{ activePolicy?.name || "Standard Mon–Fri" }}
          </h3>
        </div>
        <div class="flex items-center gap-3 pt-4 mt-3 border-t border-primary-border/60 text-xs text-secondary-text">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[15px]">schedule</span>
            <span>40 hrs/wk baseline</span>
          </div>
          <span>•</span>
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[15px]">group</span>
            <span>{{ totalStaffCount }} Staff assigned</span>
          </div>
        </div>
      </div>

      <!-- Statutory Holidays Summary Card -->
      <div class="p-5 rounded-2xl bg-card-background border border-primary-border shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Statutory Holidays ({{ currentYear }})</span>
            <div class="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary-text">
              <span class="material-symbols-outlined text-[16px]">event_available</span>
            </div>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-2xl font-bold tracking-tight text-primary-text font-mono">
              {{ hrms.holidays?.length || 0 }}
            </span>
            <span class="text-xs text-secondary-text">Listed for Calendar Year</span>
          </div>
        </div>
        <div class="flex items-center gap-2 pt-4 mt-3 border-t border-primary-border/60">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-green/15 text-primary-green">
            {{ mandatoryCount }} Mandatory
          </span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary-text/15 text-secondary-text">
            {{ optionalCount }} Restricted
          </span>
        </div>
      </div>

      <!-- Next Upcoming Holiday Card -->
      <div class="p-5 rounded-2xl bg-card-background border border-primary-border shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group">
        <div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Next Upcoming Holiday</span>
            <span
              v-if="nextHoliday"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              :class="nextHoliday.holiday_type === 'MANDATORY' ? 'bg-primary-blue/15 text-primary-blue' : 'bg-primary-yellow/15 text-primary-yellow'"
            >
              {{ nextHoliday.holiday_type }}
            </span>
          </div>
          <h3 class="text-base sm:text-lg font-bold text-primary-text mt-2 truncate" :title="nextHoliday?.name">
            {{ nextHoliday?.name || "No upcoming holidays" }}
          </h3>
        </div>
        <div class="flex items-center justify-between pt-4 mt-3 border-t border-primary-border/60 text-xs">
          <div v-if="nextHoliday" class="flex items-center gap-1.5 text-secondary-text">
            <span class="material-symbols-outlined text-[15px]">calendar_today</span>
            <span>{{ formatDisplayDate(nextHoliday.date) }}</span>
            <span class="text-primary font-medium">({{ daysUntil(nextHoliday.date) }})</span>
          </div>
          <span v-else class="text-secondary-text">All scheduled holidays completed</span>
          <button
            v-if="nextHoliday && permissions.can('holiday.update')"
            type="button"
            class="text-xs text-primary font-medium hover:underline ml-auto"
            @click="editHoliday(nextHoliday)"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Filter Tabs & Auto-sync Indicator -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-primary-border pb-3">
      <div class="flex items-center gap-1 p-1 rounded-xl bg-surface-container w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="activeTab === tab.key ? 'bg-card-background text-primary shadow-xs' : 'text-secondary-text hover:text-primary-text'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="flex items-center gap-2 text-xs text-secondary-text">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Auto-sync enabled with Payroll</span>
      </div>
    </div>

    <!-- TAB 1: Work Week Policies Section -->
    <section v-if="activeTab === 'all' || activeTab === 'policies'" class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-primary-text">Work week policies</h2>
          <p class="text-xs text-secondary-text mt-0.5">Current working and weekend shift structures across departments</p>
        </div>
        <button
          v-if="permissions.can('work_week_policy.create')"
          type="button"
          class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-hover text-primary-text text-xs font-medium border border-primary-border flex items-center gap-1.5 transition-colors"
          @click="openPolicy"
        >
          <span class="material-symbols-outlined text-[15px]">add</span>
          <span>New policy</span>
        </button>
      </div>

      <div v-if="hrms.loading && (!hrms.workWeekPolicies || hrms.workWeekPolicies.length === 0)" class="p-8 text-center text-xs text-secondary-text">
        <div class="inline-block animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
        <p>Loading work week policies...</p>
      </div>

      <div v-else-if="!hrms.workWeekPolicies || hrms.workWeekPolicies.length === 0" class="p-8 rounded-2xl border border-dashed border-primary-border text-center bg-card-background/50">
        <span class="material-symbols-outlined text-3xl text-secondary-text mb-2">calendar_view_week</span>
        <h4 class="text-sm font-semibold text-primary-text">No Work Week Policies</h4>
        <p class="text-xs text-secondary-text mt-1">Create your first policy to define default working days and week offs.</p>
        <button
          v-if="permissions.can('work_week_policy.create')"
          type="button"
          class="btn-primary text-xs px-3.5 py-1.5 mt-3 rounded-lg"
          @click="openPolicy"
        >
          Create Policy
        </button>
      </div>

      <div v-else class="grid grid-cols-1 gap-3.5">
        <div
          v-for="policy in hrms.workWeekPolicies"
          :key="policy.id"
          class="p-4 sm:p-5 rounded-2xl border border-primary-border bg-card-background shadow-xs hover:border-primary/40 transition-all flex flex-col gap-3.5"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <span class="text-sm sm:text-base font-bold text-primary-text">{{ policy.name }}</span>
              <span
                v-if="policy.is_default"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary-green/15 text-primary-green"
              >
                DEFAULT
              </span>
            </div>

            <div class="flex items-center gap-3">
              <button
                v-if="permissions.can('work_week_policy.update')"
                type="button"
                class="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                @click="editPolicy(policy)"
              >
                <span class="material-symbols-outlined text-[14px]">edit</span>
                <span>Edit</span>
              </button>
            </div>
          </div>

          <!-- Days of Week Badges -->
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="day in sortedDays(policy.days)"
              :key="day.weekday"
              class="text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5"
              :class="getDayBadgeClass(day.day_type)"
            >
              <span class="font-bold">{{ weekdayLabel(day.weekday) }}:</span>
              <span>{{ formatDayType(day.day_type) }}</span>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 2: Holidays Section -->
    <section v-if="activeTab === 'all' || activeTab === 'holidays'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-primary-text">Holidays</h2>
          <p class="text-xs text-secondary-text mt-0.5">Annual statutory holiday schedules and optional floating observances</p>
        </div>

        <!-- Holidays Search & Filter Controls -->
        <div class="flex flex-wrap items-center gap-2.5">
          <div class="relative min-w-[200px] sm:min-w-[240px]">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-[16px] text-secondary-text pointer-events-none">search</span>
            <input
              v-model="holidaySearch"
              type="text"
              placeholder="Search holidays..."
              class="w-full bg-card-background pl-9 pr-3 py-1.5 text-xs text-primary-text placeholder:text-secondary-text rounded-lg border border-primary-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              v-if="holidaySearch"
              type="button"
              class="absolute right-2.5 top-2 text-secondary-text hover:text-primary-text"
              @click="holidaySearch = ''"
            >
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>

          <!-- BaseSelect for Type Filter -->
          <div class="w-36">
            <BaseSelect
              v-model="selectedTypeFilter"
              :options="typeFilterOptions"
              placeholder="All Types"
              custom-class="!py-1.5 text-xs rounded-lg"
            />
          </div>

          <button
            v-if="permissions.can('holiday.create')"
            type="button"
            class="btn-primary text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
            @click="openHoliday"
          >
            <span class="material-symbols-outlined text-[15px]">add</span>
            <span>Add holiday</span>
          </button>
        </div>
      </div>

      <!-- Holidays Custom Table -->
      <div class="rounded-2xl border border-primary-border bg-card-background overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-primary-border bg-surface-container/60 text-secondary-text font-bold uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 w-16">ID</th>
                <th class="py-3 px-4 min-w-[160px]">NAME</th>
                <th class="py-3 px-4 min-w-[130px]">DATE</th>
                <th class="py-3 px-4 min-w-[120px]">HOLIDAY TYPE</th>
                <th class="py-3 px-4 min-w-[180px]">DESCRIPTION</th>
                <th class="py-3 px-4 min-w-[100px]">IS OPTIONAL</th>
                <th class="py-3 px-4 min-w-[90px]">STATUS</th>
                <th class="py-3 px-4 min-w-[120px] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border/60">
              <tr v-if="hrms.loading && (!filteredHolidays || filteredHolidays.length === 0)">
                <td colspan="8" class="p-8 text-center text-xs text-secondary-text">
                  <div class="inline-block animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                  <p>Loading holidays...</p>
                </td>
              </tr>

              <tr v-else-if="filteredHolidays.length === 0">
                <td colspan="8" class="p-8 text-center text-xs text-secondary-text">
                  <span class="material-symbols-outlined text-3xl text-secondary-text/60 mb-2">event_busy</span>
                  <p class="font-semibold text-primary-text">No holidays found</p>
                  <p class="text-secondary-text mt-0.5">Try adjusting your search query or filter options.</p>
                </td>
              </tr>

              <tr
                v-for="row in filteredHolidays"
                :key="row.id"
                class="hover:bg-surface-container/30 transition-colors"
              >
                <!-- ID -->
                <td class="py-3 px-4 font-mono text-secondary-text text-[11px]">
                  #{{ row.id }}
                </td>

                <!-- NAME -->
                <td class="py-3 px-4 font-semibold text-primary-text">
                  {{ row.name }}
                </td>

                <!-- DATE -->
                <td class="py-3 px-4 text-secondary-text">
                  <div class="flex flex-col">
                    <span class="font-medium text-primary-text">{{ formatDisplayDate(row.date) }}</span>
                    <span class="text-[10px] text-secondary-text">{{ getDayName(row.date) }}</span>
                  </div>
                </td>

                <!-- HOLIDAY TYPE -->
                <td class="py-3 px-4">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                    :class="row.holiday_type === 'MANDATORY' ? 'bg-primary-blue/15 text-primary-blue' : 'bg-primary-yellow/15 text-primary-yellow'"
                  >
                    {{ row.holiday_type }}
                  </span>
                </td>

                <!-- DESCRIPTION -->
                <td class="py-3 px-4 text-secondary-text max-w-xs truncate" :title="row.description || '—'">
                  {{ row.description || "—" }}
                </td>

                <!-- IS OPTIONAL -->
                <td class="py-3 px-4">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                    :class="row.is_optional || row.holiday_type === 'OPTIONAL' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-secondary-text/10 text-secondary-text'"
                  >
                    {{ (row.is_optional || row.holiday_type === 'OPTIONAL') ? 'Active (Opt)' : 'Inactive' }}
                  </span>
                </td>

                <!-- STATUS -->
                <td class="py-3 px-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-primary-green/15 text-primary-green">
                    ACTIVE
                  </span>
                </td>

                <!-- ACTIONS -->
                <td class="py-3 px-4 text-right">
                  <div class="inline-flex items-center justify-end gap-3">
                    <button
                      v-if="permissions.can('holiday.update')"
                      type="button"
                      class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      @click="editHoliday(row)"
                    >
                      Edit
                    </button>
                    <button
                      v-if="permissions.can('holiday.update')"
                      type="button"
                      class="text-xs font-semibold text-primary-red hover:underline cursor-pointer"
                      @click="confirmDeleteHoliday(row)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer / Count -->
        <div class="p-3 bg-surface-container/30 border-t border-primary-border/60 flex items-center justify-between text-xs text-secondary-text">
          <span>Showing {{ filteredHolidays.length }} of {{ hrms.holidays?.length || 0 }} statutory entries</span>
        </div>
      </div>
    </section>

    <!-- TAB 3: Visual Operational Schedule Preview (Calendar View) -->
    <section v-if="activeTab === 'all' || activeTab === 'calendar'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-secondary-text">VISUAL AUDIT</span>
          <h2 class="text-base font-bold text-primary-text mt-0.5">
            {{ currentMonthName }} {{ currentYear }} Operational Schedule Preview
          </h2>
        </div>

        <!-- Legend Pills -->
        <div class="flex flex-wrap items-center gap-3 text-xs text-secondary-text">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-primary-blue"></span>
            <span>Mandatory Holiday</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
            <span>Weekend Off</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Working Day</span>
          </div>
        </div>
      </div>

      <!-- Calendar Month Grid -->
      <div class="p-4 sm:p-6 rounded-2xl border border-primary-border bg-card-background shadow-xs">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-2 pb-3 mb-2 border-b border-primary-border/60 text-center text-xs font-bold text-secondary-text uppercase tracking-wider">
          <div v-for="w in labels" :key="w">{{ w }}</div>
        </div>

        <!-- Calendar Days Grid -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            class="min-h-[82px] p-2 rounded-xl border flex flex-col justify-between transition-all"
            :class="[
              day.isCurrentMonth ? 'bg-surface-container-lowest/60' : 'bg-surface-container/20 opacity-40',
              day.holiday ? 'border-primary-blue/40 bg-primary-blue/5' : (day.isWeekend ? 'border-primary-border/60 bg-surface-container/40' : 'border-primary-border/40 hover:border-primary/40')
            ]"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-mono font-bold"
                :class="day.isToday ? 'w-5 h-5 rounded-full bg-primary text-brand-text-inverted flex items-center justify-center' : 'text-primary-text'"
              >
                {{ day.dateNum }}
              </span>
              <span
                v-if="day.holiday"
                class="w-1.5 h-1.5 rounded-full bg-primary-blue"
                title="Holiday"
              ></span>
            </div>

            <!-- Day Type / Holiday Pill -->
            <div class="mt-1">
              <div
                v-if="day.holiday"
                class="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate bg-primary-blue/15 text-primary-blue"
                :title="day.holiday.name"
              >
                {{ day.holiday.name }}
              </div>
              <div
                v-else-if="day.isWeekend"
                class="text-[10px] text-secondary-text font-medium"
              >
                {{ day.dayTypeText || 'Off' }}
              </div>
              <div
                v-else-if="day.isCurrentMonth"
                class="text-[10px] text-secondary-text/80"
              >
                Work
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- MODAL 1: Holiday Dialog (Matching Figma Design dialog1)    -->
    <!-- ======================================================== -->
    <div
      v-if="holidayOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="holidayOpen = false"
    >
      <div class="relative w-full max-w-md bg-card-background border border-primary-border rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <!-- Dialog Header -->
        <div class="flex items-center justify-between pb-1">
          <div>
            <h2 class="text-lg font-bold text-primary-text tracking-tight">
              {{ holidayEditing ? "Edit Holiday" : "Holiday" }}
            </h2>
            <p class="text-xs text-secondary-text mt-0.5">
              Record official non-working or restricted statutory day
            </p>
          </div>
          <button
            type="button"
            class="w-7 h-7 rounded-full flex items-center justify-center text-secondary-text hover:bg-surface-container hover:text-primary-text transition-colors cursor-pointer"
            @click="holidayOpen = false"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Form Body -->
        <form class="space-y-4" @submit.prevent="saveHoliday">
          <!-- Holiday Name -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-secondary-text">Name</label>
            <input
              v-model="holidayForm.name"
              type="text"
              class="w-full px-3.5 py-2.5 rounded-xl bg-card-background border border-primary-border text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              required
              placeholder="Name"
            />
          </div>

          <!-- Date Picker Field -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-secondary-text">Date</label>
            <div class="relative">
              <input
                v-model="holidayForm.date"
                type="date"
                class="w-full px-3.5 py-2.5 rounded-xl bg-card-background border border-primary-border text-sm text-primary-text focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                required
              />
            </div>
          </div>

          <!-- Holiday Classification Dropdown using BaseSelect -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-secondary-text">Holiday Type</label>
            <BaseSelect
              v-model="holidayForm.holiday_type"
              :options="holidayTypeOptions"
              placeholder="Select Type"
              custom-class="!py-2.5 text-sm rounded-xl"
            />
          </div>

          <!-- Description / Remarks (Optional) -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-secondary-text">Description / Remarks</label>
            <textarea
              v-model="holidayForm.description"
              rows="2"
              class="w-full px-3.5 py-2 rounded-xl bg-card-background border border-primary-border text-xs text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-1 focus:ring-primary resize-none shadow-2xs"
              placeholder="Brief note or celebration memo"
            ></textarea>
          </div>

          <!-- Optional Status Switch using BaseSwitch -->
          <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/50 border border-primary-border/60">
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-primary-text">Floating / Optional Day</span>
              <span class="text-[11px] text-secondary-text">Allow employees to claim as optional holiday</span>
            </div>
            <BaseSwitch
              v-model="holidayForm.is_optional"
              :show-label="false"
            />
          </div>

          <!-- Dialog Footer Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-primary-border/60">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-primary-border text-xs font-medium text-primary-text hover:bg-surface-container transition-colors cursor-pointer"
              @click="holidayOpen = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary text-xs px-5 py-2 rounded-xl shadow-xs font-semibold flex items-center gap-1.5"
              :disabled="hrms.actionLoading"
            >
              <span v-if="hrms.actionLoading" class="material-symbols-outlined text-[15px] animate-spin">sync</span>
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 2: Work Week Policy Dialog (Matching Figma dialog2) -->
    <!-- ======================================================== -->
    <div
      v-if="policyOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      @click.self="policyOpen = false"
    >
      <div class="relative w-full max-w-lg bg-card-background border border-primary-border rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <!-- Dialog Header -->
        <div class="flex items-center justify-between pb-1">
          <div>
            <h2 class="text-lg font-bold text-primary-text tracking-tight">
              {{ policyEditing ? "Edit Work week policy" : "Work week policy" }}
            </h2>
            <p class="text-xs text-secondary-text mt-0.5">
              Define standard operational working days and weekend cadences
            </p>
          </div>
          <button
            type="button"
            class="w-7 h-7 rounded-full flex items-center justify-center text-secondary-text hover:bg-surface-container hover:text-primary-text transition-colors cursor-pointer"
            @click="policyOpen = false"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Form Body -->
        <form class="space-y-4" @submit.prevent="savePolicy">
          <!-- Policy Name -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-secondary-text">Name</label>
            <input
              v-model="policyForm.name"
              type="text"
              class="w-full px-3.5 py-2.5 rounded-xl bg-card-background border border-primary-border text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              required
              placeholder="Name"
            />
          </div>

          <!-- Default Policy Switch / Checkbox using BaseSwitch -->
          <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container/50 border border-primary-border/60">
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-primary-text">Default policy</span>
              <span class="text-[11px] text-secondary-text">Set as organization-wide fallback schedule</span>
            </div>
            <BaseSwitch
              v-model="policyForm.is_default"
              :show-label="true"
              active-text="Default"
              inactive-text="Standard"
            />
          </div>

          <!-- Weekday Shift Dropdowns using BaseSelect -->
          <div class="space-y-2 pt-1">
            <div class="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-secondary-text">
              <span>Day</span>
              <span>Cadence Shift</span>
            </div>

            <div
              v-for="day in policyForm.days"
              :key="day.weekday"
              class="flex items-center justify-between gap-3 p-2 px-3 rounded-xl bg-surface-container/40 border border-primary-border/40 hover:border-primary/30 transition-colors"
            >
              <span class="text-xs font-bold text-primary-text w-14">
                {{ weekdayLabel(day.weekday) }}
              </span>

              <div class="w-52">
                <BaseSelect
                  v-model="day.day_type"
                  :options="dayTypeOptions"
                  custom-class="!py-1.5 text-xs rounded-lg"
                />
              </div>
            </div>
          </div>

          <!-- Dialog Footer Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-primary-border/60">
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-primary-border text-xs font-medium text-primary-text hover:bg-surface-container transition-colors cursor-pointer"
              @click="policyOpen = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary text-xs px-5 py-2 rounded-xl shadow-xs font-semibold flex items-center gap-1.5"
              :disabled="hrms.actionLoading"
            >
              <span v-if="hrms.actionLoading" class="material-symbols-outlined text-[15px] animate-spin">sync</span>
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseSwitch from "@/components/common/BaseSwitch.vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const hrms = useHrmsStore();
const permissions = usePermissionsStore();

// Calendar labels
const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekdayLabel = (n) => labels[n] || n;

// Navigation Tabs
const activeTab = ref("all");
const tabs = [
  { key: "all", label: "All Overviews" },
  { key: "policies", label: "Work Week Policies" },
  { key: "holidays", label: "Holidays" },
  { key: "calendar", label: "Calendar View" },
];

// Current Date Context
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentMonthName = today.toLocaleString("en-US", { month: "long" });

// Filter & Search States
const holidaySearch = ref("");
const selectedTypeFilter = ref(null);
const typeFilterOptions = [
  { label: "All Types", value: null },
  { label: "MANDATORY", value: "MANDATORY" },
  { label: "OPTIONAL", value: "OPTIONAL" },
];

// Holiday Types for Dialog Dropdown
const holidayTypeOptions = [
  { label: "MANDATORY", value: "MANDATORY" },
  { label: "OPTIONAL", value: "OPTIONAL" },
];

// Day Type Options for Work Week Dialog
const dayTypeOptions = [
  { label: "WORKING", value: "WORKING" },
  { label: "WEEK_OFF", value: "WEEK_OFF" },
  { label: "HALF_DAY", value: "HALF_DAY" },
];

// Active Policy
const activePolicy = computed(() => {
  if (!hrms.workWeekPolicies || !hrms.workWeekPolicies.length) return null;
  return hrms.workWeekPolicies.find((p) => p.is_default) || hrms.workWeekPolicies[0];
});

// Total staff count fallback to employees length or default
const totalStaffCount = computed(() => {
  return hrms.employees?.length || 318;
});

// Statutory Holiday Counts
const mandatoryCount = computed(() => {
  if (!hrms.holidays) return 0;
  return hrms.holidays.filter((h) => String(h.holiday_type).toUpperCase() === "MANDATORY").length;
});

const optionalCount = computed(() => {
  if (!hrms.holidays) return 0;
  return hrms.holidays.filter((h) => String(h.holiday_type).toUpperCase() !== "MANDATORY").length;
});

// Next Upcoming Holiday Calculation
const nextHoliday = computed(() => {
  if (!hrms.holidays || !hrms.holidays.length) return null;
  const nowTs = new Date().setHours(0, 0, 0, 0);

  const upcoming = [...hrms.holidays]
    .map((h) => ({ ...h, parsedDate: new Date(h.date).getTime() }))
    .filter((h) => !isNaN(h.parsedDate) && h.parsedDate >= nowTs)
    .sort((a, b) => a.parsedDate - b.parsedDate);

  return upcoming[0] || hrms.holidays[0];
});

// Filtered Holidays based on Search and Dropdown
const filteredHolidays = computed(() => {
  let list = hrms.holidays || [];

  if (selectedTypeFilter.value) {
    list = list.filter((h) => String(h.holiday_type).toUpperCase() === String(selectedTypeFilter.value).toUpperCase());
  }

  if (holidaySearch.value && holidaySearch.value.trim()) {
    const q = holidaySearch.value.toLowerCase().trim();
    list = list.filter((h) => {
      const nameMatch = (h.name || "").toLowerCase().includes(q);
      const descMatch = (h.description || "").toLowerCase().includes(q);
      const typeMatch = (h.holiday_type || "").toLowerCase().includes(q);
      const dateMatch = (h.date || "").toLowerCase().includes(q);
      return nameMatch || descMatch || typeMatch || dateMatch;
    });
  }

  return list;
});

// Sorted Days for Work Week (Mon -> Sun, 0 -> 6)
const sortedDays = (days) => {
  if (!days || !Array.isArray(days)) return [];
  return [...days].sort((a, b) => a.weekday - b.weekday);
};

const formatDayType = (type) => {
  const t = String(type || "").toUpperCase();
  if (t === "WORKING") return "WORKING";
  if (t === "WEEK_OFF") return "WEEK_OFF";
  if (t === "HALF_DAY") return "HALF_DAY";
  return type || "OFF";
};

const getDayBadgeClass = (type) => {
  const t = String(type || "").toUpperCase();
  if (t === "WORKING") {
    return "bg-primary-green/10 text-primary-green border-primary-green/20";
  }
  if (t === "WEEK_OFF") {
    return "bg-secondary-text/10 text-secondary-text border-primary-border";
  }
  return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
};

// Date Format Helpers
const formatDisplayDate = (d) => {
  if (!d) return "—";
  try {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return String(d);
    return dateObj.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
};

const getDayName = (d) => {
  if (!d) return "";
  try {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toLocaleDateString("en-US", { weekday: "long" });
  } catch {
    return "";
  }
};

const daysUntil = (d) => {
  if (!d) return "0";
  try {
    const target = new Date(d).setHours(0, 0, 0, 0);
    const nowTs = new Date().setHours(0, 0, 0, 0);
    const diff = Math.round((target - nowTs) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days ago`;
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `in ${diff} days`;
  } catch {
    return "";
  }
};

// Month Operational Calendar Grid Generator
const calendarDays = computed(() => {
  const year = currentYear;
  const month = currentMonth;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday = 0, Sunday = 6
  let firstDayIndex = firstDay.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const daysInMonth = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const days = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      dateNum: prevMonthLastDay - i,
      isCurrentMonth: false,
      isWeekend: false,
    });
  }

  // Current month days
  const todayDate = new Date();
  const policyDaysMap = {};
  if (activePolicy.value?.days) {
    activePolicy.value.days.forEach((d) => {
      policyDaysMap[d.weekday] = d.day_type;
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dDate = new Date(year, month, d);
    let weekday = dDate.getDay() - 1;
    if (weekday === -1) weekday = 6;

    const dayType = policyDaysMap[weekday] || (weekday < 5 ? "WORKING" : "WEEK_OFF");
    const isWeekend = dayType === "WEEK_OFF";

    // Check if this date has a holiday
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const holiday = (hrms.holidays || []).find((h) => {
      if (!h.date) return false;
      return h.date.startsWith(dateStr);
    });

    const isToday =
      todayDate.getFullYear() === year &&
      todayDate.getMonth() === month &&
      todayDate.getDate() === d;

    days.push({
      dateNum: d,
      isCurrentMonth: true,
      isToday,
      isWeekend,
      dayTypeText: dayType === "WEEK_OFF" ? "Sun Off" : (dayType === "HALF_DAY" ? "Half Day" : ""),
      holiday,
    });
  }

  // Next month leading days to complete full grid (multiple of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      dateNum: i,
      isCurrentMonth: false,
      isWeekend: false,
    });
  }

  return days;
});

// Holiday Modal State & Form
const holidayOpen = ref(false);
const holidayEditing = ref(null);
const holidayForm = reactive({
  name: "",
  date: "",
  holiday_type: "MANDATORY",
  description: "",
  is_optional: false,
});

// Work Week Policy Modal State & Form
const policyOpen = ref(false);
const policyEditing = ref(null);
const defaultDays = () =>
  Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    day_type: weekday < 5 ? "WORKING" : "WEEK_OFF",
  }));
const policyForm = reactive({
  name: "",
  is_default: false,
  days: defaultDays(),
});

// Holiday Actions
const openHoliday = () => {
  holidayEditing.value = null;
  Object.assign(holidayForm, {
    name: "",
    date: "",
    holiday_type: "MANDATORY",
    description: "",
    is_optional: false,
  });
  holidayOpen.value = true;
};

const editHoliday = (row) => {
  holidayEditing.value = row;
  Object.assign(holidayForm, {
    name: row.name || "",
    date: row.date ? row.date.substring(0, 10) : "",
    holiday_type: row.holiday_type || "MANDATORY",
    description: row.description || "",
    is_optional: !!row.is_optional || row.holiday_type === "OPTIONAL",
  });
  holidayOpen.value = true;
};

const saveHoliday = async () => {
  const payload = {
    name: holidayForm.name,
    date: holidayForm.date,
    holiday_type: holidayForm.holiday_type,
    description: holidayForm.description,
    is_optional: holidayForm.is_optional,
  };
  if (holidayEditing.value) {
    await hrms.updateHoliday(holidayEditing.value.id, payload);
  } else {
    await hrms.createHoliday(payload);
  }
  holidayOpen.value = false;
};

const confirmDeleteHoliday = async (row) => {
  if (confirm(`Are you sure you want to delete "${row.name}"?`)) {
    await hrms.deleteHoliday(row.id);
  }
};

// Policy Actions
const openPolicy = () => {
  policyEditing.value = null;
  Object.assign(policyForm, {
    name: "",
    is_default: false,
    days: defaultDays(),
  });
  policyOpen.value = true;
};

const editPolicy = (row) => {
  policyEditing.value = row;
  policyForm.name = row.name || "";
  policyForm.is_default = !!row.is_default;
  policyForm.days = (row.days || defaultDays()).map((d) => ({ ...d }));
  policyOpen.value = true;
};

const savePolicy = async () => {
  const payload = {
    name: policyForm.name,
    is_default: policyForm.is_default,
    days: policyForm.days,
  };
  if (policyEditing.value) {
    await hrms.updateWorkWeekPolicy(policyEditing.value.id, payload);
  } else {
    await hrms.createWorkWeekPolicy(payload);
  }
  policyOpen.value = false;
};

onMounted(() => {
  hrms.fetchHolidays(true);
  hrms.fetchWorkWeekPolicies(true);
  if (!hrms.employees?.length) {
    hrms.fetchEmployees({}, false);
  }
});
</script>
