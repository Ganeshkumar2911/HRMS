<template>
  <div class="space-y-6 max-w-7xl pb-16">
    <!-- Top Navigation Sub-Bar & Breadcrumbs -->
    <div class="flex flex-col gap-3 pb-2">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">Attendance &amp; Leave</span>
            <span class="text-secondary-text text-xs">/</span>
            <span class="text-[11px] font-semibold uppercase tracking-wider text-primary">Configuration</span>
            <span
              class="ml-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
              :class="form.location_attendance_enabled ? 'bg-primary-green/15 text-primary-green' : 'bg-secondary-text/15 text-secondary-text'"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="form.location_attendance_enabled ? 'bg-primary-green animate-pulse' : 'bg-secondary-text'"
              ></span>
              {{ form.location_attendance_enabled ? "Policy Active" : "Location Inactive" }}
            </span>
          </div>
        </div>

        <!-- Action Buttons & Synced Status -->
        <div class="flex flex-wrap items-center gap-2.5">
          <div
            v-if="lastSyncedText"
            class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-secondary-text text-xs"
          >
            <span class="material-symbols-outlined text-[15px] text-secondary-text">history</span>
            <span>Synced {{ lastSyncedText }}</span>
          </div>

          <!-- Discard Button (Only visible when user makes changes) -->
          <button
            v-if="isDirty"
            type="button"
            class="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-hover text-primary-text font-medium text-xs transition-all flex items-center gap-1.5 active:scale-95 border border-primary-border  animate-in fade-in duration-200"
            title="Reset changes back to saved values"
            @click="discardChanges"
          >
            <span class="material-symbols-outlined text-[16px]">undo</span>
            <span>Discard</span>
          </button>

          <!-- Save Settings Button -->
          <button
            type="button"
            class="btn-primary text-xs px-4 py-2 rounded-lg  flex items-center gap-1.5"
            :disabled="hrms.actionLoading"
            @click="save"
          >
            <span v-if="hrms.actionLoading" class="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span v-else class="material-symbols-outlined text-[16px]">check</span>
            <span>{{ hrms.actionLoading ? "Saving..." : "Save Settings" }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
      <!-- LEFT COLUMN: Spatial & Geofence Coordinates (7 cols) -->
      <div class="xl:col-span-7 flex flex-col gap-6">
        <!-- Office Location Card -->
        <div class="bg-card-background rounded-2xl p-5 sm:p-6  flex flex-col gap-5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-primary-text">Office Boundary &amp; Geolocation</h2>
                <p class="text-xs text-secondary-text">Define spatial coordinates and allowed check-in circle</p>
              </div>
            </div>
            <span class="text-[11px] font-medium text-secondary-text bg-surface-container px-2.5 py-1 rounded-md">
              ID: #01-CAMPUS
            </span>
          </div>

          <!-- Office Name -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">Office Name</label>
            <input
              v-model="form.office_name"
              class="input-field px-3.5 py-2.5 text-sm"
              placeholder="Headquarters Campus"
            />
          </div>

          <!-- Coordinates Row with GPS Locator -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <div class="h-6 flex items-center justify-between">
                <label class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text leading-none">Latitude</label>
                <span class="text-[11px] text-text-muted leading-none">WGS84</span>
              </div>
              <div class="relative flex items-center">
                <input
                  v-model.number="form.office_latitude"
                  type="number"
                  step="any"
                  class="input-field px-3.5 py-2.5 text-sm pr-9"
                  placeholder="e.g. 21.2233741"
                  @change="syncMapFromForm"
                />
                <span class="material-symbols-outlined text-text-muted text-[17px] absolute right-3 pointer-events-none">pin_drop</span>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="h-6 flex items-center justify-between">
                <label class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text leading-none">Longitude</label>
                <button
                  type="button"
                  class="text-primary hover:opacity-80 text-[11px] font-medium flex items-center gap-1 transition-opacity cursor-pointer disabled:opacity-50 leading-none"
                  :disabled="isLocating"
                  @click="useMyLocation"
                >
                  <span class="material-symbols-outlined text-[14px]" :class="{ 'animate-spin': isLocating }">
                    {{ isLocating ? "refresh" : "my_location" }}
                  </span>
                  <span>{{ isLocating ? "Locating..." : "Use current GPS" }}</span>
                </button>
              </div>
              <div class="relative flex items-center">
                <input
                  v-model.number="form.office_longitude"
                  type="number"
                  step="any"
                  class="input-field px-3.5 py-2.5 text-sm pr-9"
                  placeholder="e.g. 81.6699668"
                  @change="syncMapFromForm"
                />
                <span class="material-symbols-outlined text-text-muted text-[17px] absolute right-3 pointer-events-none">explore</span>
              </div>
            </div>
          </div>

          <!-- Interactive Leaflet Map Container -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs text-secondary-text">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-primary">touch_app</span>
                Interactive Map — click map or drag marker to set coordinates
              </span>
              <span v-if="form.office_latitude != null && form.office_longitude != null" class="text-[11px] font-mono text-text-muted">
                {{ form.office_latitude?.toFixed(5) }}, {{ form.office_longitude?.toFixed(5) }}
              </span>
            </div>
            <div class="relative w-full h-80 rounded-xl overflow-hidden border border-primary-border bg-surface-container shadow-inner">
              <div ref="mapEl" class="h-full w-full z-0"></div>
            </div>
          </div>

          <!-- Check-in Allowed Radius -->
          <div class="flex flex-col gap-3 pt-1">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
                Allowed Radius (Geofence Perimeter)
              </label>
              <span class="text-xs text-secondary-text">
                Preset sizes or enter exact distance
              </span>
            </div>

            <!-- Radius Presets -->
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="r in radiusPresets"
                :key="r"
                type="button"
                class="py-2 px-3 rounded-lg text-xs font-semibold transition-all border text-center cursor-pointer active:scale-95"
                :class="
                  form.allowed_radius_meters === r
                    ? 'bg-primary text-btn-text-primary border-primary '
                    : 'bg-surface-container hover:bg-surface-hover text-secondary-text border-primary-border'
                "
                @click="setRadiusPreset(r)"
              >
                {{ r }} m
              </button>
            </div>

            <!-- Custom Radius Input Field -->
            <div class="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div class="relative flex-1 min-w-[140px]">
                <input
                  v-model.number="form.allowed_radius_meters"
                  type="number"
                  min="20"
                  max="5000"
                  class="input-field px-3.5 py-2.5 text-sm pr-16"
                  placeholder="100"
                  @change="redrawCircle"
                />
                <span class="absolute right-3.5 top-2.5 text-secondary-text text-xs pointer-events-none">meters</span>
              </div>
              <div class="text-secondary-text text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container border border-primary-border/60">
                <span class="material-symbols-outlined text-[16px] text-text-muted">straighten</span>
                <span>Effective diameter: <strong class="text-primary-text font-semibold">{{ effectiveDiameter }}m</strong></span>
              </div>
            </div>
          </div>

          <!-- GPS Accuracy & Rigor Mode -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-primary-border/60">
            <!-- Maximum Accuracy Threshold -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
                Max GPS Error Tolerance
              </label>
              <div class="relative flex items-center">
                <input
                  v-model.number="form.max_gps_accuracy_meters"
                  type="number"
                  min="5"
                  max="500"
                  class="input-field px-3.5 py-2.5 text-sm pr-16"
                  placeholder="50"
                />
                <span class="absolute right-3.5 text-secondary-text text-xs pointer-events-none">metres</span>
              </div>
              <span class="text-[11px] text-secondary-text leading-relaxed">
                Punches with device GPS accuracy worse than {{ form.max_gps_accuracy_meters || 50 }}m will prompt re-calibration.
              </span>
            </div>

            <!-- Accuracy Mode Select -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
                Validation Rigor Mode
              </label>
              <BaseSelect
                v-model="form.geofence_accuracy_mode"
                :options="accuracyModeOptions"
                custom-class="!py-2.5 text-sm"
              />
              <span class="text-[11px] text-secondary-text leading-relaxed">
                {{
                  form.geofence_accuracy_mode === "CONSERVATIVE"
                    ? "Conservative mode guarantees punches only within high confidence boundaries."
                    : "Distance-only mode verifies raw distance without factoring GPS radius uncertainty."
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Verification Rules & Shift Durations (5 cols) -->
      <div class="xl:col-span-5 flex flex-col gap-4">
        <!-- Card 1: Attendance Verification Toggles -->
        <div class="bg-card-background rounded-2xl p-5 sm:p-6  flex flex-col gap-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-surface-container text-primary-text flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div>
              <h2 class="text-sm font-semibold text-primary-text">Biometric &amp; Device Policies</h2>
              <p class="text-xs text-secondary-text">Employee validation conditions on mobile check-in</p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <!-- Toggle 1: Location Based Attendance -->
            <div class="flex items-start justify-between p-3.5 rounded-xl bg-surface-subtle hover:bg-surface-container transition-colors border border-primary-border/60">
              <div class="flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg bg-card-background flex items-center justify-center text-primary mt-0.5 shadow-2xs border border-primary-border/50">
                  <span class="material-symbols-outlined text-[17px]">distance</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-primary-text">Enable location-based attendance</span>
                  <span class="text-[11px] text-secondary-text">Check punch coordinates against office geofence.</span>
                </div>
              </div>
              <BaseSwitch v-model="form.location_attendance_enabled" class="ml-3 mt-1 shrink-0" />
            </div>

            <!-- Toggle 2: Selfie Requirement -->
            <div class="flex items-start justify-between p-3.5 rounded-xl bg-surface-subtle hover:bg-surface-container transition-colors border border-primary-border/60">
              <div class="flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg bg-card-background flex items-center justify-center text-primary mt-0.5 shadow-2xs border border-primary-border/50">
                  <span class="material-symbols-outlined text-[17px]">face</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-primary-text">Require selfie photo capture</span>
                  <span class="text-[11px] text-secondary-text">Capture real-time portrait to deter buddy punching.</span>
                </div>
              </div>
              <BaseSwitch v-model="form.require_selfie" class="ml-3 mt-1 shrink-0" />
            </div>

            <!-- Toggle 3: Punch-out verification -->
            <div class="flex items-start justify-between p-3.5 rounded-xl bg-surface-subtle hover:bg-surface-container transition-colors border border-primary-border/60">
              <div class="flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg bg-card-background flex items-center justify-center text-primary mt-0.5 shadow-2xs border border-primary-border/50">
                  <span class="material-symbols-outlined text-[17px]">logout</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs font-semibold text-primary-text">Enforce geofence on punch-out</span>
                  <span class="text-[11px] text-secondary-text">Require active proximity when closing daily shift.</span>
                </div>
              </div>
              <BaseSwitch v-model="form.require_geofence_on_checkout" class="ml-3 mt-1 shrink-0" />
            </div>
          </div>
        </div>

        <!-- Card 2: Shift Durations & Work Hours -->
        <div class="bg-card-background rounded-2xl p-5 sm:p-6  flex flex-col gap-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-surface-container text-primary-text flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">schedule</span>
            </div>
            <div>
              <h2 class="text-sm font-semibold text-primary-text">Shift &amp; Working Hours</h2>
              <p class="text-xs text-secondary-text">Standard threshold durations for payroll calculations</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Full day minutes -->
            <div class="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-subtle border border-primary-border/60">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">Full Day</label>
                <span class="px-2 py-0.5 bg-card-background border border-primary-border text-primary font-semibold text-[11px] rounded-md">
                  {{ formatMinutes(form.required_full_day_minutes) }}
                </span>
              </div>
              <div class="relative flex items-center mt-1">
                <input
                  v-model.number="form.required_full_day_minutes"
                  type="number"
                  min="1"
                  class="w-full bg-card-background px-3 py-2 rounded-lg text-primary-text text-sm font-semibold border border-primary-border focus:outline-none focus:border-primary pr-14"
                />
                <span class="absolute right-3 text-secondary-text text-xs pointer-events-none">mins</span>
              </div>
              <span class="text-[11px] text-secondary-text">Qualifies for 1.0 day credit</span>
            </div>

            <!-- Half day minutes -->
            <div class="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-subtle border border-primary-border/60">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">Half Day</label>
                <span class="px-2 py-0.5 bg-card-background border border-primary-border text-primary font-semibold text-[11px] rounded-md">
                  {{ formatMinutes(form.required_half_day_minutes) }}
                </span>
              </div>
              <div class="relative flex items-center mt-1">
                <input
                  v-model.number="form.required_half_day_minutes"
                  type="number"
                  min="1"
                  class="w-full bg-card-background px-3 py-2 rounded-lg text-primary-text text-sm font-semibold border border-primary-border focus:outline-none focus:border-primary pr-14"
                />
                <span class="absolute right-3 text-secondary-text text-xs pointer-events-none">mins</span>
              </div>
              <span class="text-[11px] text-secondary-text">Qualifies for 0.5 day credit</span>
            </div>
          </div>

          <!-- Timezone Display (Hardcoded to Asia/Kolkata) -->
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">
                Campus Operational Timezone
              </label>
              <span class="text-[11px] text-text-muted">Fixed</span>
            </div>
            <div class="relative flex items-center">
              <input
                type="text"
                readonly
                disabled
                value="Asia/Kolkata (IST · UTC+05:30) - Standard"
                class="input-field px-3.5 py-2.5 text-sm pr-9 bg-surface-subtle/80 cursor-not-allowed text-primary-text font-medium select-none"
              />
              <span class="material-symbols-outlined text-secondary-text text-[18px] absolute right-2.5 pointer-events-none">
                schedule
              </span>
            </div>
            <span class="text-[11px] text-secondary-text">
              Fixed to Indian Standard Time (IST) for all organizational campus check-ins.
            </span>
          </div>
        </div>

        <!-- Card 3: Audit Trail & Policy Record -->
        <div class="bg-surface-container/60 border border-primary-border rounded-2xl p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span class="text-xs font-semibold text-primary-text">Policy Audit Record</span>
            </div>
            <span class="text-[11px] font-mono font-medium text-secondary-text">Version 2.4.1</span>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="flex flex-col bg-card-background/90 border border-primary-border/60 p-2.5 rounded-xl">
              <span class="text-[11px] text-secondary-text">Created Timestamp</span>
              <span class="text-xs font-medium text-primary-text mt-0.5">
                {{ formatDateTime(hrms.attendanceSettings?.created_at) }}
              </span>
            </div>
            <div class="flex flex-col bg-card-background/90 border border-primary-border/60 p-2.5 rounded-xl">
              <span class="text-[11px] text-secondary-text">Last Revision</span>
              <span class="text-xs font-medium text-primary-text mt-0.5">
                {{ formatDateTime(hrms.attendanceSettings?.updated_at) }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1 text-secondary-text text-xs flex-wrap gap-2">
            <span>Status: <strong class="text-primary-text font-medium">Synced &amp; Enforced</strong></span>
            <router-link to="/hrms/attendance" class="text-primary hover:underline flex items-center gap-1 font-medium text-[11px]">
              <span>View Attendance Log</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useHrmsStore } from "@/stores/hrms/hrms";
import BaseSwitch from "@/components/common/BaseSwitch.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";

const accuracyModeOptions = [
  { label: "Conservative (distance + accuracy ≤ radius)", value: "CONSERVATIVE" },
  { label: "Distance only (distance ≤ radius)", value: "DISTANCE_ONLY" },
];

const hrms = useHrmsStore();
const mapEl = ref(null);
const isLocating = ref(false);
const radiusPresets = [25, 100, 250, 500];

const form = reactive({
  office_name: "",
  office_latitude: null,
  office_longitude: null,
  allowed_radius_meters: 100,
  max_gps_accuracy_meters: 50,
  geofence_accuracy_mode: "CONSERVATIVE",
  require_selfie: true,
  require_geofence_on_checkout: true,
  location_attendance_enabled: false,
  required_full_day_minutes: 480,
  required_half_day_minutes: 240,
  timezone: "Asia/Kolkata",
});

// Snapshot of original saved settings for dirty tracking & discard
const originalForm = ref(null);

const isDirty = computed(() => {
  if (!originalForm.value) return false;
  const keys = Object.keys(form);
  return keys.some((k) => form[k] !== originalForm.value[k]);
});

const effectiveDiameter = computed(() => {
  const r = Number(form.allowed_radius_meters) || 0;
  return r * 2;
});

const formatMinutes = (mins) => {
  if (!mins || isNaN(mins)) return "0 hrs 00 m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} hrs ${String(m).padStart(2, "0")} m`;
};

const formatDateTime = (isoStr) => {
  if (!isoStr) return "Oct 16, 2026 · 23:20";
  try {
    const d = new Date(isoStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
};

const lastSyncedText = computed(() => {
  const ts = hrms.attendanceSettings?.updated_at || hrms.attendanceSettings?.created_at;
  return formatDateTime(ts);
});

let map = null;
let marker = null;
let circle = null;

const defaultCenter = [20.5937, 78.9629];

const setMarker = (lat, lng) => {
  if (!map) return;
  form.office_latitude = Number(lat.toFixed(7));
  form.office_longitude = Number(lng.toFixed(7));
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    marker = L.circleMarker([lat, lng], {
      radius: 8,
      color: "#1d4ed8",
      fillColor: "#3b82f6",
      fillOpacity: 0.9,
    }).addTo(map);
  }
  redrawCircle();
  map.setView([lat, lng], Math.max(map.getZoom(), 16));
};

const redrawCircle = () => {
  if (!map || form.office_latitude == null || form.office_longitude == null) return;
  const center = [form.office_latitude, form.office_longitude];
  const radius = Number(form.allowed_radius_meters) || 100;
  if (circle) {
    circle.setLatLng(center);
    circle.setRadius(radius);
  } else {
    circle = L.circle(center, {
      radius: radius,
      color: "#2563eb",
      fillOpacity: 0.15,
    }).addTo(map);
  }
};

const setRadiusPreset = (preset) => {
  form.allowed_radius_meters = preset;
  redrawCircle();
};

const syncMapFromForm = () => {
  if (form.office_latitude == null || form.office_longitude == null) return;
  setMarker(Number(form.office_latitude), Number(form.office_longitude));
};

const useMyLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setMarker(pos.coords.latitude, pos.coords.longitude);
      isLocating.value = false;
    },
    (err) => {
      isLocating.value = false;
      alert("Unable to retrieve GPS location: " + (err.message || "Permission denied"));
    },
    { enableHighAccuracy: true, timeout: 15000 },
  );
};

const discardChanges = () => {
  if (!originalForm.value) return;
  Object.assign(form, JSON.parse(JSON.stringify(originalForm.value)));
  if (form.office_latitude != null && form.office_longitude != null) {
    setMarker(Number(form.office_latitude), Number(form.office_longitude));
  } else {
    redrawCircle();
  }
};

const initMap = async () => {
  await nextTick();
  if (!mapEl.value || map) return;
  const lat = form.office_latitude ?? defaultCenter[0];
  const lng = form.office_longitude ?? defaultCenter[1];
  map = L.map(mapEl.value).setView([lat, lng], form.office_latitude != null ? 16 : 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
    maxZoom: 19,
  }).addTo(map);
  map.on("click", (event) => setMarker(event.latlng.lat, event.latlng.lng));
  if (form.office_latitude != null && form.office_longitude != null) {
    setMarker(Number(form.office_latitude), Number(form.office_longitude));
  }
  setTimeout(() => {
    map?.invalidateSize();
  }, 250);
};

const save = async () => {
  if (form.location_attendance_enabled && (form.office_latitude == null || form.office_longitude == null)) {
    alert("Please set office latitude and longitude on the map before enabling location-based attendance.");
    return;
  }
  if (form.required_half_day_minutes >= form.required_full_day_minutes) {
    alert("Half-day minutes must be strictly less than full-day minutes.");
    return;
  }
  const res = await hrms.updateAttendanceSettings({ ...form });
  if (res) {
    originalForm.value = JSON.parse(JSON.stringify(form));
  }
};

onMounted(async () => {
  await hrms.fetchAttendanceSettings();
  const settings = hrms.attendanceSettings;
  if (settings) {
    Object.assign(form, {
      office_name: settings.office_name || "",
      office_latitude: settings.office_latitude != null ? Number(settings.office_latitude) : null,
      office_longitude: settings.office_longitude != null ? Number(settings.office_longitude) : null,
      allowed_radius_meters: settings.allowed_radius_meters ?? 100,
      max_gps_accuracy_meters: settings.max_gps_accuracy_meters ?? 50,
      geofence_accuracy_mode: settings.geofence_accuracy_mode || "CONSERVATIVE",
      require_selfie: !!settings.require_selfie,
      require_geofence_on_checkout: !!settings.require_geofence_on_checkout,
      location_attendance_enabled: !!settings.location_attendance_enabled,
      required_full_day_minutes: settings.required_full_day_minutes ?? 480,
      required_half_day_minutes: settings.required_half_day_minutes ?? 240,
      timezone: "Asia/Kolkata",
    });
  }
  originalForm.value = JSON.parse(JSON.stringify(form));
  await initMap();
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>
