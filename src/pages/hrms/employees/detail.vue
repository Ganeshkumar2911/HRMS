<template>
  <div class="space-y-6" v-if="employee">
    <PageTopBar
      :title="employee.user?.name || employee.employee_code"
      :description="`${employee.employee_code} · Employee #${employee.id}`"
      show-back-button
    >
      <template #actions>
        <StatusBadge :status="employee.employment_status" />
        <button
          v-if="permissions.can('employee.update')"
          type="button"
          @click="isEditing = !isEditing"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border"
          :class="
            isEditing
              ? 'bg-surface-subtle text-primary-text border-primary-border/60 hover:bg-surface-container'
              : 'bg-primary text-btn-text-primary border-primary hover:bg-primary-hover'
          "
        >
          <Pencil v-if="!isEditing" class="w-3.5 h-3.5" />
          <X v-else class="w-3.5 h-3.5" />
          <span>{{ isEditing ? "Cancel" : "Edit" }}</span>
        </button>
      </template>
    </PageTopBar>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Profile, Address & Emergency Contact -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Profile & Employment -->
        <section
          class="bg-card-background border border-primary-border/60 rounded-xl p-5 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-primary-text">
              Profile &amp; Employment
            </h2>
            <span class="text-[11px] text-secondary-text">{{
              employee.employment_type
            }}</span>
          </div>

          <div
            v-if="!isEditing"
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
          >
            <div>
              <p class="text-secondary-text mb-0.5">Work Email</p>
              <p class="font-medium text-primary-text">
                {{ employee.user?.email || "—" }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text mb-0.5">Personal Email</p>
              <p class="font-medium text-primary-text">
                {{ employee.personal_email || "—" }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text mb-0.5">Phone</p>
              <p class="font-medium text-primary-text">
                {{ employee.phone || "—" }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text mb-0.5">Joined</p>
              <p class="font-medium text-primary-text">
                {{ employee.joining_date || "—" }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text mb-0.5">Department</p>
              <p class="font-medium text-primary-text">
                {{ employee.department?.name || "—" }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text mb-0.5">Designation</p>
              <p class="font-medium text-primary-text">
                {{ employee.designation?.name || "—" }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text mb-0.5">Location</p>
              <p class="font-medium text-primary-text">
                {{ employee.work_location?.name || "—" }}
              </p>
            </div>
            <div>
              <p class="text-secondary-text mb-0.5">Manager</p>
              <p class="font-medium text-primary-text">
                {{ employee.manager?.user?.name || "—" }}
              </p>
            </div>
          </div>

          <div v-else class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                v-model="form.phone"
                class="input-field px-3 py-2 text-xs"
                placeholder="Phone"
              />
              <input
                v-model="form.personal_email"
                class="input-field px-3 py-2 text-xs"
                placeholder="Personal email"
              />
              <BaseSelect
                v-model="form.employment_status"
                :options="employmentStatusOptions"
                custom-class="!py-2 text-xs"
              />
              <input
                v-model.number="form.department_id"
                type="number"
                class="input-field px-3 py-2 text-xs"
                placeholder="Department ID"
              />
              <input
                v-model.number="form.manager_id"
                type="number"
                class="input-field px-3 py-2 text-xs"
                placeholder="Manager employee ID"
              />
              <input
                v-model.number="form.work_location_id"
                type="number"
                class="input-field px-3 py-2 text-xs"
                placeholder="Location ID"
              />
            </div>
            <div class="flex justify-end">
              <button
                type="button"
                class="btn-primary text-xs px-3.5 py-1.5"
                @click="
                  saveProfile().then(() => {
                    isEditing = false;
                  })
                "
              >
                Save changes
              </button>
            </div>
          </div>
        </section>

        <!-- Address & Emergency Contact -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section
            class="bg-card-background border border-primary-border/60 rounded-xl p-5 space-y-3"
          >
            <h2 class="text-sm font-semibold text-primary-text">Add Address</h2>
            <BaseSelect
              v-model="address.address_type"
              :options="addressTypeOptions"
              custom-class="!py-2 text-xs"
            />
            <div class="relative">
              <input
                v-model="address.pin_code"
                maxlength="6"
                inputmode="numeric"
                class="input-field px-3 py-2 text-xs w-full"
                placeholder="PIN Code (e.g. 560001)"
                @input="handlePinInput"
              />
              <span
                v-if="pinLookupLoading"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-secondary-text"
              >
                Looking up…
              </span>
            </div>
            <input
              v-model="address.line1"
              class="input-field px-3 py-2 text-xs"
              placeholder="Address line 1"
            />
            <input
              v-model="address.line2"
              class="input-field px-3 py-2 text-xs"
              placeholder="Address line 2 (optional)"
            />
            <div class="grid grid-cols-2 gap-2.5">
              <input
                v-model="address.city"
                class="input-field px-3 py-2 text-xs"
                placeholder="City"
              />
              <input
                v-model="address.state"
                class="input-field px-3 py-2 text-xs"
                placeholder="State"
              />
            </div>
            <input
              v-model="address.country"
              class="input-field px-3 py-2 text-xs"
              placeholder="Country"
            />
            <button
              type="button"
              class="btn-primary text-xs px-3 py-1.5"
              @click="saveAddress"
            >
              Add address
            </button>
          </section>

          <section
            class="bg-card-background border border-primary-border/60 rounded-xl p-5 space-y-3"
          >
            <h2 class="text-sm font-semibold text-primary-text">
              Add Emergency Contact
            </h2>
            <input
              v-model="emergency.name"
              class="input-field px-3 py-2 text-xs"
              placeholder="Contact name"
            />
            <input
              v-model="emergency.relation"
              class="input-field px-3 py-2 text-xs"
              placeholder="Relation"
            />
            <input
              v-model="emergency.phone"
              class="input-field px-3 py-2 text-xs"
              placeholder="Phone"
            />
            <button
              type="button"
              class="btn-primary text-xs px-3 py-1.5"
              @click="saveEmergency"
            >
              Add contact
            </button>
          </section>
        </div>
      </div>

      <!-- Right: History -->
      <section
        class="bg-card-background border border-primary-border/60 rounded-xl p-5 space-y-3 h-fit"
      >
        <h2 class="text-sm font-semibold text-primary-text">History</h2>
        <div class="space-y-2">
          <div
            v-for="item in hrms.employeeHistory"
            :key="item.id || item.created_at"
            class="p-3 rounded-lg border border-primary-border/60 bg-surface-subtle/50 text-xs"
          >
            <p class="font-semibold text-primary-text">
              {{ item.action || item.module }}
            </p>
            <p class="text-[11px] text-secondary-text mt-0.5">
              {{ item.entity_type }} #{{ item.entity_id }} ·
              {{ item.created_at }}
            </p>
          </div>
          <p
            v-if="!hrms.employeeHistory.length"
            class="text-xs text-secondary-text"
          >
            No history recorded.
          </p>
        </div>
      </section>
    </div>
  </div>
  <div
    v-else
    class="space-y-6 animate-pulse"
    aria-busy="true"
    aria-label="Loading employee"
  >
    <!-- PageTopBar Skeleton -->
    <div
      class="-mx-2 sm:-mx-4 lg:-mx-6 -mt-6 bg-card-background border-b border-primary-border/60 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-surface-subtle"></div>
        <div class="space-y-1.5">
          <div class="h-4 w-36 rounded bg-surface-container"></div>
          <div class="h-3 w-48 rounded bg-surface-subtle"></div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="h-6 w-20 rounded-full bg-surface-container"></div>
        <div class="h-8 w-16 rounded-lg bg-surface-container"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Profile, Address & Emergency Contact Skeleton -->
      <div class="lg:col-span-2 space-y-6">
        <section
          class="bg-card-background border border-primary-border/60 rounded-xl p-5 space-y-4"
        >
          <div class="flex items-center justify-between">
            <div class="h-4 w-36 rounded bg-surface-container"></div>
            <div class="h-3 w-16 rounded bg-surface-subtle"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="i in 8" :key="i" class="space-y-1.5">
              <div class="h-3 w-20 rounded bg-surface-subtle"></div>
              <div class="h-3.5 w-32 rounded bg-surface-container"></div>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section
            class="bg-card-background border border-primary-border/60 rounded-xl p-5 space-y-3"
          >
            <div class="h-4 w-28 rounded bg-surface-container"></div>
            <div class="h-9 rounded-lg bg-surface-subtle"></div>
            <div class="h-9 rounded-lg bg-surface-subtle"></div>
            <div class="h-9 rounded-lg bg-surface-subtle"></div>
            <div class="h-8 w-24 rounded-lg bg-surface-container"></div>
          </section>
          <section
            class="bg-card-background border border-primary-border/60 rounded-xl p-5 space-y-3"
          >
            <div class="h-4 w-40 rounded bg-surface-container"></div>
            <div class="h-9 rounded-lg bg-surface-subtle"></div>
            <div class="h-9 rounded-lg bg-surface-subtle"></div>
            <div class="h-9 rounded-lg bg-surface-subtle"></div>
            <div class="h-8 w-24 rounded-lg bg-surface-container"></div>
          </section>
        </div>
      </div>

      <!-- Right: History Skeleton -->
      <section
        class="bg-card-background border border-primary-border/60 rounded-xl p-5 space-y-3 h-fit"
      >
        <div class="h-4 w-20 rounded bg-surface-container"></div>
        <div class="space-y-2">
          <div
            v-for="i in 3"
            :key="i"
            class="p-3 rounded-lg border border-primary-border/60 bg-surface-subtle/50 space-y-1.5"
          >
            <div class="h-3.5 w-32 rounded bg-surface-container"></div>
            <div class="h-3 w-44 rounded bg-surface-subtle"></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { Pencil, X } from "lucide-vue-next";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import StatusBadge from "@/components/common/StatusBadge.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const employmentStatusOptions = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
  { label: "ON_NOTICE", value: "ON_NOTICE" },
  { label: "ON_LEAVE", value: "ON_LEAVE" },
  { label: "TERMINATED", value: "TERMINATED" },
  { label: "RESIGNED", value: "RESIGNED" },
];

const addressTypeOptions = [
  { label: "CURRENT", value: "CURRENT" },
  { label: "PERMANENT", value: "PERMANENT" },
];

const route = useRoute();
const hrms = useHrmsStore();
const permissions = usePermissionsStore();
const isEditing = ref(false);
const employeeId = computed(() => Number(route.params.employeeId));
const employee = computed(() => hrms.activeEmployee);

const form = reactive({});
const address = reactive({
  address_type: "CURRENT",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pin_code: "",
  country: "India",
});
const pinLookupLoading = ref(false);

const handlePinInput = async () => {
  const pin = address.pin_code.replace(/\D/g, "").slice(0, 6);
  address.pin_code = pin;
  if (pin.length !== 6) return;

  pinLookupLoading.value = true;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    const postOffice = data?.[0]?.PostOffice?.[0];
    if (postOffice) {
      address.city = postOffice.District || address.city;
      address.state = postOffice.State || address.state;
      address.country = postOffice.Country || "India";
    }
  } catch {
    // Ignore lookup failure; user can still type city/state manually
  } finally {
    pinLookupLoading.value = false;
  }
};
const emergency = reactive({ name: "", relation: "", phone: "" });

watch(
  employee,
  (value) => {
    if (!value) return;
    Object.assign(form, {
      phone: value.phone || "",
      personal_email: value.personal_email || "",
      employment_status: value.employment_status,
      department_id: value.department_id,
      manager_id: value.manager_id,
      work_location_id: value.work_location_id,
    });
  },
  { immediate: true },
);

const saveProfile = async () => {
  const patch = {};
  const original = employee.value;
  Object.keys(form).forEach((key) => {
    const next = form[key] === "" ? null : form[key];
    if (next !== (original[key] ?? null)) patch[key] = next;
  });
  if (!Object.keys(patch).length) return;
  await hrms.updateEmployee(employeeId.value, patch);
};

const saveAddress = () =>
  hrms.addAddress(employeeId.value, {
    ...address,
    line2: address.line2 || null,
  });
const saveEmergency = () =>
  hrms.addEmergencyContact(employeeId.value, { ...emergency });

onMounted(async () => {
  await hrms.fetchEmployee(employeeId.value);
  hrms.fetchEmployeeHistory(employeeId.value);
});
</script>
