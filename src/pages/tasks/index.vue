<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <span class="material-symbols-rounded text-base">task_alt</span>
          <span>Workflow</span>
        </div>
        <h1 class="title-text text-primary-text">Tasks</h1>
        <p class="sub-text text-secondary-text">
          {{
            canViewAllTasks
              ? "Organization view: every user’s tasks (created, assigned, completed)."
              : "You see tasks you created or that are assigned to you."
          }}
        </p>
      </div>
      <button
        v-if="permissions.can('task.create')"
        type="button"
        class="btn-primary text-xs px-3.5 py-2"
        @click="openCreate"
      >
        New task
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard title="Total" :value="summary?.total ?? '—'" icon="tag" />
      <MetricCard title="Pending" :value="summary?.status?.pending ?? '—'" icon="pending" />
      <MetricCard title="Upcoming" :value="summary?.status?.upcoming ?? '—'" icon="event_upcoming" />
      <MetricCard title="Pick later" :value="summary?.status?.pick_later ?? '—'" icon="schedule" />
      <MetricCard title="Completed" :value="summary?.status?.completed ?? '—'" icon="check_circle" />
      <MetricCard title="Overdue" :value="summary?.overdue ?? '—'" icon="warning" />
    </div>

    <div class="flex flex-wrap gap-2 items-end">
      <div>
        <label class="block text-[11px] text-secondary-text mb-1">Status</label>
        <select v-model="filters.status" class="input-field px-3 py-1.5 text-xs" @change="applyFilters">
          <option value="">All</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div>
        <label class="block text-[11px] text-secondary-text mb-1">Priority</label>
        <select v-model="filters.priority" class="input-field px-3 py-1.5 text-xs" @change="applyFilters">
          <option value="">All</option>
          <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div class="flex-1 min-w-40">
        <label class="block text-[11px] text-secondary-text mb-1">Search</label>
        <input
          v-model="filters.q"
          class="input-field px-3 py-1.5 text-xs"
          placeholder="Search title…"
          @keyup.enter="applyFilters"
        />
      </div>
      <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="applyFilters">Apply</button>
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
          <select v-model="form.status" class="input-field px-3 py-2 text-sm" :disabled="!canChangeStatus">
            <option v-for="s in availableStatuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <select v-model="form.priority" class="input-field px-3 py-2 text-sm" :disabled="!canEditFields">
            <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
          </select>
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
import { useTasksStore } from "@/stores/tasks/tasks";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useAuthStore } from "@/stores/auth/auth";

const SEARCH_DEBOUNCE_MS = 280;
const store = useTasksStore();
const permissions = usePermissionsStore();
const auth = useAuthStore();

const statuses = ["PENDING", "UPCOMING", "PICK_LATER", "COMPLETED"];
const priorities = ["LOW", "MEDIUM", "HIGH"];
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
