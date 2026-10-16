<template>
  <div class="space-y-4 max-w-lg">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="title-text text-sm text-primary-text">Punch in / out</h2>
        <p class="sub-text text-secondary-text text-xs mt-1">
          Location is validated on the server. Browser GPS is not tamper-proof.
          If you are near the boundary and keep getting rejected, retry outdoors or ask HR to correct.
        </p>
      </div>
      <router-link to="/hrms/attendance" class="btn-secondary text-xs px-3 py-1.5">Calendar</router-link>
    </div>

    <div v-if="!enabled" class="p-4 rounded-xl border border-primary-border text-sm text-secondary-text">
      Location-based attendance is not enabled yet. Ask HR to configure the office geofence.
    </div>

    <div v-else class="space-y-4 border border-primary-border rounded-xl p-4 bg-card-background">
      <div class="text-xs text-secondary-text space-y-1">
        <p>Office: <span class="text-primary-text font-medium">{{ settings?.office_name || "—" }}</span></p>
        <p>Radius: {{ settings?.allowed_radius_meters }} m · Mode: {{ settings?.geofence_accuracy_mode }}</p>
        <p v-if="coords">
          Your position: {{ coords.latitude.toFixed(5) }}, {{ coords.longitude.toFixed(5) }}
          (±{{ Math.round(coords.accuracy) }} m)
          <span v-if="distanceMeters != null"> · ~{{ Math.round(distanceMeters) }} m from office</span>
        </p>
        <p v-if="locationError" class="text-primary-red">{{ locationError }}</p>
      </div>

      <div v-if="today" class="text-sm text-primary-text space-y-1">
        <p>Today status: <strong>{{ today.status }}</strong></p>
        <p v-if="today.check_in_at">Check-in: {{ formatTime(today.check_in_at) }}</p>
        <p v-if="today.check_out_at">Check-out: {{ formatTime(today.check_out_at) }}</p>
        <p v-if="today.worked_minutes != null">Worked: {{ today.worked_minutes }} minutes</p>
      </div>

      <div v-if="settings?.require_selfie" class="space-y-2">
        <span class="text-xs font-medium text-secondary-text">Selfie</span>
        <video ref="videoEl" class="w-full max-h-56 rounded-lg bg-black object-cover" playsinline autoplay muted />
        <canvas ref="canvasEl" class="hidden" />
        <div class="flex gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="startCamera">Open camera</button>
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="captureSelfie">Capture</button>
        </div>
        <img v-if="selfiePreview" :src="selfiePreview" alt="Selfie preview" class="w-32 h-32 object-cover rounded-lg border border-primary-border" />
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="btn-primary text-xs px-4 py-2"
          :disabled="submitting || openCheckIn || !coords"
          @click="submitPunch('in')"
        >
          Punch in
        </button>
        <button
          type="button"
          class="btn-secondary text-xs px-4 py-2"
          :disabled="submitting || !openCheckIn || !coords"
          @click="submitPunch('out')"
        >
          Punch out
        </button>
        <button type="button" class="btn-secondary text-xs px-3 py-1.5" :disabled="locating" @click="refreshLocation">
          {{ locating ? "Locating…" : "Refresh location" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useHrmsStore } from "@/stores/hrms/hrms";

const hrms = useHrmsStore();
const coords = ref(null);
const locationError = ref("");
const locating = ref(false);
const submitting = ref(false);
const selfieBlob = ref(null);
const selfiePreview = ref("");
const videoEl = ref(null);
const canvasEl = ref(null);
let mediaStream = null;

const settings = computed(() => hrms.myAttendance?.settings || hrms.attendanceSettings);
const enabled = computed(() => !!settings.value?.location_attendance_enabled);
const today = computed(() => hrms.myAttendance?.today || null);
const openCheckIn = computed(() => !!hrms.myAttendance?.open_check_in);

const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const r = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
};

const distanceMeters = computed(() => {
  if (!coords.value || settings.value?.office_latitude == null || settings.value?.office_longitude == null) {
    return null;
  }
  return haversineMeters(
    Number(settings.value.office_latitude),
    Number(settings.value.office_longitude),
    coords.value.latitude,
    coords.value.longitude,
  );
});

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const refreshLocation = () => {
  locationError.value = "";
  locating.value = true;
  if (!navigator.geolocation) {
    locationError.value = "Geolocation is not supported in this browser.";
    locating.value = false;
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      coords.value = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
      locating.value = false;
    },
    (err) => {
      locationError.value =
        err.code === 1
          ? "Location permission denied. Enable location access for this site and retry."
          : "Could not get your location. Move outdoors and retry.";
      locating.value = false;
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
  );
};

const startCamera = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream;
    }
  } catch {
    locationError.value = "Camera permission is required for the selfie.";
  }
};

const captureSelfie = () => {
  const video = videoEl.value;
  const canvas = canvasEl.value;
  if (!video || !canvas || !video.videoWidth) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      selfieBlob.value = blob;
      selfiePreview.value = URL.createObjectURL(blob);
    },
    "image/jpeg",
    0.9,
  );
};

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
};

const submitPunch = async (kind) => {
  if (!coords.value || submitting.value) return;
  if (settings.value?.require_selfie && !selfieBlob.value) {
    locationError.value = "Capture a selfie before punching.";
    return;
  }
  submitting.value = true;
  const formData = new FormData();
  formData.append("latitude", String(coords.value.latitude));
  formData.append("longitude", String(coords.value.longitude));
  formData.append("accuracy_meters", String(coords.value.accuracy));
  if (selfieBlob.value) {
    formData.append("selfie", selfieBlob.value, "selfie.jpg");
  }
  try {
    await hrms.punchAttendance(kind, formData);
    selfieBlob.value = null;
    selfiePreview.value = "";
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await hrms.fetchMyAttendance();
  refreshLocation();
});

onBeforeUnmount(stopCamera);
</script>
