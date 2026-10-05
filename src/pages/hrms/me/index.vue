<template>
  <div class="space-y-4">
    <div v-if="!auth.currentEmployee" class="p-6 rounded-xl border border-primary-border bg-card-background text-center space-y-2">
      <span class="material-symbols-rounded text-3xl text-primary-yellow">badge</span>
      <h2 class="title-text text-sm">No employee profile linked</h2>
      <p class="sub-text text-secondary-text">
        Creating a user does not create an employee. Ask HR to link your account.
      </p>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Employee code" :value="auth.currentEmployee.employee_code" icon="badge" />
        <MetricCard title="Status" :value="auth.currentEmployee.employment_status" icon="verified" />
        <MetricCard title="Type" :value="auth.currentEmployee.employment_type" icon="work" />
      </div>
      <div class="p-4 rounded-xl border border-primary-border bg-card-background space-y-2 text-sm">
        <p><span class="text-secondary-text">User ID:</span> {{ auth.currentEmployee.user_id }}</p>
        <p><span class="text-secondary-text">Department ID:</span> {{ auth.currentEmployee.department_id || "—" }}</p>
        <p><span class="text-secondary-text">Manager ID:</span> {{ auth.currentEmployee.manager_id || "—" }}</p>
        <p><span class="text-secondary-text">Phone:</span> {{ auth.currentEmployee.phone || "—" }}</p>
        <p><span class="text-secondary-text">Joining:</span> {{ auth.currentEmployee.joining_date || "—" }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import MetricCard from "@/components/common/MetricCard.vue";
import { useAuthStore } from "@/stores/auth/auth";

const auth = useAuthStore();
onMounted(() => auth.fetchCurrentEmployee(true));
</script>
