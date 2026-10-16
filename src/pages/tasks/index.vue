<template>
  <div class="space-y-6">
    <!-- ── 1. Top Meta & Title Bar (Stitch Specification) ────────────────── -->
    <div class="flex flex-col md:flex-row md:items-end justify-between pb-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center gap-2">
          <span class="text-[11px] uppercase tracking-wider font-semibold text-secondary-text">Task Orchestration</span>
          <span class="w-1 h-1 rounded-full bg-secondary-text/50"></span>
          <span class="text-[11px] text-secondary-text font-medium">HR Operations</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight font-sans">
          Tasks &amp; Assignments
        </h1>
        <p class="text-xs text-secondary-text max-w-xl leading-relaxed">
          Review, triage, and audit workflow requests and operational delegations across team nodes.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          @click="exportTasksLog"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card-background hover:bg-surface-hover text-primary-text text-xs font-semibold transition-all cursor-pointer active:scale-95"
          title="Export current tasks as JSON"
        >
          <span class="material-symbols-rounded text-base text-secondary-text">file_download</span>
          <span>Export Log</span>
        </button>

        <button
          v-if="permissions.can('task.create')"
          type="button"
          @click="openCreate"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all cursor-pointer active:scale-95"
        >
          <span class="material-symbols-rounded text-base">add</span>
          <span>New Task</span>
        </button>
      </div>
    </div>

    <!-- ── 2. API Summary Stats Strip (6 Metric Cards - Stitch Design) ───── -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <!-- Total Tasks -->
      <div
        class="bg-card-background p-4 rounded-xl transition-all cursor-pointer select-none flex flex-col justify-between group"
        :class="!filters.status ? 'bg-surface-container' : 'hover:bg-surface-subtle'"
        @click="filterByStatus('')"
        title="Show all tasks"
      >
        <div class="flex items-center justify-between text-secondary-text mb-2">
          <span class="text-xs font-medium group-hover:text-primary-text transition-colors">Total Tasks</span>
          <span class="material-symbols-rounded text-[18px]">dataset</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight">{{ metrics.total }}</span>
          <span class="text-[11px] text-secondary-text">all records</span>
        </div>
      </div>

      <!-- Pending -->
      <div
        class="bg-card-background p-4 rounded-xl transition-all cursor-pointer select-none flex flex-col justify-between group"
        :class="filters.status === 'PENDING' ? 'bg-status-pending-bg/50' : 'hover:bg-surface-subtle'"
        @click="filterByStatus('PENDING')"
        title="Filter by Pending"
      >
        <div class="flex items-center justify-between text-secondary-text mb-2">
          <span class="text-xs font-medium group-hover:text-primary-text transition-colors">Pending</span>
          <span class="w-2 h-2 rounded-full dot-status-pending"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight">{{ metrics.pending }}</span>
          <span class="text-[11px] text-status-pending font-medium">action req.</span>
        </div>
      </div>

      <!-- Upcoming -->
      <div
        class="bg-card-background p-4 rounded-xl transition-all cursor-pointer select-none flex flex-col justify-between group"
        :class="filters.status === 'UPCOMING' ? 'bg-status-upcoming-bg/50' : 'hover:bg-surface-subtle'"
        @click="filterByStatus('UPCOMING')"
        title="Filter by Upcoming"
      >
        <div class="flex items-center justify-between text-secondary-text mb-2">
          <span class="text-xs font-medium group-hover:text-primary-text transition-colors">Upcoming</span>
          <span class="w-2 h-2 rounded-full dot-status-upcoming"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight">{{ metrics.upcoming }}</span>
          <span class="text-[11px] text-secondary-text">scheduled</span>
        </div>
      </div>

      <!-- Pick Later -->
      <div
        class="bg-card-background p-4 rounded-xl transition-all cursor-pointer select-none flex flex-col justify-between group"
        :class="filters.status === 'PICK_LATER' ? 'bg-status-pick-later-bg/50' : 'hover:bg-surface-subtle'"
        @click="filterByStatus('PICK_LATER')"
        title="Filter by Pick Later"
      >
        <div class="flex items-center justify-between text-secondary-text mb-2">
          <span class="text-xs font-medium group-hover:text-primary-text transition-colors">Pick Later</span>
          <span class="w-2 h-2 rounded-full dot-status-pick-later"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight">{{ metrics.pickLater }}</span>
          <span class="text-[11px] text-secondary-text">staged</span>
        </div>
      </div>

      <!-- Completed -->
      <div
        class="bg-card-background p-4 rounded-xl transition-all cursor-pointer select-none flex flex-col justify-between group"
        :class="filters.status === 'COMPLETED' ? 'bg-status-completed-bg/50' : 'hover:bg-surface-subtle'"
        @click="filterByStatus('COMPLETED')"
        title="Filter by Completed"
      >
        <div class="flex items-center justify-between text-secondary-text mb-2">
          <span class="text-xs font-medium group-hover:text-primary-text transition-colors">Completed</span>
          <span class="w-2 h-2 rounded-full dot-status-completed"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold text-primary-text tracking-tight">{{ metrics.completed }}</span>
          <span class="text-[11px] text-status-completed font-medium">resolved</span>
        </div>
      </div>

      <!-- Overdue -->
      <div
        class="bg-card-background p-4 rounded-xl transition-all cursor-pointer select-none flex flex-col justify-between group"
        :class="metrics.overdue > 0 ? 'bg-status-overdue-bg/40' : 'hover:bg-surface-subtle'"
        title="Overdue tasks"
      >
        <div class="flex items-center justify-between text-secondary-text mb-2">
          <span class="text-xs font-medium group-hover:text-primary-text transition-colors">Overdue</span>
          <span class="w-2 h-2 rounded-full dot-status-overdue"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-bold text-status-overdue tracking-tight">{{ metrics.overdue }}</span>
          <span class="text-[11px] text-status-overdue/80 font-medium">past SLA</span>
        </div>
      </div>
    </div>

    <!-- ── 3. Operational Filter & View Bar (Stitch Design) ──────────────── -->
    <div
      class="bg-card-background p-3 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
    >
      <!-- Left Filters -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
        <!-- Search Input -->
        <div class="flex items-center gap-2 bg-surface-subtle px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-primary/20 transition-colors flex-1 min-w-[200px] sm:min-w-[240px] max-w-sm">
          <span class="material-symbols-rounded text-secondary-text text-[18px]">search</span>
          <input
            v-model="filters.q"
            type="text"
            class="bg-transparent text-xs text-primary-text placeholder:text-secondary-text/60 outline-none w-full"
            placeholder="Filter by title, creator, assignee..."
            @input="handleSearchInput"
          />
          <button
            v-if="filters.q"
            type="button"
            @click="clearSearch"
            class="text-secondary-text hover:text-primary-text p-0.5 rounded cursor-pointer"
          >
            <span class="material-symbols-rounded text-sm">close</span>
          </button>
        </div>

        <!-- Status Filter Pill -->
        <div class="w-32 sm:w-36">
          <BaseSelect
            v-model="filters.status"
            :options="statusOptions"
            allow-all
            all-label="Status: All"
            custom-class="!h-9 !py-1 text-xs rounded-lg bg-surface-subtle border-none"
            @update:model-value="applyFilters"
          />
        </div>

        <!-- Priority Filter Pill -->
        <div class="w-32 sm:w-36">
          <BaseSelect
            v-model="filters.priority"
            :options="priorityOptions"
            allow-all
            all-label="Priority: All"
            custom-class="!h-9 !py-1 text-xs rounded-lg bg-surface-subtle border-none"
            @update:model-value="applyFilters"
          />
        </div>

        <!-- Date Range Calendar Filter -->
        <div class="w-56 sm:w-64 min-w-[210px]">
          <BaseDatePicker
            v-model="dateRangeValue"
            mode="range"
            :disable-future="false"
            :disable-future-dates="false"
            :block-future="false"
            :presets="taskDatePresets"
            placeholder="Date range (from - to)"
            custom-class="!h-9 !py-1 text-xs rounded-lg bg-surface-subtle border-none"
            @change="handleDateRangeChange"
            @clear="handleDateRangeClear"
          />
        </div>

        <!-- Assigned to Me Filter Toggle -->
        <button
          type="button"
          @click="toggleOnlyMyTasks"
          class="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer select-none"
          :class="onlyMyTasks
            ? 'bg-primary text-white font-semibold'
            : 'bg-surface-subtle text-secondary-text hover:text-primary-text'"
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
          class="h-9 inline-flex items-center gap-1 px-2.5 text-xs text-secondary-text hover:text-primary-red transition-colors cursor-pointer rounded-lg hover:bg-surface-subtle shrink-0"
          title="Reset all filters"
        >
          <span class="material-symbols-rounded text-sm">restart_alt</span>
          <span>Reset</span>
        </button>
      </div>

      <!-- Right Controls: Sort Label & View Switcher (Table / Clean Cards) -->
      <div class="flex items-center justify-between lg:justify-end gap-3 shrink-0">
        <!-- Segmented Pill Toggle -->
        <div class="inline-flex p-1 bg-surface-subtle rounded-lg gap-1">
          <button
            type="button"
            @click="viewMode = 'table'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
            :class="viewMode === 'table'
              ? 'bg-primary text-white'
              : 'text-secondary-text hover:text-primary-text'"
          >
            <span class="material-symbols-rounded text-[16px]">table_rows</span>
            <span>Table</span>
          </button>

          <button
            type="button"
            @click="viewMode = 'cards'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
            :class="viewMode === 'cards'
              ? 'bg-primary text-white'
              : 'text-secondary-text hover:text-primary-text'"
          >
            <span class="material-symbols-rounded text-[16px]">view_agenda</span>
            <span>Clean Cards</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── 4A. View 1: Data Table View (Default) ─────────────────────────── -->
    <div v-if="viewMode === 'table'">
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
              class="material-symbols-rounded text-lg text-status-completed group-hover/chk:scale-110 transition-transform"
            >
              check_circle
            </span>
            <span
              v-else
              class="material-symbols-rounded text-lg text-secondary-text/40 group-hover/chk:text-status-completed group-hover/chk:scale-110 transition-transform"
            >
              radio_button_unchecked
            </span>
          </button>
        </template>

        <!-- Task Title & Description -->
        <template #cell-title="{ row }">
          <div class="py-1 min-w-0 pr-2">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono font-medium text-secondary-text shrink-0">
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
              class="text-[11px] text-secondary-text/80 truncate max-w-sm mt-0.5 pl-6 leading-tight"
              :title="row.description"
            >
              {{ row.description }}
            </p>
          </div>
        </template>

        <!-- Status Column (Stitch Quiet Work Badges) -->
        <template #cell-status="{ row }">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getStatusClasses(row.status)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(row.status)"></span>
            <span>{{ formatLabel(row.status) }}</span>
          </span>
        </template>

        <!-- Priority Column (Stitch Quiet Work Badges) -->
        <template #cell-priority="{ row }">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            :class="getPriorityClasses(row.priority)"
          >
            {{ formatLabel(row.priority) }}
          </span>
        </template>

        <!-- Creator Column -->
        <template #cell-created_by="{ row }">
          <div class="flex flex-col leading-tight py-0.5 min-w-0" :title="row.creator?.email || ''">
            <span class="text-xs font-medium text-primary-text truncate">
              {{ row.creator?.name || row.created_by_name || (row.created_by ? `User #${row.created_by}` : "—") }}
            </span>
            <span v-if="row.creator?.email" class="text-[10px] text-secondary-text truncate mt-0.5">
              {{ row.creator.email }}
            </span>
          </div>
        </template>

        <!-- Assignee Column (Avatar Initial + Name + Email) -->
        <template #cell-assigned_to="{ row }">
          <div class="flex items-center gap-2 py-0.5 min-w-0" :title="row.assignee?.email || ''">
            <div class="w-6 h-6 rounded-full bg-surface-subtle text-secondary-text font-bold text-[10px] flex items-center justify-center shrink-0">
              {{ getInitials(row.assignee?.name || row.assigned_to_name) }}
            </div>
            <div class="flex flex-col leading-tight min-w-0">
              <span class="text-xs font-medium text-primary-text truncate">
                {{ row.assignee?.name || row.assigned_to_name || (row.assigned_to ? `User #${row.assigned_to}` : "Unassigned") }}
                <span v-if="Number(row.assigned_to) === currentUserId" class="text-[10px] text-primary font-semibold ml-1">(You)</span>
              </span>
              <span v-if="row.assignee?.email" class="text-[10px] text-secondary-text truncate mt-0.5">
                {{ row.assignee.email }}
              </span>
            </div>
          </div>
        </template>

        <!-- Created Date Column -->
        <template #cell-created_at="{ row }">
          <span class="text-xs text-secondary-text font-tabular-nums">
            {{ formatDate(row.created_at) }}
          </span>
        </template>

        <!-- Due Date Column -->
        <template #cell-due_date="{ row }">
          <div class="flex items-center gap-1.5">
            <span
              v-if="isOverdue(row)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold badge-status-overdue"
              title="Task is overdue!"
            >
              <span class="w-1.5 h-1.5 rounded-full dot-status-overdue"></span>
              <span>{{ formatDate(row.due_date) }}</span>
            </span>
            <span
              v-else-if="isDueSoon(row)"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold badge-status-pending"
              title="Due soon"
            >
              <span class="w-1.5 h-1.5 rounded-full dot-status-pending"></span>
              <span>{{ formatDate(row.due_date) }}</span>
            </span>
            <span
              v-else-if="row.due_date"
              class="text-xs text-secondary-text font-tabular-nums"
            >
              {{ formatDate(row.due_date) }}
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
              class="w-7 h-7 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-subtle flex items-center justify-center transition-colors cursor-pointer"
              title="Edit task"
              @click.stop="openEdit(row)"
            >
              <span class="material-symbols-rounded text-[17px]">edit</span>
            </button>
            <button
              v-if="canComplete(row)"
              type="button"
              class="w-7 h-7 rounded-lg text-secondary-text hover:text-status-completed hover:bg-surface-subtle flex items-center justify-center transition-colors cursor-pointer"
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
          <div class="py-14 px-4 text-center space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center mx-auto text-secondary-text">
              <span class="material-symbols-rounded text-2xl">checklist</span>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-primary-text">No tasks found</h4>
              <p class="text-xs text-secondary-text mt-1 max-w-sm mx-auto">
                {{ hasActiveFilters ? 'No tasks match the active filters or date criteria. Try resetting filters.' : 'There are no tasks assigned yet. Create your first task to get started.' }}
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
    </div>

    <!-- ── 4B. View 2: Clean Cards View ──────────────────────────────────── -->
    <div v-else-if="viewMode === 'cards'">
      <div v-if="displayedTasks.length === 0" class="bg-card-background rounded-xl p-12 text-center space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center mx-auto text-secondary-text">
          <span class="material-symbols-rounded text-2xl">checklist</span>
        </div>
        <h4 class="text-sm font-semibold text-primary-text">No tasks to display</h4>
        <p class="text-xs text-secondary-text max-w-sm mx-auto">
          No records match your active query. Adjust your filters or create a new task.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="task in displayedTasks"
          :key="`card-${task.id}`"
          class="bg-card-background rounded-xl p-4 flex flex-col justify-between hover:bg-surface-subtle/40 transition-all group"
        >
          <!-- Card Header: ID, Status, Priority -->
          <div>
            <div class="flex items-center justify-between gap-2 pb-2.5">
              <span class="text-xs font-mono font-medium text-secondary-text">#{{ task.id }}</span>
              <div class="flex items-center gap-1.5">
                <!-- Priority Pill -->
                <span class="px-2 py-0.5 rounded text-[11px] font-medium" :class="getPriorityClasses(task.priority)">
                  {{ formatLabel(task.priority) }}
                </span>
                <!-- Status Pill -->
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium" :class="getStatusClasses(task.status)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(task.status)"></span>
                  <span>{{ formatLabel(task.status) }}</span>
                </span>
              </div>
            </div>

            <!-- Title & Quick Toggle -->
            <div class="pt-3 flex items-start gap-2">
              <button
                type="button"
                @click.stop="toggleComplete(task)"
                :disabled="!canComplete(task) && !canEditFields"
                class="mt-0.5 text-secondary-text/40 hover:text-status-completed cursor-pointer"
              >
                <span v-if="task.status === 'COMPLETED'" class="material-symbols-rounded text-base text-status-completed">check_circle</span>
                <span v-else class="material-symbols-rounded text-base">radio_button_unchecked</span>
              </button>
              <div class="min-w-0 flex-1">
                <h4
                  class="text-xs font-semibold cursor-pointer hover:text-primary transition-colors"
                  :class="task.status === 'COMPLETED' ? 'line-through text-secondary-text' : 'text-primary-text'"
                  @click="openEdit(task)"
                >
                  {{ task.title }}
                </h4>
                <p v-if="task.description" class="text-[11px] text-secondary-text line-clamp-2 mt-1 leading-relaxed">
                  {{ task.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Card Footer: People & Timeline -->
          <div class="pt-3 mt-3 flex items-center justify-between text-xs text-secondary-text">
            <!-- Assignee avatar -->
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-6 h-6 rounded-full bg-surface-subtle font-bold text-[10px] flex items-center justify-center shrink-0">
                {{ getInitials(task.assignee?.name || task.assigned_to_name) }}
              </div>
              <span class="text-xs font-medium text-primary-text truncate">
                {{ task.assignee?.name || task.assigned_to_name || 'Unassigned' }}
              </span>
            </div>

            <!-- Due Date / Actions -->
            <div class="flex items-center gap-1.5 shrink-0">
              <span v-if="task.due_date" class="text-[11px] font-tabular-nums px-2 py-0.5 rounded bg-surface-subtle text-secondary-text">
                {{ formatDate(task.due_date) }}
              </span>
              <button
                v-if="canOpenEditor(task)"
                type="button"
                @click="openEdit(task)"
                class="p-1 rounded hover:bg-surface-subtle text-secondary-text hover:text-primary-text cursor-pointer"
                title="Edit task"
              >
                <span class="material-symbols-rounded text-base">edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 5. Pagination Footer (Stitch Specification) ───────────────────── -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 px-1 text-xs text-secondary-text">
      <div>
        Showing
        <span class="font-semibold text-primary-text">{{ startCount }}</span>
        to
        <span class="font-semibold text-primary-text">{{ endCount }}</span>
        of
        <span class="font-semibold text-primary-text">{{ totalCount }}</span>
        tasks &bull; Offset {{ filters.offset }}, Limit {{ filters.limit }}
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="w-8 h-8 rounded-lg bg-card-background flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="filters.offset <= 0"
          @click="prevPage"
          title="Previous Page"
        >
          <span class="material-symbols-rounded text-sm">chevron_left</span>
        </button>

        <span class="px-2.5 py-1 rounded-lg bg-surface-subtle text-xs font-medium text-primary-text">
          Page {{ currentPage }}
        </span>

        <button
          type="button"
          class="w-8 h-8 rounded-lg bg-card-background flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!store.hasMore && (filters.offset + filters.limit >= totalCount)"
          @click="nextPage"
          title="Next Page"
        >
          <span class="material-symbols-rounded text-sm">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- ── 6. Create / Edit Task Modal ────────────────────────────────────── -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      @click.self="modalOpen = false"
    >
      <form
        class="bg-card-background rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
        @submit.prevent="saveTask"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
              <span class="material-symbols-rounded text-base">{{ editing ? 'edit_note' : 'add_task' }}</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-primary-text">
                {{ editing ? `Edit Task #${editing.id}` : "Create New Task" }}
              </h3>
              <p class="text-[11px] text-secondary-text">
                {{ editing ? 'Update details, assignee, or priority' : 'Fill in task details and assign to a team member' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="w-7 h-7 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-subtle flex items-center justify-center transition-colors cursor-pointer"
            @click="modalOpen = false"
          >
            <span class="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        <!-- Task Title -->
        <div>
          <label class="block text-xs font-semibold text-primary-text mb-1">
            Task Title <span class="text-status-overdue">*</span>
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
        <div v-if="canPickAssignee" class="space-y-2 p-3 rounded-xl bg-surface-subtle">
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
          <div class="flex items-center gap-2 p-2 rounded-lg bg-card-background">
            <div class="w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
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
            class="rounded-lg divide-y divide-primary-border/40 max-h-36 overflow-y-auto no-scrollbar bg-card-background shadow-sm"
          >
            <button
              v-for="person in store.assigneeMatches"
              :key="`assignee-${person.id}`"
              type="button"
              class="w-full text-left px-3 py-2 hover:bg-surface-subtle transition-colors flex items-center justify-between gap-2 cursor-pointer"
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
        <div v-if="canPickCreator" class="space-y-2 p-3 rounded-xl bg-surface-subtle">
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

          <div class="flex items-center gap-2 p-2 rounded-lg bg-card-background">
            <div class="w-7 h-7 rounded-full bg-surface-subtle text-secondary-text font-bold text-xs flex items-center justify-center shrink-0">
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
            class="rounded-lg divide-y divide-primary-border/40 max-h-36 overflow-y-auto no-scrollbar bg-card-background shadow-sm"
          >
            <button
              v-for="person in store.assigneeMatches"
              :key="`creator-${person.id}`"
              type="button"
              class="w-full text-left px-3 py-2 hover:bg-surface-subtle transition-colors flex items-center justify-between gap-2 cursor-pointer"
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
        <div class="flex items-center justify-end gap-2 pt-3">
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

    <!-- ── 7. Confirmation Dialog for Delete ──────────────────────────────── -->
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
import { useTasksStore } from "@/stores/tasks/tasks";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useAuthStore } from "@/stores/auth/auth";

const SEARCH_DEBOUNCE_MS = 280;
const store = useTasksStore();
const permissions = usePermissionsStore();
const auth = useAuthStore();

const viewMode = ref("table"); // 'table' | 'cards'

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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
  statuses.map((s) => ({ label: `Status: ${formatLabel(s)}`, value: s }))
);

const priorityOptions = computed(() =>
  priorities.map((p) => ({ label: `Priority: ${formatLabel(p)}`, value: p }))
);

const canViewAllTasks = computed(() => permissions.can("task.view_all"));

// Columns Definition for DataTable matching Stitch layout
const columns = computed(() => {
  const base = [
    { key: "select", label: "", width: 44, sortable: false },
    { key: "title", label: "Title", minWidth: 240 },
    { key: "status", label: "Status", width: 130 },
    { key: "priority", label: "Priority", width: 110 },
  ];
  if (canViewAllTasks.value) {
    base.push({ key: "created_by", label: "Creator", width: 160 });
  }
  base.push(
    { key: "assigned_to", label: "Assignee", width: 180 },
    { key: "created_at", label: "Created Date", width: 135 },
    { key: "due_date", label: "Due Date", width: 130 }
  );
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
  if (isOverdue(row)) return "bg-status-overdue-bg/15";
  if (row.status === "COMPLETED") return "opacity-80";
  return "";
};

// Stitch Quiet Work Status Badges (Tokens from src/style.css)
const getStatusClasses = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED") return "badge-status-completed";
  if (s === "PENDING") return "badge-status-pending";
  if (s === "UPCOMING") return "badge-status-upcoming";
  if (s === "PICK_LATER") return "badge-status-pick-later";
  if (s === "OVERDUE") return "badge-status-overdue";
  return "bg-surface-subtle text-secondary-text";
};

const getStatusDotClass = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED") return "dot-status-completed";
  if (s === "PENDING") return "dot-status-pending";
  if (s === "UPCOMING") return "dot-status-upcoming";
  if (s === "PICK_LATER") return "dot-status-pick-later";
  if (s === "OVERDUE") return "dot-status-overdue";
  return "bg-secondary-text/50";
};

// Stitch Quiet Work Priority Badges (Tokens from src/style.css)
const getPriorityClasses = (priority) => {
  const p = String(priority || "").toUpperCase();
  if (p === "HIGH") return "badge-priority-high";
  if (p === "MEDIUM") return "badge-priority-medium";
  return "badge-priority-low";
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

const exportTasksLog = () => {
  const exportData = displayedTasks.value.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    creator_name: t.creator?.name || t.created_by_name || "",
    creator_email: t.creator?.email || "",
    assignee_name: t.assignee?.name || t.assigned_to_name || "",
    assignee_email: t.assignee?.email || "",
    created_at: t.created_at,
    due_date: t.due_date,
    completed_at: t.completed_at,
  }));
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks-log-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
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
};

const toggleComplete = async (row) => {
  const nextStatus = row.status === "COMPLETED" ? "PENDING" : "COMPLETED";
  await store.updateTask(row.id, { status: nextStatus });
  reloadList();
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
};

onMounted(() => {
  store.fetchSummary(true);
  reloadList();
});
</script>
