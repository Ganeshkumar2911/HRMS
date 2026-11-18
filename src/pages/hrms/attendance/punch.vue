<template>
  <div class="space-y-6 pb-12">
    <PageTopBar
      title="Punch Station"
      description="One-step check-in and check-out with automatic location verification."
      show-back-button
    >
      <template #actions>
        <span
          class="px-2.5 py-1 rounded-full text-xs font-semibold border"
          :class="statusBadgeClass"
        >
          {{ statusLabel }}
        </span>
        <button
          type="button"
          class="btn-secondary text-xs px-3 py-1.5 rounded-lg"
          @click="refreshStatus"
        >
          Refresh
        </button>
      </template>
    </PageTopBar>

    <!-- Disabled / Unconfigured State -->
    <div
      v-if="!enabled"
      class="p-8 rounded-2xl border border-primary-border/60 bg-card-background text-center space-y-3 max-w-lg mx-auto"
    >
      <h3 class="text-base font-semibold text-primary-text">Location Attendance Not Enabled</h3>
      <p class="text-xs text-secondary-text leading-relaxed">
        Office geofence attendance is currently deactivated or office coordinates have not been configured yet.
      </p>
      <router-link
        v-if="canManageSettings"
        to="/hrms/attendance/settings"
        class="inline-flex items-center gap-2 mt-2 btn-primary text-xs px-4 py-2 rounded-lg"
      >
        Configure Geofence Settings
      </router-link>
    </div>

    <!-- Main 1-Step Punch Station (Mobile & Desktop) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left: Clock, Live Camera & 1-Step Punch -->
      <div class="lg:col-span-7 bg-card-background border border-primary-border/60 rounded-2xl p-5 sm:p-6 space-y-6">
        <!-- Digital Clock -->
        <div class="text-center space-y-1 py-1">
          <p class="text-xs font-medium text-secondary-text uppercase tracking-wider">
            {{ currentDateStr }}
          </p>
          <div class="text-4xl sm:text-5xl font-bold tracking-tight text-primary-text font-mono tabular-nums">
            {{ currentTimeStr }}
          </div>
          <p class="text-xs text-secondary-text pt-1">
            Shift Target: {{ shiftTargetHours }}h 00m · Half Day: {{ shiftHalfHours }}h 00m
          </p>
        </div>

        <!-- Live Camera Preview (No File Upload) -->
        <div
          v-if="settings?.require_selfie && !isShiftCompleted"
          class="border border-primary-border/60 rounded-xl p-3 sm:p-4 bg-surface-subtle/50 space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-primary-text">Live Selfie Verification</span>
            <span v-if="cameraReady" class="text-[11px] text-emerald-600 font-medium">Camera Ready</span>
            <span v-else-if="cameraError" class="text-[11px] text-primary-red font-medium">Camera Blocked</span>
          </div>

          <div class="relative aspect-video sm:aspect-[16/9] max-h-64 w-full rounded-lg overflow-hidden bg-black/90 flex items-center justify-center">
            <video
              ref="videoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover scale-x-[-1]"
            ></video>
            <p v-if="cameraError" class="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-white/80">
              {{ cameraError }}
            </p>
          </div>
          <canvas ref="canvasRef" class="hidden"></canvas>
        </div>

        <!-- Single-Step Punch Button -->
        <div class="flex flex-col items-center gap-3">
          <button
            v-if="!isShiftCompleted"
            type="button"
            :disabled="submitting || (settings?.require_selfie && !cameraReady)"
            @click="handleOneStepPunch"
            class="w-full sm:w-auto min-w-[240px] px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="openCheckIn ? 'bg-primary-red text-white hover:opacity-90' : 'bg-primary text-btn-text-primary hover:bg-primary-hover'"
          >
            <span v-if="submitting">Processing…</span>
            <span v-else-if="openCheckIn">Punch Out</span>
            <span v-else>Punch In</span>
          </button>

          <div v-else class="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
            Today's shift is completed.
          </div>

          <p v-if="punchError" class="text-xs text-primary-red text-center">{{ punchError }}</p>
        </div>
      </div>

      <!-- Right: Today's Attendance Summary -->
      <div class="lg:col-span-5 bg-card-background border border-primary-border/60 rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 class="text-sm font-semibold text-primary-text">Today's Summary</h2>

        <div class="grid grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div class="p-3.5 rounded-xl bg-surface-subtle/60 border border-primary-border/40">
            <p class="text-secondary-text mb-1">Check In</p>
            <p class="font-semibold text-primary-text text-sm">{{ formatTime(todayRecord?.check_in_at) }}</p>
          </div>
          <div class="p-3.5 rounded-xl bg-surface-subtle/60 border border-primary-border/40">
            <p class="text-secondary-text mb-1">Check Out</p>
            <p class="font-semibold text-primary-text text-sm">{{ formatTime(todayRecord?.check_out_at) }}</p>
          </div>
          <div class="p-3.5 rounded-xl bg-surface-subtle/60 border border-primary-border/40">
            <p class="text-secondary-text mb-1">Worked</p>
            <p class="font-semibold text-primary-text text-sm">
              {{ todayRecord?.worked_minutes != null ? `${todayRecord.worked_minutes} min` : "—" }}
            </p>
          </div>
          <div class="p-3.5 rounded-xl bg-surface-subtle/60 border border-primary-border/40">
            <p class="text-secondary-text mb-1">GPS Status</p>
            <p class="font-semibold text-primary-text text-sm">
              {{ coords ? `±${Math.round(coords.accuracy)}m` : "Auto on punch" }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const hrms = useHrmsStore();
const permissions = usePermissionsStore();

const submitting = ref(false);
const coords = ref(null);
const punchError = ref("");
const now = ref(new Date());
let clockTimer = null;

const videoRef = ref(null);
const canvasRef = ref(null);
const cameraReady = ref(false);
const cameraError = ref("");
let mediaStream = null;

const settings = computed(() => hrms.attendanceSettings);
const enabled = computed(() => settings.value?.enabled !== false);
const canManageSettings = computed(() => permissions.can("attendance.settings.manage"));
const todayRecord = computed(() => hrms.myAttendance?.attendance || hrms.myAttendance || null);
const openCheckIn = computed(() => Boolean(todayRecord.value?.check_in_at && !todayRecord.value?.check_out_at));
const isShiftCompleted = computed(() => Boolean(todayRecord.value?.check_in_at && todayRecord.value?.check_out_at));

const shiftTargetMinutes = computed(() => settings.value?.full_day_minutes || 480);
const shiftTargetHours = computed(() => Math.floor(shiftTargetMinutes.value / 60));
const shiftHalfHours = computed(() => Math.floor((settings.value?.half_day_minutes || 240) / 60));

const currentDateStr = computed(() =>
  now.value.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })
);
const currentTimeStr = computed(() =>
  now.value.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
);

const statusLabel = computed(() => {
  if (isShiftCompleted.value) return "Completed";
  if (openCheckIn.value) return "Checked In";
  return "Not Punched";
});

const statusBadgeClass = computed(() => {
  if (isShiftCompleted.value) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (openCheckIn.value) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  return "bg-surface-subtle text-secondary-text border-primary-border/60";
});

const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const startCamera = async () => {
  if (!settings.value?.require_selfie || isShiftCompleted.value || mediaStream) return;
  cameraError.value = "";
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
    }
    cameraReady.value = true;
  } catch (err) {
    cameraError.value = err?.message || "Camera access is required for selfie verification.";
    cameraReady.value = false;
  }
};

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  cameraReady.value = false;
};

const captureSelfieBlob = () =>
  new Promise((resolve) => {
    const video = videoRef.value;
    const canvas = canvasRef.value;
    if (!video || !canvas || !cameraReady.value) {
      resolve(null);
      return;
    }
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
  });

const getGpsPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        coords.value = next;
        resolve(next);
      },
      (err) => reject(new Error(err.message || "Unable to retrieve your location.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });

const handleOneStepPunch = async () => {
  punchError.value = "";
  submitting.value = true;
  try {
    const [pos, selfieBlob] = await Promise.all([
      getGpsPosition(),
      settings.value?.require_selfie ? captureSelfieBlob() : Promise.resolve(null),
    ]);

    const fd = new FormData();
    fd.append("latitude", String(pos.latitude));
    fd.append("longitude", String(pos.longitude));
    fd.append("accuracy_meters", String(Math.round(pos.accuracy || 0)));
    if (selfieBlob) {
      fd.append("selfie", selfieBlob, "selfie.jpg");
    }

    if (openCheckIn.value) {
      await hrms.checkOut(fd);
    } else {
      await hrms.checkIn(fd);
    }
    await hrms.fetchMyAttendance();
  } catch (err) {
    punchError.value = err?.message || "Failed to punch.";
  } finally {
    submitting.value = false;
  }
};

const refreshStatus = async () => {
  await Promise.all([hrms.fetchMyAttendance(), hrms.fetchAttendanceSettings()]);
  startCamera();
};

watch([() => settings.value?.require_selfie, isShiftCompleted], () => {
  if (settings.value?.require_selfie && !isShiftCompleted.value) {
    startCamera();
  } else {
    stopCamera();
  }
});

onMounted(async () => {
  clockTimer = setInterval(() => {
    now.value = new Date();
  }, 1000);
  await refreshStatus();
});

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer);
  stopCamera();
});
</script>
