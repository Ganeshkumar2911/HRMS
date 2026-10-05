<template>
  <div class="space-y-6">
    <div class="pb-5 border-b border-primary-border/60">
      <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
        <span class="material-symbols-rounded text-base">history</span>
        <span>Admin</span>
      </div>
      <h1 class="title-text text-primary-text">Audit trail</h1>
      <p class="sub-text text-secondary-text">Read-only mutation log. Snapshots load on detail view.</p>
    </div>

    <div class="flex flex-wrap gap-2 items-end">
      <div>
        <label class="block text-[11px] text-secondary-text mb-1">Module</label>
        <select v-model="filters.module" class="input-field px-3 py-1.5 text-xs">
          <option value="">All</option>
          <option v-for="m in modules" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <div>
        <label class="block text-[11px] text-secondary-text mb-1">Action</label>
        <input v-model="filters.action" class="input-field px-3 py-1.5 text-xs" placeholder="CREATE / UPDATE…" />
      </div>
      <div>
        <label class="block text-[11px] text-secondary-text mb-1">From</label>
        <input v-model="filters.from" type="date" class="input-field px-3 py-1.5 text-xs" />
      </div>
      <div>
        <label class="block text-[11px] text-secondary-text mb-1">To</label>
        <input v-model="filters.to" type="date" class="input-field px-3 py-1.5 text-xs" />
      </div>
      <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="reload">Apply</button>
    </div>

    <DataTable :data="auditStore.items" :columns="columns" :loading="auditStore.loading" row-key="id">
      <template #actions="{ row }">
        <button type="button" class="text-xs text-primary hover:underline" @click="showDetail(row)">Detail</button>
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
        :disabled="!auditStore.pagination?.has_more"
        @click="nextPage"
      >
        Next
      </button>
    </div>

    <div
      v-if="detailOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="detailOpen = false"
    >
      <div class="bg-card-background border border-primary-border rounded-xl w-full max-w-2xl p-5 space-y-3 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h3 class="title-text text-sm">Audit #{{ auditStore.activeLog?.id }}</h3>
          <button type="button" class="btn-icon" @click="detailOpen = false">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>
        <div v-if="auditStore.detailLoading" class="text-xs text-secondary-text">Loading…</div>
        <template v-else-if="auditStore.activeLog">
          <p class="text-xs text-secondary-text">
            {{ auditStore.activeLog.module }} / {{ auditStore.activeLog.action }} ·
            {{ auditStore.activeLog.entity_type }} #{{ auditStore.activeLog.entity_id }} ·
            actor {{ auditStore.activeLog.actor_name || auditStore.activeLog.actor_user_id }}
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p class="text-[11px] font-semibold mb-1">Old values</p>
              <pre class="text-[11px] bg-background border border-primary-border rounded-lg p-3 overflow-x-auto">{{ formatJson(auditStore.activeLog.old_values) }}</pre>
            </div>
            <div>
              <p class="text-[11px] font-semibold mb-1">New values</p>
              <pre class="text-[11px] bg-background border border-primary-border rounded-lg p-3 overflow-x-auto">{{ formatJson(auditStore.activeLog.new_values) }}</pre>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import DataTable from "@/components/common/DataTable";
import { useAuditStore } from "@/stores/audit/audit";

const auditStore = useAuditStore();
const modules = ["auth", "users", "rbac", "tasks", "hrms", "chat", "notifications"];
const columns = [
  { key: "id", label: "ID", width: 60 },
  { key: "module", label: "Module" },
  { key: "action", label: "Action" },
  { key: "entity_type", label: "Entity" },
  { key: "entity_id", label: "Entity ID" },
  { key: "actor_name", label: "Actor" },
  { key: "created_at", label: "When" },
];

const filters = reactive({
  module: "",
  action: "",
  from: "",
  to: "",
  limit: 50,
  offset: 0,
});

const detailOpen = ref(false);

const reload = () => auditStore.fetchLogs({ ...filters }, true);
const prevPage = () => {
  filters.offset = Math.max(0, filters.offset - filters.limit);
  reload();
};
const nextPage = () => {
  filters.offset += filters.limit;
  reload();
};

const showDetail = async (row) => {
  detailOpen.value = true;
  await auditStore.fetchDetail(row.id);
};

const formatJson = (value) => JSON.stringify(value ?? {}, null, 2);

onMounted(() => reload());
</script>
