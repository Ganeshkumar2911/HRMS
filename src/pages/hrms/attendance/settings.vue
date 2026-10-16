<template>
  <div class="space-y-4 max-w-3xl">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="title-text text-sm text-primary-text">Attendance settings</h2>
        <p class="sub-text text-secondary-text text-xs mt-1">
          Configure office geofence, GPS accuracy policy, selfie rules, and full-day hours.
          Conservative mode rejects punches when distance + GPS accuracy exceeds the radius.
        </p>
      </div>
      <router-link to="/hrms/attendance" class="btn-secondary text-xs px-3 py-1.5">Back</router-link>
    </div>

    <form class="space-y-4 border border-primary-border rounded-xl p-4 bg-card-background" @submit.prevent="save">
      <label class="block space-y-1">
        <span class="text-xs font-medium text-secondary-text">Office name</span>
        <input v-model="form.office_name" class="input-field px-3 py-2 text-sm w-full" placeholder="Head office" />
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="block space-y-1">
          <span class="text-xs font-medium text-secondary-text">Latitude</span>
          <input v-model.number="form.office_latitude" type="number" step="any" class="input-field px-3 py-2 text-sm w-full" @change="syncMapFromForm" />
        </label>
        <label class="block space-y-1">
          <span class="text-xs font-medium text-secondary-text">Longitude</span>
          <input v-model.number="form.office_longitude" type="number" step="any" class="input-field px-3 py-2 text-sm w-full" @change="syncMapFromForm" />
        </label>
      </div>

      <div class="space-y-2">
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <span class="text-xs font-medium text-secondary-text">Map — click to set office location</span>
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="useMyLocation">Use my location</button>
        </div>
        <div ref="mapEl" class="h-64 w-full rounded-lg border border-primary-border z-0"></div>
      </div>

      <div class="space-y-2">
        <span class="text-xs font-medium text-secondary-text">Allowed radius</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="r in radiusPresets"
            :key="r"
            type="button"
            class="text-xs px-3 py-1.5 rounded-lg border"
            :class="form.allowed_radius_meters === r ? 'border-primary bg-primary/10 text-primary' : 'border-primary-border'"
            @click="form.allowed_radius_meters = r; redrawCircle()"
          >
            {{ r }} m
          </button>
        </div>
        <input v-model.number="form.allowed_radius_meters" type="number" min="25" max="2000" class="input-field px-3 py-2 text-sm w-40" @change="redrawCircle" />
      </div>

      <label class="block space-y-1">
        <span class="text-xs font-medium text-secondary-text">Maximum acceptable GPS accuracy (metres)</span>
        <input v-model.number="form.max_gps_accuracy_meters" type="number" min="5" max="500" class="input-field px-3 py-2 text-sm w-40" />
      </label>

      <label class="block space-y-1">
        <span class="text-xs font-medium text-secondary-text">Geofence accuracy mode</span>
        <select v-model="form.geofence_accuracy_mode" class="input-field px-3 py-2 text-sm w-full sm:w-72">
          <option value="CONSERVATIVE">Conservative (distance + accuracy ≤ radius)</option>
          <option value="DISTANCE_ONLY">Distance only (distance ≤ radius)</option>
        </select>
        <p class="text-[11px] text-secondary-text">
          Conservative mode can reject legitimate punches near the boundary. Employees should retry; HR can mark or correct attendance as an exception.
        </p>
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="block space-y-1">
          <span class="text-xs font-medium text-secondary-text">Full day minutes</span>
          <input v-model.number="form.required_full_day_minutes" type="number" min="1" class="input-field px-3 py-2 text-sm w-full" />
        </label>
        <label class="block space-y-1">
          <span class="text-xs font-medium text-secondary-text">Half day minutes</span>
          <input v-model.number="form.required_half_day_minutes" type="number" min="1" class="input-field px-3 py-2 text-sm w-full" />
        </label>
      </div>

      <label class="block space-y-1">
        <span class="text-xs font-medium text-secondary-text">Timezone</span>
        <input v-model="form.timezone" class="input-field px-3 py-2 text-sm w-full sm:w-72" placeholder="Asia/Kolkata" />
      </label>

      <label class="flex items-center gap-2 text-sm text-primary-text">
        <input v-model="form.require_selfie" type="checkbox" class="rounded" />
        Require a selfie during each punch
      </label>
      <label class="flex items-center gap-2 text-sm text-primary-text">
        <input v-model="form.require_geofence_on_checkout" type="checkbox" class="rounded" />
        Require the employee to be inside the radius for punch-out too
      </label>
      <label class="flex items-center gap-2 text-sm text-primary-text">
        <input v-model="form.location_attendance_enabled" type="checkbox" class="rounded" />
        Enable location-based attendance
      </label>

      <div class="flex justify-end gap-2 pt-2">
        <button type="submit" class="btn-primary text-xs px-4 py-2" :disabled="hrms.actionLoading">Save settings</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useHrmsStore } from "@/stores/hrms/hrms";

const hrms = useHrmsStore();
const mapEl = ref(null);
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
  if (circle) {
    circle.setLatLng(center);
    circle.setRadius(form.allowed_radius_meters || 100);
  } else {
    circle = L.circle(center, {
      radius: form.allowed_radius_meters || 100,
      color: "#2563eb",
      fillOpacity: 0.12,
    }).addTo(map);
  }
};

const syncMapFromForm = () => {
  if (form.office_latitude == null || form.office_longitude == null) return;
  setMarker(Number(form.office_latitude), Number(form.office_longitude));
};

const useMyLocation = () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => setMarker(pos.coords.latitude, pos.coords.longitude),
    () => {},
    { enableHighAccuracy: true, timeout: 15000 },
  );
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
};

const save = async () => {
  await hrms.updateAttendanceSettings({ ...form });
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
      timezone: settings.timezone || "Asia/Kolkata",
    });
  }
  await initMap();
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>
