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
          Visibility: <code class="text-[11px]">created_by = me OR assigned_to = me</code>
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

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard title="Total" :value="summary?.total ?? '—'" icon="tag" />
      <MetricCard title="Pending" :value="summary?.status?.pending ?? '—'" icon="pending" />
      <MetricCard title="Completed" :value="summary?.status?.completed ?? '—'" icon="check_circle" />
      <MetricCard title="Overdue" :value="summary?.overdue ?? '—'" icon="warning" />
    </div>

    <div class="flex flex-wrap gap-2 items-end">
      <div>
        <label class="block text-[11px] text-secondary-text mb-1">Status</label>
        <select v-model="filters.status" class="input-field px-3 py-1.5 text-xs" @change="reload">
          <option value="">All</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div>
        <label class="block text-[11px] text-secondary-text mb-1">Priority</label>
        <select v-model="filters.priority" class="input-field px-3 py-1.5 text-xs" @change="reload">
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
          @keyup.enter="reload"
        />
      </div>
      <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="reload">Apply</button>
    </div>

    <DataTable :data="store.tasks" :columns="columns" :loading="store.loading" row-key="id">
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
      <template #cell-priority="{ row }">
        <StatusBadge :status="row.priority" />
      </template>
      <template #actions="{ row }">
        <div class="flex items-center gap-2">
          <button type="button" class="text-xs text-primary hover:underline" @click="openEdit(row)">Edit</button>
          <button
            v-if="permissions.can('task.complete') && row.status !== 'COMPLETED'"
            type="button"
            class="text-xs text-primary-green hover:underline"
            @click="completeTask(row)"
          >
            Complete
          </button>
          <button
            v-if="permissions.can('task.delete') && row.created_by === auth.currentUser?.id"
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

    <!-- Create / Edit modal -->
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
        <input v-model="form.title" class="input-field px-3 py-2 text-sm" placeholder="Title" required />
        <textarea v-model="form.description" class="input-field px-3 py-2 text-sm min-h-20" placeholder="Description" />
        <div class="grid grid-cols-2 gap-3">
          <select v-model="form.status" class="input-field px-3 py-2 text-sm">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <select v-model="form.priority" class="input-field px-3 py-2 text-sm">
            <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <input v-model="form.start_date" type="date" class="input-field px-3 py-2 text-sm" />
          <input v-model="form.due_date" type="date" class="input-field px-3 py-2 text-sm" />
        </div>
        <input
          v-model.number="form.assigned_to"
          type="number"
          class="input-field px-3 py-2 text-sm"
          placeholder="Assignee user id (optional)"
        />
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
import { computed, onMounted, reactive, ref } from "vue";
import DataTable from "@/components/common/DataTable";
import MetricCard from "@/components/common/MetricCard.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import { useTasksStore } from "@/stores/tasks/tasks";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useAuthStore } from "@/stores/auth/auth";

const store = useTasksStore();
const permissions = usePermissionsStore();
const auth = useAuthStore();

const statuses = ["PENDING", "UPCOMING", "PICK_LATER", "COMPLETED"];
const priorities = ["LOW", "MEDIUM", "HIGH"];
const columns = [
  { key: "id", label: "ID", width: 60 },
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "assigned_to", label: "Assignee" },
  { key: "due_date", label: "Due" },
];

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
const form = reactive({
  title: "",
  description: "",
  status: "PENDING",
  priority: "MEDIUM",
  assigned_to: null,
  start_date: "",
  due_date: "",
});

const reload = () => store.fetchTasks({ ...filters }, true);

const prevPage = () => {
  filters.offset = Math.max(0, filters.offset - filters.limit);
  reload();
};
const nextPage = () => {
  filters.offset += filters.limit;
  reload();
};

const openCreate = () => {
  editing.value = null;
  original.value = null;
  Object.assign(form, {
    title: "",
    description: "",
    status: "PENDING",
    priority: "MEDIUM",
    assigned_to: null,
    start_date: "",
    due_date: "",
  });
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
    assigned_to: row.assigned_to,
    start_date: row.start_date || "",
    due_date: row.due_date || "",
  });
  modalOpen.value = true;
};

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
    if (form.assigned_to) payload.assigned_to = form.assigned_to;
    return payload;
  }
  const patch = {};
  ["title", "description", "status", "priority", "assigned_to", "start_date", "due_date"].forEach((key) => {
    const next = form[key] === "" ? null : form[key];
    const prev = original.value[key] ?? null;
    if (next !== prev) patch[key] = next;
  });
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
  reload();
});
</script>
