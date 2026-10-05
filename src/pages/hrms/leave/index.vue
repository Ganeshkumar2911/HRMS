<template>
  <div class="space-y-6">
    <div class="flex gap-1 border-b border-primary-border/60 overflow-x-auto no-scrollbar">
      <button
        v-for="tab in visibleTabs"
        :key="tab"
        type="button"
        class="px-3 py-2 text-xs font-medium whitespace-nowrap"
        :class="activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-secondary-text'"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Balances -->
    <section v-if="activeTab === 'Balances'" class="space-y-3">
      <DataTable :data="hrms.leaveBalances" row-key="id" />
      <form
        v-if="permissions.can('leave_balance.adjust')"
        class="p-4 rounded-xl border border-primary-border bg-card-background grid grid-cols-2 md:grid-cols-4 gap-2"
        @submit.prevent="adjust"
      >
        <input v-model.number="adjustForm.employee_id" type="number" class="input-field px-2 py-1.5 text-xs" placeholder="Employee ID" required />
        <input v-model.number="adjustForm.leave_type_id" type="number" class="input-field px-2 py-1.5 text-xs" placeholder="Leave type ID" required />
        <input v-model.number="adjustForm.year" type="number" class="input-field px-2 py-1.5 text-xs" placeholder="Year" required />
        <input v-model.number="adjustForm.amount" type="number" step="0.5" class="input-field px-2 py-1.5 text-xs" placeholder="Amount" required />
        <input v-model="adjustForm.reason" class="input-field px-2 py-1.5 text-xs col-span-2" placeholder="Reason" required />
        <button type="submit" class="btn-primary text-xs px-3 py-1.5">Adjust</button>
      </form>
    </section>

    <!-- Requests -->
    <section v-if="activeTab === 'Requests'" class="space-y-3">
      <div class="flex justify-between">
        <select v-model="requestStatus" class="input-field px-2 py-1.5 text-xs w-40" @change="loadRequests">
          <option value="">All statuses</option>
          <option>PENDING</option>
          <option>APPROVED</option>
          <option>REJECTED</option>
          <option>CANCELLED</option>
        </select>
        <button
          v-if="permissions.can('leave_request.create')"
          type="button"
          class="btn-primary text-xs px-3 py-1.5"
          @click="requestOpen = true"
        >
          New request
        </button>
      </div>
      <DataTable :data="hrms.leaveRequests" :columns="requestColumns" row-key="id">
        <template #cell-status="{ row }"><StatusBadge :status="row.status" /></template>
        <template #actions="{ row }">
          <div class="flex gap-2">
            <button
              v-if="row.status === 'PENDING' && permissions.can('leave_request.approve')"
              type="button"
              class="text-xs text-primary-green hover:underline"
              @click="hrms.approveLeave(row.id)"
            >
              Approve
            </button>
            <button
              v-if="row.status === 'PENDING' && permissions.can('leave_request.reject')"
              type="button"
              class="text-xs text-primary-red hover:underline"
              @click="hrms.rejectLeave(row.id)"
            >
              Reject
            </button>
            <button
              v-if="['PENDING', 'APPROVED'].includes(row.status) && permissions.can('leave_request.cancel')"
              type="button"
              class="text-xs text-secondary-text hover:underline"
              @click="confirmCancel(row)"
            >
              Cancel
            </button>
          </div>
        </template>
      </DataTable>
    </section>

    <!-- Types -->
    <section v-if="activeTab === 'Types'" class="space-y-3">
      <button v-if="permissions.can('leave_type.create')" type="button" class="btn-primary text-xs px-3 py-1.5" @click="typeOpen = true">
        New type
      </button>
      <DataTable :data="hrms.leaveTypes" row-key="id" />
    </section>

    <!-- Policies -->
    <section v-if="activeTab === 'Policies'" class="space-y-3">
      <button v-if="permissions.can('leave_policy.create')" type="button" class="btn-primary text-xs px-3 py-1.5" @click="policyOpen = true">
        New policy
      </button>
      <DataTable :data="hrms.leavePolicies" row-key="id" />
    </section>

    <!-- New request modal -->
    <div v-if="requestOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="requestOpen = false">
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-md p-5 space-y-3" @submit.prevent="submitRequest">
        <h3 class="title-text text-sm">Leave request</h3>
        <select v-model.number="requestForm.leave_type_id" class="input-field px-3 py-2 text-sm" required>
          <option disabled :value="null">Leave type</option>
          <option v-for="t in hrms.leaveTypes" :key="t.id" :value="t.id">{{ t.name || t.code || t.id }}</option>
        </select>
        <input v-model="requestForm.start_date" type="date" class="input-field px-3 py-2 text-sm" required />
        <input v-model="requestForm.end_date" type="date" class="input-field px-3 py-2 text-sm" required />
        <label class="flex items-center gap-2 text-xs"><input v-model="requestForm.half_day_start" type="checkbox" /> Half day start</label>
        <label class="flex items-center gap-2 text-xs"><input v-model="requestForm.half_day_end" type="checkbox" /> Half day end</label>
        <textarea v-model="requestForm.reason" class="input-field px-3 py-2 text-sm" placeholder="Reason" />
        <input
          v-if="scope !== 'SELF'"
          v-model.number="requestForm.employee_id"
          type="number"
          class="input-field px-3 py-2 text-sm"
          placeholder="Employee ID (optional)"
        />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="requestOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5">Submit</button>
        </div>
      </form>
    </div>

    <div v-if="typeOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="typeOpen = false">
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-md p-5 space-y-3" @submit.prevent="createType">
        <h3 class="title-text text-sm">Leave type</h3>
        <input v-model="typeForm.name" class="input-field px-3 py-2 text-sm" placeholder="Name" required />
        <input v-model="typeForm.code" class="input-field px-3 py-2 text-sm" placeholder="Code" required />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="typeOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5">Create</button>
        </div>
      </form>
    </div>

    <div v-if="policyOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="policyOpen = false">
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-md p-5 space-y-3" @submit.prevent="createPolicy">
        <h3 class="title-text text-sm">Leave policy</h3>
        <input v-model="policyForm.name" class="input-field px-3 py-2 text-sm" placeholder="Name" required />
        <input v-model.number="policyForm.leave_type_id" type="number" class="input-field px-3 py-2 text-sm" placeholder="Leave type ID" required />
        <input v-model.number="policyForm.annual_allocation" type="number" class="input-field px-3 py-2 text-sm" placeholder="Annual allocation" required />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="policyOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5">Create</button>
        </div>
      </form>
    </div>

    <ConfirmationDialog
      v-model="cancelOpen"
      title="Cancel leave request?"
      message="Cancelling an APPROVED request may reverse attendance. Confirm carefully."
      confirm-text="Cancel leave"
      :loading="hrms.actionLoading"
      @confirm="doCancel"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const hrms = useHrmsStore();
const permissions = usePermissionsStore();
const scope = computed(() => permissions.scopeOf("leave_request.view"));
const activeTab = ref("Requests");
const visibleTabs = computed(() => {
  const tabs = ["Requests", "Balances"];
  if (permissions.can("leave_type.view")) tabs.push("Types");
  if (permissions.can("leave_policy.view")) tabs.push("Policies");
  return tabs;
});

const requestColumns = [
  { key: "id", label: "ID", width: 60 },
  { key: "employee_id", label: "Employee" },
  { key: "leave_type_id", label: "Type" },
  { key: "start_date", label: "Start" },
  { key: "end_date", label: "End" },
  { key: "total_days", label: "Days" },
  { key: "status", label: "Status" },
];

const requestStatus = ref("");
const requestOpen = ref(false);
const requestForm = reactive({
  leave_type_id: null,
  start_date: "",
  end_date: "",
  half_day_start: false,
  half_day_end: false,
  reason: "",
  employee_id: null,
});

const adjustForm = reactive({
  employee_id: null,
  leave_type_id: null,
  year: new Date().getFullYear(),
  amount: 1,
  reason: "",
});

const typeOpen = ref(false);
const typeForm = reactive({ name: "", code: "" });
const policyOpen = ref(false);
const policyForm = reactive({ name: "", leave_type_id: null, annual_allocation: 12 });
const cancelOpen = ref(false);
const cancelTarget = ref(null);

const loadRequests = () => {
  const params = {};
  if (requestStatus.value) params.request_status = requestStatus.value;
  hrms.fetchLeaveRequests(params, true);
};

const submitRequest = async () => {
  const payload = { ...requestForm };
  if (!payload.employee_id) delete payload.employee_id;
  await hrms.createLeaveRequest(payload);
  requestOpen.value = false;
};

const adjust = () => hrms.adjustBalance({ ...adjustForm });
const createType = async () => {
  await hrms.createLeaveType({ ...typeForm });
  typeOpen.value = false;
};
const createPolicy = async () => {
  await hrms.createLeavePolicy({ ...policyForm });
  policyOpen.value = false;
};

const confirmCancel = (row) => {
  cancelTarget.value = row;
  cancelOpen.value = true;
};
const doCancel = async () => {
  if (cancelTarget.value) await hrms.cancelLeave(cancelTarget.value.id);
  cancelOpen.value = false;
};

onMounted(() => {
  loadRequests();
  hrms.fetchLeaveBalances({}, true);
  hrms.fetchLeaveTypes(true);
  hrms.fetchLeavePolicies(true);
});
</script>
