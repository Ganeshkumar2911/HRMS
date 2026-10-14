<template>
  <div class="space-y-6">
    <!-- ── 1. KPI Metric Summary Cards ────────────────────────────────────── -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <!-- Total -->
      <div
        class="p-4 rounded-xl bg-card-background border transition-all cursor-pointer select-none group"
        :class="!filters.status ? 'border-primary shadow-xs ring-1 ring-primary/20' : 'border-primary-border/70 hover:border-primary-border'"
        @click="filterByStatus('')"
        title="Show all tasks"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-xs text-secondary-text font-medium group-hover:text-primary-text transition-colors">Total Tasks</span>
          <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span class="material-symbols-rounded text-base">task_alt</span>
          </div>
        </div>
        <p class="text-2xl font-bold text-primary-text tracking-tight">{{ metrics.total }}</p>
        <p class="text-[11px] text-secondary-text mt-0.5">All registered deliverables</p>
      </div>

      <!-- Pending -->
      <div
        class="p-4 rounded-xl bg-card-background border transition-all cursor-pointer select-none group"
        :class="filters.status === 'PENDING' ? 'border-primary-yellow shadow-xs ring-1 ring-primary-yellow/20' : 'border-primary-border/70 hover:border-primary-border'"
        @click="filterByStatus('PENDING')"
        title="Filter by Pending"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-xs text-secondary-text font-medium group-hover:text-primary-text transition-colors">Pending</span>
          <div class="w-7 h-7 rounded-lg bg-primary-yellow/15 text-primary-yellow flex items-center justify-center shrink-0">
            <span class="material-symbols-rounded text-base">hourglass_top</span>
          </div>
        </div>
        <p class="text-2xl font-bold text-primary-text tracking-tight">{{ metrics.pending }}</p>
        <p class="text-[11px] text-primary-yellow/90 font-medium mt-0.5">Awaiting action</p>
      </div>

      <!-- Upcoming -->
      <div
        class="p-4 rounded-xl bg-card-background border transition-all cursor-pointer select-none group"
        :class="filters.status === 'UPCOMING' ? 'border-primary-blue shadow-xs ring-1 ring-primary-blue/20' : 'border-primary-border/70 hover:border-primary-border'"
        @click="filterByStatus('UPCOMING')"
        title="Filter by Upcoming"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-xs text-secondary-text font-medium group-hover:text-primary-text transition-colors">Upcoming</span>
          <div class="w-7 h-7 rounded-lg bg-primary-blue/15 text-primary-blue flex items-center justify-center shrink-0">
            <span class="material-symbols-rounded text-base">event_upcoming</span>
          </div>
        </div>
        <p class="text-2xl font-bold text-primary-text tracking-tight">{{ metrics.upcoming }}</p>
        <p class="text-[11px] text-secondary-text mt-0.5">Queued on timeline</p>
      </div>

      <!-- Pick Later -->
      <div
        class="p-4 rounded-xl bg-card-background border transition-all cursor-pointer select-none group"
        :class="filters.status === 'PICK_LATER' ? 'border-purple-500 shadow-xs ring-1 ring-purple-500/20' : 'border-primary-border/70 hover:border-primary-border'"
        @click="filterByStatus('PICK_LATER')"
        title="Filter by Pick later"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-xs text-secondary-text font-medium group-hover:text-primary-text transition-colors">Pick Later</span>
          <div class="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <span class="material-symbols-rounded text-base">schedule</span>
          </div>
        </div>
        <p class="text-2xl font-bold text-primary-text tracking-tight">{{ metrics.pickLater }}</p>
        <p class="text-[11px] text-secondary-text mt-0.5">Backlogged</p>
      </div>

      <!-- Completed -->
      <div
        class="p-4 rounded-xl bg-card-background border transition-all cursor-pointer select-none group"
        :class="filters.status === 'COMPLETED' ? 'border-primary-green shadow-xs ring-1 ring-primary-green/20' : 'border-primary-border/70 hover:border-primary-border'"
        @click="filterByStatus('COMPLETED')"
        title="Filter by Completed"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-xs text-secondary-text font-medium group-hover:text-primary-text transition-colors">Completed</span>
          <div class="w-7 h-7 rounded-lg bg-primary-green/15 text-primary-green flex items-center justify-center shrink-0">
            <span class="material-symbols-rounded text-base">check_circle</span>
          </div>
        </div>
        <p class="text-2xl font-bold text-primary-text tracking-tight">{{ metrics.completed }}</p>
        <p class="text-[11px] text-primary-green/90 font-medium mt-0.5">Successfully closed</p>
      </div>

      <!-- Overdue -->
      <div
        class="p-4 rounded-xl bg-card-background border transition-all cursor-pointer select-none group"
        :class="metrics.overdue > 0 ? 'border-primary-red/40 hover:border-primary-red' : 'border-primary-border/70'"
        title="Overdue tasks"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-xs text-secondary-text font-medium group-hover:text-primary-text transition-colors">Overdue</span>
          <div class="w-7 h-7 rounded-lg bg-primary-red/15 text-primary-red flex items-center justify-center shrink-0">
            <span class="material-symbols-rounded text-base">warning</span>
          </div>
        </div>
        <p class="text-2xl font-bold text-primary-red tracking-tight">{{ metrics.overdue }}</p>
        <p class="text-[11px] text-primary-red/80 font-medium mt-0.5">Past due date</p>
      </div>
    </div>

    <!-- ── 2. Filters & Action Bar ────────────────────────────────────────── -->
    <div
      class="p-3 sm:p-3.5 rounded-xl bg-card-background border border-primary-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
    >
      <!-- Filters Group -->
      <div class="flex flex-1 flex-wrap items-center gap-2 sm:gap-2.5">
        <!-- Search Input Component -->
        <div class="flex-1 min-w-[200px] sm:min-w-[260px] max-w-sm">
          <SearchInput
            v-model="filters.q"
            placeholder="Search by title, description, or person..."
            variant="rounded"
            size="md"
            :debounce="350"
            @search="applyFilters"
            @clear="clearSearch"
          />
        </div>

        <!-- Status Filter -->
        <div class="w-32 sm:w-36">
          <BaseSelect
            v-model="filters.status"
            :options="statusOptions"
            allow-all
            all-label="All Statuses"
            custom-class="!h-9 !py-1 text-xs rounded-lg bg-background"
            @update:model-value="applyFilters"
          />
        </div>

        <!-- Priority Filter -->
        <div class="w-32 sm:w-36">
          <BaseSelect
            v-model="filters.priority"
            :options="priorityOptions"
            allow-all
            all-label="All Priorities"
            custom-class="!h-9 !py-1 text-xs rounded-lg bg-background"
            @update:model-value="applyFilters"
          />
        </div>

        <!-- Date Range Filter (BaseDatePicker) -->
        <div class="w-56 sm:w-64 min-w-[200px]">
          <BaseDatePicker
            v-model="dateRangeValue"
            mode="range"
            :disable-future="false"
            :disable-future-dates="false"
            :block-future="false"
            :presets="taskDatePresets"
            placeholder="Date range (from - to)"
            custom-class="!h-9 !py-1 text-xs rounded-lg bg-background"
            @change="handleDateRangeChange"
            @clear="handleDateRangeClear"
          />
        </div>

        <!-- Assigned to Me Filter Toggle -->
        <button
          type="button"
          @click="toggleOnlyMyTasks"
          class="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer select-none"
          :class="onlyMyTasks ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-background border-primary-border text-secondary-text hover:text-primary-text'"
          title="Filter tasks assigned to me"
        >
          <span class="material-symbols-rounded text-sm">person</span>
          <span>Assigned to me</span>
        </button>

        <!-- Reset Filters Button -->
        <button
          v-if="hasActiveFilters"
          type="button"
          @click="resetFilters"
          class="h-9 inline-flex items-center gap-1 px-2.5 text-xs text-secondary-text hover:text-primary-red transition-colors cursor-pointer rounded-lg hover:bg-background shrink-0"
          title="Reset all filters"
        >
          <span class="material-symbols-rounded text-sm">restart_alt</span>
          <span>Reset</span>
        </button>
      </div>

      <!-- Action Button: New Task -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          v-if="permissions.can('task.create')"
          type="button"
          class="btn-primary h-9 text-xs px-3.5 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs active:scale-95 transition-all"
          @click="openCreate"
        >
          <span class="material-symbols-rounded text-base">add</span>
          <span>New task</span>
        </button>
      </div>
    </div>

    <!-- ── 3. Tasks Table ────────────────────────────────────────────────── -->
    <DataTable
      :data="displayedTasks"
      :columns="columns"
      :loading="store.loading"
      :row-class="taskRowClass"
      row-key="id"
    >
      <!-- Quick Status Complete Toggle Column -->
      <template #cell-select="{ row }">
        <button
          type="button"
          class="w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer group/chk"
          :title="row.status === 'COMPLETED' ? 'Mark as incomplete' : 'Mark as complete'"
          @click.stop="toggleComplete(row)"
          :disabled="!canComplete(row) && !canEditFields"
        >
          <span
            v-if="row.status === 'COMPLETED'"
            class="material-symbols-rounded text-lg text-primary-green group-hover/chk:scale-110 transition-transform"
          >
            check_circle
          </span>
          <span
            v-else
            class="material-symbols-rounded text-lg text-secondary-text/40 group-hover/chk:text-primary-green group-hover/chk:scale-110 transition-transform"
          >
            radio_button_unchecked
          </span>
        </button>
      </template>

      <!-- Task Title & Description -->
      <template #cell-title="{ row }">
        <div class="py-1 min-w-0 pr-2">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background text-secondary-text border border-primary-border/60 shrink-0">
              #{{ row.id }}
            </span>
            <span
              class="text-xs font-semibold truncate transition-colors cursor-pointer"
              :class="row.status === 'COMPLETED' ? 'line-through text-secondary-text/70' : 'text-primary-text hover:text-primary'"
              :title="row.title"
              @click="openEdit(row)"
            >
              {{ row.title }}
            </span>
          </div>
          <p
            v-if="row.description"
            class="text-[11px] text-secondary-text/80 truncate max-w-sm mt-0.5 pl-7 leading-tight"
            :title="row.description"
          >
            {{ row.description }}
          </p>
        </div>
      </template>

      <!-- Status Column -->
      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
          :class="getStatusClasses(row.status)"
        >
          <span class="material-symbols-rounded text-xs">{{ getStatusIcon(row.status) }}</span>
          <span>{{ formatLabel(row.status) }}</span>
        </span>
      </template>

      <!-- Priority Column -->
      <template #cell-priority="{ row }">
        <span
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
          :class="getPriorityClasses(row.priority)"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="getPriorityDotClass(row.priority)"></span>
          <span>{{ formatLabel(row.priority) }}</span>
        </span>
      </template>

      <!-- Assignee Column -->
      <template #cell-assigned_to="{ row }">
        <div class="flex items-center gap-2 py-0.5 min-w-0" :title="row.assignee?.email || ''">
          <div class="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 border border-primary-border/50">
            {{ getInitials(row.assignee?.name || row.assigned_to_name) }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-primary-text truncate leading-tight">
              {{ row.assignee?.name || row.assigned_to_name || (row.assigned_to ? `User #${row.assigned_to}` : "Unassigned") }}
              <span v-if="Number(row.assigned_to) === currentUserId" class="text-[10px] text-primary font-semibold ml-1">(You)</span>
            </p>
          </div>
        </div>
      </template>

      <!-- Created By / Reporter Column -->
      <template #cell-created_by="{ row }">
        <div class="flex items-center gap-2 py-0.5 min-w-0" :title="row.creator?.email || ''">
          <div class="w-6 h-6 rounded-full bg-secondary-text/10 text-secondary-text font-bold text-[10px] flex items-center justify-center shrink-0 border border-primary-border/40">
            {{ getInitials(row.creator?.name || row.created_by_name) }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-medium text-primary-text truncate leading-tight">
              {{ row.creator?.name || row.created_by_name || (row.created_by ? `User #${row.created_by}` : "—") }}
            </p>
          </div>
        </div>
      </template>

      <!-- Due Date Column -->
      <template #cell-due_date="{ row }">
        <div class="flex items-center gap-1.5">
          <span
            v-if="isOverdue(row)"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20"
            title="Task is overdue!"
          >
            <span class="material-symbols-rounded text-xs">warning</span>
            <span>{{ formatDate(row.due_date) }}</span>
          </span>
          <span
            v-else-if="isDueSoon(row)"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
            title="Due soon"
          >
            <span class="material-symbols-rounded text-xs">schedule</span>
            <span>{{ formatDate(row.due_date) }}</span>
          </span>
          <span
            v-else-if="row.due_date"
            class="inline-flex items-center gap-1 text-xs text-secondary-text"
          >
            <span class="material-symbols-rounded text-sm text-secondary-text/70">calendar_today</span>
            <span>{{ formatDate(row.due_date) }}</span>
          </span>
          <span v-else class="text-xs text-secondary-text/50">—</span>
        </div>
      </template>

      <!-- Actions Column -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <button
            v-if="canOpenEditor(row)"
            type="button"
            class="w-7 h-7 rounded-lg text-secondary-text hover:text-primary hover:bg-background flex items-center justify-center transition-colors cursor-pointer"
            title="Edit task"
            @click.stop="openEdit(row)"
          >
            <span class="material-symbols-rounded text-[17px]">edit</span>
          </button>
          <button
            v-if="canComplete(row)"
            type="button"
            class="w-7 h-7 rounded-lg text-secondary-text hover:text-primary-green hover:bg-background flex items-center justify-center transition-colors cursor-pointer"
            :title="row.status === 'COMPLETED' ? 'Reopen task' : 'Mark completed'"
            @click.stop="toggleComplete(row)"
          >
            <span class="material-symbols-rounded text-[17px]">
              {{ row.status === 'COMPLETED' ? 'replay' : 'check_circle' }}
            </span>
          </button>
          <button
            v-if="permissions.can('task.delete') && isCreator(row)"
            type="button"
            class="w-7 h-7 rounded-lg text-secondary-text hover:text-primary-red hover:bg-primary-red/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Delete task"
            @click.stop="confirmDelete(row)"
          >
            <span class="material-symbols-rounded text-[17px]">delete</span>
          </button>
        </div>
      </template>

      <!-- Empty State -->
      <template #empty>
        <div class="py-12 px-4 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary-border/60">
            <span class="material-symbols-rounded text-2xl">checklist</span>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-primary-text">No tasks found</h4>
            <p class="text-xs text-secondary-text mt-1 max-w-sm mx-auto">
              {{ hasActiveFilters ? 'No tasks match the active filters or search criteria. Try resetting filters.' : 'There are no tasks assigned yet. Create your first task to get started.' }}
            </p>
          </div>
          <div class="pt-1 flex items-center justify-center gap-2">
            <button
              v-if="hasActiveFilters"
              type="button"
              class="btn-secondary text-xs px-3 py-1.5"
              @click="resetFilters"
            >
              Reset Filters
            </button>
            <button
              v-if="permissions.can('task.create')"
              type="button"
              class="btn-primary text-xs px-3.5 py-1.5"
              @click="openCreate"
            >
              <span class="material-symbols-rounded text-sm">add</span>
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </template>
    </DataTable>

    <!-- ── 4. Pagination Footer ──────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 px-1 text-xs text-secondary-text">
      <div>
        Showing
        <span class="font-semibold text-primary-text">{{ startCount }}</span>
        to
        <span class="font-semibold text-primary-text">{{ endCount }}</span>
        of
        <span class="font-semibold text-primary-text">{{ totalCount }}</span>
        tasks
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="filters.offset <= 0"
          @click="prevPage"
        >
          <span class="material-symbols-rounded text-sm">chevron_left</span>
          <span>Previous</span>
        </button>
        <span class="px-2 font-medium">Page {{ currentPage }}</span>
        <button
          type="button"
          class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!store.hasMore && (filters.offset + filters.limit >= totalCount)"
          @click="nextPage"
        >
          <span>Next</span>
          <span class="material-symbols-rounded text-sm">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- ── 5. Create / Edit Task Modal ────────────────────────────────────── -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      @click.self="modalOpen = false"
    >
      <form
        class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
        @submit.prevent="saveTask"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-primary-border/60">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span class="material-symbols-rounded text-lg">{{ editing ? 'edit_note' : 'add_task' }}</span>
            </div>
            <div>
              <h3 class="title-text text-base font-semibold text-primary-text">
                {{ editing ? `Edit Task #${editing.id}` : "Create New Task" }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                {{ editing ? 'Update details, assignee, or priority' : 'Fill in task details and assign to a team member' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-7 h-7 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background flex items-center justify-center transition-colors cursor-pointer"
            @click="modalOpen = false"
          >
            <span class="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        <!-- Task Title -->
        <div>
          <label class="block text-xs font-semibold text-primary-text mb-1">
            Task Title <span class="text-primary-red">*</span>
          </label>
          <input
            v-model="form.title"
            class="input-field px-3 py-2 text-xs w-full font-medium"
            placeholder="e.g. Prepare monthly audit deliverables"
            required
            :disabled="!canEditFields"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-semibold text-primary-text mb-1">Description</label>
          <textarea
            v-model="form.description"
            class="input-field px-3 py-2 text-xs min-h-20 w-full resize-none leading-relaxed"
            placeholder="Add context, acceptance criteria, or relevant links..."
            :disabled="!canEditFields"
          />
        </div>

        <!-- Status & Priority Row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1">Status</label>
            <BaseSelect
              v-model="form.status"
              :options="availableStatuses.map(s => ({ label: formatLabel(s), value: s }))"
              :disabled="!canChangeStatus"
              custom-class="!py-1.5 text-xs rounded-lg"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1">Priority</label>
            <BaseSelect
              v-model="form.priority"
              :options="priorities.map(p => ({ label: formatLabel(p), value: p }))"
              :disabled="!canEditFields"
              custom-class="!py-1.5 text-xs rounded-lg"
            />
          </div>
        </div>

        <!-- Timeline: Start Date & Due Date Row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1">Start Date</label>
            <input
              v-model="form.start_date"
              type="date"
              class="input-field px-3 py-1.5 text-xs w-full"
              :disabled="!canEditFields"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-primary-text mb-1">Due Date</label>
            <input
              v-model="form.due_date"
              type="date"
              class="input-field px-3 py-1.5 text-xs w-full"
              :disabled="!canEditFields"
            />
          </div>
        </div>

        <!-- Assignee Selection Section -->
        <div v-if="canPickAssignee" class="space-y-2 p-3 rounded-xl bg-background border border-primary-border/60">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-primary-text">Assignee</label>
            <button
              type="button"
              class="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
              @click="assignToMe"
            >
              <span class="material-symbols-rounded text-sm">person</span>
              <span>Assign to me</span>
            </button>
          </div>

          <!-- Current Selected Assignee Card -->
          <div class="flex items-center gap-2 p-2 rounded-lg bg-card-background border border-primary-border/40">
            <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary-border/50">
              {{ getInitials(form.assigned_to_name) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold text-primary-text truncate leading-tight">
                {{ form.assigned_to_name || (form.assigned_to ? `User #${form.assigned_to}` : "Unassigned (defaults to creator)") }}
              </p>
            </div>
          </div>

          <!-- Search assignee input -->
          <div class="relative">
            <span class="material-symbols-rounded absolute left-2.5 top-2 text-secondary-text text-sm pointer-events-none">search</span>
            <input
              v-model="assigneeQuery"
              class="input-field pl-8 pr-3 py-1.5 text-xs w-full"
              placeholder="Search team member by name or email..."
              autocomplete="off"
            />
          </div>

          <!-- Autocomplete results -->
          <div v-if="store.assigneesLoading && activeUserSearch === 'assignee'" class="text-[11px] text-secondary-text py-1 flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm animate-spin text-primary">progress_activity</span>
            <span>Searching directory...</span>
          </div>
          <div
            v-else-if="activeUserSearch === 'assignee' && store.assigneeMatches.length"
            class="border border-primary-border rounded-lg divide-y divide-primary-border/40 max-h-36 overflow-y-auto no-scrollbar bg-card-background shadow-sm"
          >
            <button
              v-for="person in store.assigneeMatches"
              :key="`assignee-${person.id}`"
              type="button"
              class="w-full text-left px-3 py-2 hover:bg-background transition-colors flex items-center justify-between gap-2 cursor-pointer"
              @click="selectAssignee(person)"
            >
              <div>
                <p class="text-xs font-semibold text-primary-text">{{ person.name }}</p>
                <p class="text-[10px] text-secondary-text">{{ person.email }}</p>
              </div>
              <span class="text-[10px] text-primary font-semibold">Select</span>
            </button>
          </div>
        </div>

        <!-- Create On Behalf Of (Admin / Manager) -->
        <div v-if="canPickCreator" class="space-y-2 p-3 rounded-xl bg-background border border-primary-border/60">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-primary-text">Create on behalf of</label>
            <button
              type="button"
              class="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              @click="createAsMe"
            >
              Reset to Me
            </button>
          </div>

          <div class="flex items-center gap-2 p-2 rounded-lg bg-card-background border border-primary-border/40">
            <div class="w-7 h-7 rounded-full bg-secondary-text/10 text-secondary-text font-bold text-xs flex items-center justify-center shrink-0">
              {{ getInitials(form.created_by_name) }}
            </div>
            <p class="text-xs font-semibold text-primary-text truncate">
              {{ form.created_by_name || "Me (self)" }}
            </p>
          </div>

          <div class="relative">
            <span class="material-symbols-rounded absolute left-2.5 top-2 text-secondary-text text-sm pointer-events-none">search</span>
            <input
              v-model="creatorQuery"
              class="input-field pl-8 pr-3 py-1.5 text-xs w-full"
              placeholder="Search user to create on behalf of..."
              autocomplete="off"
            />
          </div>

          <div v-if="store.assigneesLoading && activeUserSearch === 'creator'" class="text-[11px] text-secondary-text py-1 flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm animate-spin text-primary">progress_activity</span>
            <span>Searching directory...</span>
          </div>
          <div
            v-else-if="activeUserSearch === 'creator' && store.assigneeMatches.length"
            class="border border-primary-border rounded-lg divide-y divide-primary-border/40 max-h-36 overflow-y-auto no-scrollbar bg-card-background shadow-sm"
          >
            <button
              v-for="person in store.assigneeMatches"
              :key="`creator-${person.id}`"
              type="button"
              class="w-full text-left px-3 py-2 hover:bg-background transition-colors flex items-center justify-between gap-2 cursor-pointer"
              @click="selectCreator(person)"
            >
              <div>
                <p class="text-xs font-semibold text-primary-text">{{ person.name }}</p>
                <p class="text-[10px] text-secondary-text">{{ person.email }}</p>
              </div>
              <span class="text-[10px] text-primary font-semibold">Select</span>
            </button>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-primary-border/60">
          <button
            type="button"
            class="btn-secondary text-xs px-3.5 py-2 cursor-pointer"
            @click="modalOpen = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            :disabled="store.actionLoading || !form.title.trim()"
          >
            <span v-if="store.actionLoading" class="material-symbols-rounded text-xs animate-spin">progress_activity</span>
            <span>{{ editing ? "Save changes" : "Create task" }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- ── 6. Confirmation Dialog for Delete ──────────────────────────────── -->
    <ConfirmationDialog
      v-model="deleteOpen"
      title="Delete task?"
      :message="`Are you sure you want to delete '${deleteTarget?.title || 'this task'}'? This cannot be undone.`"
      confirm-text="Delete"
      :loading="store.actionLoading"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import moment from "moment";
import DataTable from "@/components/common/DataTable";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import SearchInput from "@/components/common/SearchInput.vue";
import { useTasksStore } from "@/stores/tasks/tasks";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useAuthStore } from "@/stores/auth/auth";

const SEARCH_DEBOUNCE_MS = 280;
const store = useTasksStore();
const permissions = usePermissionsStore();
const auth = useAuthStore();

const statuses = ["PENDING", "UPCOMING", "PICK_LATER", "COMPLETED"];
const priorities = ["LOW", "MEDIUM", "HIGH"];

const formatLabel = (str) => {
  if (!str) return "—";
  return str
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (isoString) => {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (_) {
    return isoString;
  }
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

const statusOptions = computed(() =>
  statuses.map((s) => ({ label: formatLabel(s), value: s }))
);

const priorityOptions = computed(() =>
  priorities.map((p) => ({ label: formatLabel(p), value: p }))
);

const canViewAllTasks = computed(() => permissions.can("task.view_all"));

// Columns Definition for DataTable
const columns = computed(() => {
  const base = [
    { key: "select", label: "", width: 44, sortable: false },
    { key: "title", label: "Task", minWidth: 260 },
    { key: "status", label: "Status", width: 135 },
    { key: "priority", label: "Priority", width: 120 },
    { key: "assigned_to", label: "Assignee", width: 175 },
  ];
  if (canViewAllTasks.value) {
    base.push({ key: "created_by", label: "Reporter", width: 160 });
  }
  base.push({ key: "due_date", label: "Due Date", width: 135 });
  return base;
});

const filters = reactive({
  status: "",
  priority: "",
  q: "",
  from_date: "",
  to_date: "",
  limit: 50,
  offset: 0,
});

const dateRangeValue = ref(null);

const taskDatePresets = [
  {
    label: "Today",
    getValue: () => [moment().startOf("day"), moment().endOf("day")],
  },
  {
    label: "This Week",
    getValue: () => [moment().startOf("week"), moment().endOf("week")],
  },
  {
    label: "This Month",
    getValue: () => [moment().startOf("month"), moment().endOf("month")],
  },
  {
    label: "Next 7 Days",
    getValue: () => [moment().startOf("day"), moment().add(6, "days").endOf("day")],
  },
  {
    label: "Next 30 Days",
    getValue: () => [moment().startOf("day"), moment().add(29, "days").endOf("day")],
  },
  {
    label: "Last 30 Days",
    getValue: () => [moment().subtract(29, "days").startOf("day"), moment().endOf("day")],
  },
];

const handleDateRangeChange = (val) => {
  if (val && typeof val === "object") {
    filters.from_date = val.start || "";
    filters.to_date = val.end || "";
  } else if (Array.isArray(val) && val.length === 2) {
    filters.from_date = val[0] || "";
    filters.to_date = val[1] || "";
  } else {
    filters.from_date = "";
    filters.to_date = "";
  }
  applyFilters();
};

const handleDateRangeClear = () => {
  filters.from_date = "";
  filters.to_date = "";
  dateRangeValue.value = null;
  applyFilters();
};

const onlyMyTasks = ref(false);

const toggleOnlyMyTasks = () => {
  onlyMyTasks.value = !onlyMyTasks.value;
};

// Filtered tasks on client if "Only My Tasks" is active
const displayedTasks = computed(() => {
  const list = store.tasks || [];
  if (!onlyMyTasks.value) return list;
  return list.filter(
    (t) => Number(t.assigned_to) === currentUserId.value || Number(t.created_by) === currentUserId.value
  );
});

// Dynamic Metrics computed directly from store.tasks or store.summary
const metrics = computed(() => {
  const s = store.summary;
  const list = store.tasks || [];
  const total = s?.total ?? store.pagination?.total ?? list.length;
  const pending = s?.status?.pending ?? list.filter((t) => t.status === "PENDING").length;
  const upcoming = s?.status?.upcoming ?? list.filter((t) => t.status === "UPCOMING").length;
  const pickLater = s?.status?.pick_later ?? list.filter((t) => t.status === "PICK_LATER").length;
  const completed = s?.status?.completed ?? list.filter((t) => t.status === "COMPLETED").length;
  const overdue = s?.overdue ?? list.filter((t) => isOverdue(t)).length;

  return { total, pending, upcoming, pickLater, completed, overdue };
});

const filterByStatus = (status) => {
  filters.status = filters.status === status ? "" : status;
  applyFilters();
};

const modalOpen = ref(false);
const editing = ref(null);
const original = ref(null);
const deleteOpen = ref(false);
const deleteTarget = ref(null);
const assigneeQuery = ref("");
const creatorQuery = ref("");
const activeUserSearch = ref("");
let assigneeDebounceTimer = null;
let creatorDebounceTimer = null;

const form = reactive({
  title: "",
  description: "",
  status: "PENDING",
  priority: "MEDIUM",
  created_by: null,
  created_by_name: "",
  assigned_to: null,
  assigned_to_name: "",
  start_date: "",
  due_date: "",
});

const currentUserId = computed(() => Number(auth.currentUser?.id));

const isCreator = (row) => Number(row?.created_by) === currentUserId.value;
const isAssignee = (row) => Number(row?.assigned_to) === currentUserId.value;
const isParticipant = (row) => isCreator(row) || isAssignee(row);

const todayUtc = () => new Date().toISOString().slice(0, 10);

const isOverdue = (row) => {
  if (!row?.due_date || row.status === "COMPLETED") return false;
  return row.due_date < todayUtc();
};

const isDueSoon = (row) => {
  if (!row?.due_date || row.status === "COMPLETED" || isOverdue(row)) return false;
  const today = new Date();
  const due = new Date(row.due_date);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 2;
};

const taskRowClass = (row) => {
  if (isOverdue(row)) return "bg-primary-red/3";
  if (row.status === "COMPLETED") return "opacity-80";
  return "";
};

const getStatusClasses = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED") return "bg-primary-green/10 text-primary-green border-primary-green/20";
  if (s === "PENDING") return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  if (s === "UPCOMING") return "bg-primary-blue/10 text-primary-blue border-primary-blue/20";
  if (s === "PICK_LATER") return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  return "bg-secondary-text/10 text-secondary-text border-primary-border/60";
};

const getStatusIcon = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED") return "check_circle";
  if (s === "PENDING") return "hourglass_top";
  if (s === "UPCOMING") return "event_upcoming";
  if (s === "PICK_LATER") return "schedule";
  return "help_outline";
};

const getPriorityClasses = (priority) => {
  const p = String(priority || "").toUpperCase();
  if (p === "HIGH") return "bg-primary-red/10 text-primary-red border-primary-red/20";
  if (p === "MEDIUM") return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  return "bg-primary-blue/10 text-primary-blue border-primary-blue/20";
};

const getPriorityDotClass = (priority) => {
  const p = String(priority || "").toUpperCase();
  if (p === "HIGH") return "bg-primary-red";
  if (p === "MEDIUM") return "bg-primary-yellow";
  return "bg-primary-blue";
};

const canEditFields = computed(() => {
  if (permissions.can("task.view_all")) return true;
  if (!permissions.can("task.update")) return false;
  if (!editing.value) return true;
  return isParticipant(editing.value);
});

const canChangeStatus = computed(() => {
  if (permissions.can("task.view_all")) return true;
  if (!editing.value) {
    return permissions.can("task.update") || permissions.can("task.complete");
  }
  if (!isParticipant(editing.value)) return false;
  return permissions.can("task.update") || permissions.can("task.complete");
});

const canPickCreator = computed(() => {
  return !editing.value && permissions.can("task.create_on_behalf");
});

const canPickAssignee = computed(() => {
  if (permissions.can("task.view_all")) return true;
  if (!permissions.can("task.assign")) return false;
  if (!editing.value) return true;
  return isCreator(editing.value);
});

const canOpenEditor = (row) => {
  if (permissions.can("task.view_all")) return true;
  if (!isParticipant(row)) return false;
  if (permissions.can("task.update")) return true;
  if (permissions.can("task.assign") && isCreator(row)) return true;
  if (permissions.can("task.complete")) return true;
  return false;
};

const canComplete = (row) => {
  return (
    permissions.can("task.complete") &&
    (isParticipant(row) || permissions.can("task.view_all"))
  );
};

const availableStatuses = computed(() => {
  if (permissions.can("task.complete") && permissions.can("task.update")) return statuses;
  if (permissions.can("task.complete") && !permissions.can("task.update")) {
    return editing.value ? [...new Set([editing.value.status, "COMPLETED"])] : statuses;
  }
  return statuses.filter((status) => status !== "COMPLETED" || form.status === "COMPLETED");
});

const listQuery = () => ({
  status: filters.status,
  priority: filters.priority,
  q: filters.q,
  from_date: filters.from_date,
  to_date: filters.to_date,
  limit: filters.limit,
  offset: filters.offset,
});

const reloadList = () => store.fetchTasks(listQuery(), true);

const applyFilters = () => {
  filters.offset = 0;
  store.fetchTasks(listQuery(), true);
};

let searchDebounceTimer = null;

const handleSearchInput = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(() => {
    applyFilters();
  }, 350);
};

const clearSearch = () => {
  filters.q = "";
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  applyFilters();
};

const resetFilters = () => {
  filters.status = "";
  filters.priority = "";
  filters.q = "";
  filters.from_date = "";
  filters.to_date = "";
  dateRangeValue.value = null;
  onlyMyTasks.value = false;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  applyFilters();
};

const hasActiveFilters = computed(() => {
  return (
    !!filters.status ||
    !!filters.priority ||
    !!filters.q ||
    !!filters.from_date ||
    !!filters.to_date ||
    onlyMyTasks.value
  );
});

// Pagination Calculations
const totalCount = computed(() => store.pagination?.total ?? store.tasks.length);
const startCount = computed(() => (totalCount.value === 0 ? 0 : filters.offset + 1));
const endCount = computed(() => Math.min(filters.offset + (store.tasks?.length || 0), totalCount.value));
const currentPage = computed(() => Math.floor(filters.offset / filters.limit) + 1);

const prevPage = () => {
  filters.offset = Math.max(0, filters.offset - filters.limit);
  reloadList();
};

const nextPage = () => {
  filters.offset += filters.limit;
  reloadList();
};

const clearUserSearch = () => {
  assigneeQuery.value = "";
  creatorQuery.value = "";
  activeUserSearch.value = "";
  store.assigneeMatches = [];
};

const resetForm = () => {
  Object.assign(form, {
    title: "",
    description: "",
    status: "PENDING",
    priority: "MEDIUM",
    created_by: currentUserId.value || null,
    created_by_name: auth.currentUser?.name || "Me (self)",
    assigned_to: null,
    assigned_to_name: "",
    start_date: "",
    due_date: "",
  });
  clearUserSearch();
};

const openCreate = () => {
  editing.value = null;
  original.value = null;
  resetForm();
  modalOpen.value = true;
};

const openEdit = (row) => {
  editing.value = row;
  original.value = { ...row };
  Object.assign(form, {
    title: row.title,
    description: row.description || "",
    status: row.status,
    priority: row.priority,
    created_by: row.created_by,
    created_by_name: row.creator?.name || row.created_by_name || "",
    assigned_to: row.assigned_to,
    assigned_to_name: row.assignee?.name || row.assigned_to_name || "",
    start_date: row.start_date ? row.start_date.slice(0, 10) : "",
    due_date: row.due_date ? row.due_date.slice(0, 10) : "",
  });
  clearUserSearch();
  modalOpen.value = true;
};

const createAsMe = () => {
  form.created_by = currentUserId.value || null;
  form.created_by_name = auth.currentUser?.name || "Me (self)";
  clearUserSearch();
};

const selectCreator = (person) => {
  form.created_by = person.id;
  form.created_by_name = person.name;
  if (!form.assigned_to || Number(form.assigned_to) === currentUserId.value) {
    form.assigned_to = person.id;
    form.assigned_to_name = person.name;
  }
  clearUserSearch();
};

const assignToMe = () => {
  form.assigned_to = currentUserId.value || null;
  form.assigned_to_name = auth.currentUser?.name || "Me (self)";
  clearUserSearch();
};

const selectAssignee = (person) => {
  form.assigned_to = person.id;
  form.assigned_to_name = person.name;
  clearUserSearch();
};

watch(creatorQuery, (query) => {
  if (creatorDebounceTimer) clearTimeout(creatorDebounceTimer);
  creatorDebounceTimer = setTimeout(() => {
    activeUserSearch.value = "creator";
    store.searchAssignees(query);
  }, SEARCH_DEBOUNCE_MS);
});

watch(assigneeQuery, (query) => {
  if (assigneeDebounceTimer) clearTimeout(assigneeDebounceTimer);
  assigneeDebounceTimer = setTimeout(() => {
    activeUserSearch.value = "assignee";
    store.searchAssignees(query);
  }, SEARCH_DEBOUNCE_MS);
});

const buildPatch = () => {
  if (!original.value) {
    const payload = {
      title: form.title.trim(),
      description: form.description ? form.description.trim() : null,
      status: form.status,
      priority: form.priority,
      start_date: form.start_date || null,
      due_date: form.due_date || null,
    };
    const creatorId = form.created_by ? Number(form.created_by) : currentUserId.value;
    if (creatorId && creatorId !== currentUserId.value) {
      payload.created_by = creatorId;
    }
    if (form.assigned_to && Number(form.assigned_to) !== creatorId) {
      payload.assigned_to = Number(form.assigned_to);
    }
    return payload;
  }
  const patch = {};
  ["title", "description", "status", "priority", "assigned_to", "start_date", "due_date"].forEach((key) => {
    const next = form[key] === "" ? null : form[key];
    const prev = original.value[key] ?? null;
    if (next !== prev) patch[key] = next;
  });
  if (patch.assigned_to == null && original.value.assigned_to != null && form.assigned_to) {
    patch.assigned_to = Number(form.assigned_to);
  }
  if (patch.assigned_to == null && "assigned_to" in patch) {
    delete patch.assigned_to;
  }
  return patch;
};

const saveTask = async () => {
  const payload = buildPatch();
  if (editing.value) {
    if (!Object.keys(payload).length) {
      modalOpen.value = false;
      return;
    }
    await store.updateTask(editing.value.id, payload);
  } else {
    await store.createTask(payload);
  }
  modalOpen.value = false;
  reloadList();
  store.fetchSummary(true);
};

const toggleComplete = async (row) => {
  const nextStatus = row.status === "COMPLETED" ? "PENDING" : "COMPLETED";
  await store.updateTask(row.id, { status: nextStatus });
  reloadList();
  store.fetchSummary(true);
};

const confirmDelete = (row) => {
  deleteTarget.value = row;
  deleteOpen.value = true;
};

const doDelete = async () => {
  if (deleteTarget.value) {
    await store.deleteTask(deleteTarget.value.id);
  }
  deleteOpen.value = false;
  reloadList();
  store.fetchSummary(true);
};

onMounted(() => {
  store.fetchSummary(true);
  reloadList();
});
</script>
