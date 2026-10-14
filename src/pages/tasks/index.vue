<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard title="Total" :value="summary?.total ?? '—'" icon="tag" />
      <MetricCard title="Pending" :value="summary?.status?.pending ?? '—'" icon="pending" />
      <MetricCard title="Upcoming" :value="summary?.status?.upcoming ?? '—'" icon="event_upcoming" />
      <MetricCard title="Pick later" :value="summary?.status?.pick_later ?? '—'" icon="schedule" />
      <MetricCard title="Completed" :value="summary?.status?.completed ?? '—'" icon="check_circle" />
      <MetricCard title="Overdue" :value="summary?.overdue ?? '—'" icon="warning" />
    </div>

    <!-- Filters & Action Bar -->
    <div
      class="p-3 sm:p-3.5 rounded-xl bg-card-background border border-primary-border/60  flex flex-col md:flex-row md:items-center justify-between gap-3"
    >
      <!-- Filters Group -->
      <div class="flex flex-1 flex-wrap items-center gap-2.5">
        <!-- Search Input with Debouncer -->
        <div class="relative flex-1 min-w-[200px] sm:min-w-[240px] max-w-sm">
          <span
            class="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text text-base pointer-events-none"
          >
            search
          </span>
          <input
            v-model="filters.q"
            type="text"
            class="input-field pl-9 pr-8 h-9 text-xs w-full bg-background rounded-lg border border-primary-border focus:border-primary placeholder:text-secondary-text/50"
            placeholder="Search tasks by title..."
            @input="handleSearchInput"
          />
          <button
            v-if="filters.q"
            type="button"
            @click="clearSearch"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text cursor-pointer p-0.5 rounded transition-colors"
            title="Clear search"
          >
            <span class="material-symbols-rounded text-sm">close</span>
          </button>
        </div>

        <!-- Status Filter (Direct Apply) -->
        <div class="w-36 sm:w-40">
          <BaseSelect
            v-model="filters.status"
            :options="statusOptions"
            allow-all
            all-label="All Statuses"
            custom-class="!h-9 !py-1 text-xs rounded-lg bg-background"
            @update:model-value="applyFilters"
          />
        </div>

        <!-- Priority Filter (Direct Apply) -->
        <div class="w-36 sm:w-40">
          <BaseSelect
            v-model="filters.priority"
            :options="priorityOptions"
            allow-all
            all-label="All Priorities"
            custom-class="!h-9 !py-1 text-xs rounded-lg bg-background"
            @update:model-value="applyFilters"
          />
        </div>

        <!-- Reset Filters Button -->
        <button
          v-if="hasActiveFilters"
          type="button"
          @click="resetFilters"
          class="h-9 inline-flex items-center gap-1 px-2.5 text-xs text-secondary-text hover:text-primary-red transition-colors cursor-pointer rounded-lg hover:bg-background shrink-0"
          title="Reset filters"
        >
          <span class="material-symbols-rounded text-sm">restart_alt</span>
          <span>Reset</span>
        </button>
      </div>

      <!-- Action Button: New Task -->
      <div class="flex items-center shrink-0">
        <button
          v-if="permissions.can('task.create')"
          type="button"
          class="btn-primary h-9 text-xs px-3.5 flex items-center gap-1.5  cursor-pointer whitespace-nowrap"
          @click="openCreate"
        >
          <span class="material-symbols-rounded text-base">add</span>
          <span>New task</span>
        </button>
      </div>
    </div>

    <DataTable
      :data="store.tasks"
      :columns="columns"
      :loading="store.loading"
      :row-class="taskRowClass"
      row-key="id"
    >
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
      <template #cell-priority="{ row }">
        <StatusBadge :status="row.priority" />
      </template>
      <template #cell-created_by="{ row }">
        <span class="text-xs text-primary-text">{{ row.created_by_name || row.created_by }}</span>
      </template>
      <template #cell-assigned_to="{ row }">
        <span class="text-xs text-primary-text">{{ row.assigned_to_name || row.assigned_to }}</span>
      </template>
      <template #cell-due_date="{ row }">
        <span :class="isOverdue(row) ? 'text-primary-red font-semibold' : ''">
          {{ row.due_date || "—" }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center gap-2">
          <button
            v-if="canOpenEditor(row)"
            type="button"
            class="text-xs text-primary hover:underline"
            @click="openEdit(row)"
          >
            Edit
          </button>
          <button
            v-if="canComplete(row)"
            type="button"
            class="text-xs text-primary-green hover:underline"
            @click="completeTask(row)"
          >
            Complete
          </button>
          <button
            v-if="permissions.can('task.delete') && isCreator(row)"
            type="button"
            class="text-xs text-primary-red hover:underline"
            @click="confirmDelete(row)"
          >
            Delete
          </button>
        </div>
      </template>
    </DataTable>

    <div class="flex justify-between">
      <button
        type="button"
        class="btn-secondary text-xs px-3 py-1.5"
        :disabled="filters.offset <= 0"
        @click="prevPage"
      >
        Previous
      </button>
      <button
        type="button"
        class="btn-secondary text-xs px-3 py-1.5"
        :disabled="!store.hasMore"
        @click="nextPage"
      >
        Next
      </button>
    </div>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="modalOpen = false"
    >
      <form
        class="bg-card-background border border-primary-border rounded-xl w-full max-w-lg p-5 space-y-3"
        @submit.prevent="saveTask"
      >
        <h3 class="title-text text-sm">{{ editing ? "Edit task" : "New task" }}</h3>
        <input
          v-model="form.title"
          class="input-field px-3 py-2 text-sm"
          placeholder="Title"
          required
          :disabled="!canEditFields"
        />
        <textarea
          v-model="form.description"
          class="input-field px-3 py-2 text-sm min-h-20"
          placeholder="Description"
          :disabled="!canEditFields"
        />
        <div class="grid grid-cols-2 gap-3">
          <BaseSelect
            v-model="form.status"
            :options="availableStatuses.map(s => ({ label: s, value: s }))"
            :disabled="!canChangeStatus"
            custom-class="!py-2 text-sm"
          />
          <BaseSelect
            v-model="form.priority"
            :options="priorities.map(p => ({ label: p, value: p }))"
            :disabled="!canEditFields"
            custom-class="!py-2 text-sm"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <input v-model="form.start_date" type="date" class="input-field px-3 py-2 text-sm" :disabled="!canEditFields" />
          <input v-model="form.due_date" type="date" class="input-field px-3 py-2 text-sm" :disabled="!canEditFields" />
        </div>

        <div v-if="canPickCreator" class="space-y-2">
          <label class="block text-[11px] text-secondary-text">Create on behalf of</label>
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-primary-text">
              {{ form.created_by_name || "Me (self)" }}
            </p>
            <button type="button" class="text-xs text-primary hover:underline" @click="createAsMe">
              Me
            </button>
          </div>
          <input
            v-model="creatorQuery"
            class="input-field px-3 py-2 text-sm"
            placeholder="Search user to create for…"
            autocomplete="off"
          />
          <div v-if="store.assigneesLoading && activeUserSearch === 'creator'" class="text-[11px] text-secondary-text">
            Searching…
          </div>
          <div
            v-else-if="activeUserSearch === 'creator' && store.assigneeMatches.length"
            class="border border-primary-border rounded-lg divide-y divide-primary-border/40 max-h-40 overflow-y-auto"
          >
            <button
              v-for="person in store.assigneeMatches"
              :key="`creator-${person.id}`"
              type="button"
              class="w-full text-left px-3 py-2 hover:bg-background"
              @click="selectCreator(person)"
            >
              <p class="text-xs font-semibold text-primary-text">{{ person.name }}</p>
              <p class="text-[11px] text-secondary-text">{{ person.email }}</p>
            </button>
          </div>
        </div>

        <div v-if="canPickAssignee" class="space-y-2">
          <label class="block text-[11px] text-secondary-text">Assignee</label>
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-primary-text">
              {{ form.assigned_to_name || (form.assigned_to ? `User #${form.assigned_to}` : "Same as creator") }}
            </p>
            <button type="button" class="text-xs text-primary hover:underline" @click="assignToMe">
              Assign to me
            </button>
          </div>
          <input
            v-model="assigneeQuery"
            class="input-field px-3 py-2 text-sm"
            placeholder="Search people by name or email…"
            autocomplete="off"
          />
          <div v-if="store.assigneesLoading && activeUserSearch === 'assignee'" class="text-[11px] text-secondary-text">
            Searching…
          </div>
          <div
            v-else-if="activeUserSearch === 'assignee' && store.assigneeMatches.length"
            class="border border-primary-border rounded-lg divide-y divide-primary-border/40 max-h-40 overflow-y-auto"
          >
            <button
              v-for="person in store.assigneeMatches"
              :key="`assignee-${person.id}`"
              type="button"
              class="w-full text-left px-3 py-2 hover:bg-background"
              @click="selectAssignee(person)"
            >
              <p class="text-xs font-semibold text-primary-text">{{ person.name }}</p>
              <p class="text-[11px] text-secondary-text">{{ person.email }}</p>
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="modalOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5" :disabled="store.actionLoading">Save</button>
        </div>
      </form>
    </div>

    <ConfirmationDialog
      v-model="deleteOpen"
      title="Delete task?"
      message="Only the creator can delete. This cannot be undone."
      confirm-text="Delete"
      :loading="store.actionLoading"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import DataTable from "@/components/common/DataTable";
import MetricCard from "@/components/common/MetricCard.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
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
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const statusOptions = computed(() =>
  statuses.map((s) => ({ label: formatLabel(s), value: s }))
);

const priorityOptions = computed(() =>
  priorities.map((p) => ({ label: formatLabel(p), value: p }))
);
const canViewAllTasks = computed(() => permissions.can("task.view_all"));
const columns = computed(() => {
  const base = [
    { key: "id", label: "ID", width: 60 },
    { key: "title", label: "Title" },
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
  ];
  if (canViewAllTasks.value) {
    base.push({ key: "created_by", label: "Created by" });
  }
  base.push(
    { key: "assigned_to", label: "Assignee" },
    { key: "due_date", label: "Due" },
  );
  return base;
});

const filters = reactive({
  status: "",
  priority: "",
  q: "",
  limit: 50,
  offset: 0,
});

const summary = computed(() => store.summary);
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

const taskRowClass = (row) => (isOverdue(row) ? "bg-primary-red/5" : "");

const canEditFields = computed(() => {
  if (!permissions.can("task.update")) return false;
  if (!editing.value) return true;
  return isParticipant(editing.value);
});

const canChangeStatus = computed(() => {
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
  if (!permissions.can("task.assign")) return false;
  if (!editing.value) return true;
  return isCreator(editing.value);
});

const canOpenEditor = (row) => {
  if (!isParticipant(row)) return false;
  if (permissions.can("task.update")) return true;
  if (permissions.can("task.assign") && isCreator(row)) return true;
  if (permissions.can("task.complete") && row.status !== "COMPLETED") return true;
  return false;
};

const canComplete = (row) => {
  return (
    permissions.can("task.complete") &&
    isParticipant(row) &&
    row.status !== "COMPLETED"
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
  limit: filters.limit,
  offset: filters.offset,
});

const reloadList = () => store.fetchTasks(listQuery(), true);

const applyFilters = () => {
  filters.offset = 0;
  store.fetchTasks(listQuery(), true);
  store.fetchSummary(true);
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
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  applyFilters();
};

const hasActiveFilters = computed(() => {
  return !!filters.status || !!filters.priority || !!filters.q;
});

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
    created_by_name: row.created_by_name || "",
    assigned_to: row.assigned_to,
    assigned_to_name: row.assigned_to_name || "",
    start_date: row.start_date || "",
    due_date: row.due_date || "",
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
  // Default assignee follows the principal unless the admin already chose someone else.
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
      title: form.title,
      description: form.description || null,
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
      payload.assigned_to = form.assigned_to;
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
    patch.assigned_to = form.assigned_to;
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
};

const completeTask = (row) => store.updateTask(row.id, { status: "COMPLETED" });
const confirmDelete = (row) => {
  deleteTarget.value = row;
  deleteOpen.value = true;
};
const doDelete = async () => {
  if (deleteTarget.value) await store.deleteTask(deleteTarget.value.id);
  deleteOpen.value = false;
};

onMounted(() => {
  store.fetchSummary(true);
  reloadList();
});
</script>
