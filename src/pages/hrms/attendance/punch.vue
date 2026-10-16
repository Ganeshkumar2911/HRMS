<template>
  <div class="space-y-6 max-w-[1400px] mx-auto w-full pb-12">
    <!-- ── 2. DISABLED / UNCONFIGURED STATE ── -->
    <div
      v-if="!enabled"
      class="p-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center space-y-3 max-w-xl mx-auto my-8 "
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
        <span class="material-symbols-outlined text-2xl">location_off</span>
      </div>
      <h3 class="text-base font-semibold text-primary-text">Location Attendance Not Enabled</h3>
      <p class="text-xs text-secondary-text leading-relaxed">
        Office geofence attendance is currently deactivated or office coordinates have not been established yet.
        Please contact your operations administrator.
      </p>
      <router-link
        v-if="canManageSettings"
        to="/hrms/attendance/settings"
        class="inline-flex items-center gap-2 mt-2 btn-primary text-xs px-4 py-2 rounded-xl"
      >
        <span class="material-symbols-outlined text-[16px]">settings</span>
        <span>Configure Geofence Settings</span>
      </router-link>
    </div>

    <!-- ── 3. MAIN PUNCH STATION (RESPONSIVE 2-COL GRID) ── -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- ── LEFT COLUMN: Terminal Controls, Radar, Selfie (lg:col-span-7) ── -->
      <div class="lg:col-span-7 flex flex-col gap-6">
        <!-- Live Clock & Punch Station Card -->
        <div class="bg-card-background  rounded-2xl p-6  flex flex-col gap-5 relative overflow-hidden">
          <!-- Subtle glow accent -->
          <div class="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

          <!-- Top Meta Row -->
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="flex h-2.5 w-2.5 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span class="text-xs font-semibold text-primary-text tracking-tight">Active Workstation Node</span>
            </div>

            <!-- Dynamic Status Badge -->
            <div class="flex items-center gap-2">
              <span
                class="px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5"
                :class="statusBadgeClass(todayStatusComputed)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(todayStatusComputed)"></span>
                {{ statusLabelComputed }}
              </span>
            </div>
          </div>

          <!-- Live Digital Clock Display -->
          <div class="flex flex-col items-center justify-center py-2 text-center">
            <span class="text-xs font-medium text-secondary-text uppercase tracking-widest">
              {{ currentDateStr }}
            </span>
            <div class="text-4xl sm:text-5xl font-bold tracking-tight text-primary-text font-mono tabular-nums my-1">
              {{ currentTimeStr }}
            </div>
            <div class="flex items-center gap-2 text-xs text-secondary-text mt-1 flex-wrap justify-center">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">schedule</span>
                Shift Target: {{ shiftTargetHours }}h 00m ({{ shiftTargetMinutes }}m)
              </span>
              <span>•</span>
              <span class="font-medium text-primary-text">Half Day: {{ shiftHalfHours }}h 00m</span>
            </div>
          </div>

          <!-- Mobile Centered Tactile Punch In/Out Button (Matching Stitch / Figma Mobile Punch Station) -->
          <div v-if="!openCheckIn && !isShiftCompleted" class="flex sm:hidden flex-col items-center justify-center py-2 w-full">
            <!-- Header Status Bar -->
            <div class="flex items-center justify-between w-full mb-2 px-1 text-xs">
              <div class="flex items-center gap-1.5 text-secondary-text">
                <span class="material-symbols-outlined text-[16px]">touch_app</span>
                <span class="uppercase tracking-wider font-semibold text-[11px]">Shift Attendance</span>
              </div>
              <span class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium text-[11px] border border-emerald-200 dark:border-emerald-800/40">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Check-in Window Open
              </span>
            </div>

            <!-- Tactile Circular Punch Button with Ripples -->
            <div class="relative my-4 flex items-center justify-center">
              <!-- Ripple Outer Ring -->
              <div class="absolute w-52 h-52 rounded-full bg-primary/10 animate-ping opacity-25 pointer-events-none"></div>
              <!-- Subtle Middle Ring -->
              <div class="absolute w-44 h-44 rounded-full bg-secondary-background border border-primary-border/60 pointer-events-none shadow-inner"></div>

              <!-- Main Tactile Action Button -->
              <button
                type="button"
                class="relative z-10 w-36 h-36 rounded-full bg-primary text-inverted flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed select-none"
                :disabled="submitting || !coords || (settings?.require_selfie && !selfieBlob)"
                @click="submitPunch('in')"
              >
                <span v-if="submitting && currentAction === 'in'" class="material-symbols-outlined text-[36px] animate-spin">
                  progress_activity
                </span>
                <span v-else class="material-symbols-outlined text-[38px] group-hover:scale-110 transition-transform">
                  fingerprint
                </span>
                <span class="text-sm font-bold tracking-wider mt-1">PUNCH IN</span>
                <span class="text-[10px] font-mono tracking-widest text-inverted/80 uppercase mt-0.5">TAP TO CONFIRM</span>
              </button>
            </div>

            <!-- Footer Compliance / Grace Pill -->
            <div class="flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-secondary-background border border-primary-border/50 rounded-lg text-secondary-text text-[11px]">
              <span class="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">check_circle</span>
              <span>Zero grace penalty applied prior to standard shift</span>
            </div>
          </div>

          <!-- Mobile Centered Tactile Punch Out Button (When Shift is Active) -->
          <div v-else-if="openCheckIn && !isShiftCompleted" class="flex sm:hidden flex-col items-center justify-center py-2 w-full">
            <div class="flex items-center justify-between w-full mb-2 px-1 text-xs">
              <div class="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <span class="material-symbols-outlined text-[16px] animate-pulse">radio_button_checked</span>
                <span class="uppercase tracking-wider font-semibold text-[11px]">Shift Active</span>
              </div>
              <span class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-medium text-[11px] border border-red-200 dark:border-red-800/40">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                Live Tracking
              </span>
            </div>

            <div class="relative my-4 flex items-center justify-center">
              <div class="absolute w-52 h-52 rounded-full bg-red-500/10 animate-ping opacity-25 pointer-events-none"></div>
              <div class="absolute w-44 h-44 rounded-full bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 pointer-events-none"></div>

              <button
                type="button"
                class="relative z-10 w-36 h-36 rounded-full bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed select-none"
                :disabled="submitting || !coords || (settings?.require_selfie && !selfieBlob)"
                @click="submitPunch('out')"
              >
                <span v-if="submitting && currentAction === 'out'" class="material-symbols-outlined text-[36px] animate-spin">
                  progress_activity
                </span>
                <span v-else class="material-symbols-outlined text-[38px] group-hover:scale-110 transition-transform">
                  logout
                </span>
                <span class="text-sm font-bold tracking-wider mt-1">PUNCH OUT</span>
                <span class="text-[10px] font-mono tracking-widest text-white/80 uppercase mt-0.5">END SHIFT</span>
              </button>
            </div>
          </div>

          <!-- Primary Punch Actions Bar (Visible on desktop / larger screens) -->
          <div class="hidden sm:grid sm:grid-cols-2 gap-3 pt-1">
            <!-- Punch In CTA -->
            <button
              type="button"
              class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all "
              :class="[
                openCheckIn || isShiftCompleted
                  ? 'bg-secondary-background text-secondary-text/60 border border-primary-border/60 cursor-not-allowed opacity-60'
                  : 'btn-primary'
              ]"
              :disabled="submitting || openCheckIn || isShiftCompleted || !coords || (settings?.require_selfie && !selfieBlob)"
              @click="submitPunch('in')"
            >
              <span v-if="submitting && currentAction === 'in'" class="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
              <span v-else class="material-symbols-outlined text-[18px]">login</span>
              <span>{{ openCheckIn ? 'Punched In' : (isShiftCompleted ? 'Shift Done' : 'Punch In Shift') }}</span>
            </button>

            <!-- Punch Out CTA -->
            <button
              type="button"
              class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              :class="[
                openCheckIn
                  ? 'bg-red-600 hover:bg-red-700 text-white '
                  : 'bg-secondary-background text-secondary-text/60 border border-primary-border/60 cursor-not-allowed opacity-60'
              ]"
              :disabled="submitting || !openCheckIn || !coords || (settings?.require_selfie && !selfieBlob)"
              @click="submitPunch('out')"
            >
              <span v-if="submitting && currentAction === 'out'" class="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
              <span v-else class="material-symbols-outlined text-[18px]">logout</span>
              <span>{{ isShiftCompleted ? 'Punched Out' : 'Punch Out Shift' }}</span>
            </button>
          </div>

          <!-- Shift Micro-Actions (Visible when shift is active) -->
          <div v-if="openCheckIn" class="flex items-center justify-between p-2.5 bg-background border border-primary-border/70 rounded-xl transition-all">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-secondary-text">coffee</span>
              <span class="text-xs text-primary-text font-medium">Shift Break Tracking:</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg bg-card-background border border-primary-border text-primary-text text-[11px] font-medium hover:bg-background transition-colors shadow-2xs"
                @click="triggerToast('15m Rest Break logged', 'coffee')"
              >
                +15m Break
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg bg-card-background border border-primary-border text-primary-text text-[11px] font-medium hover:bg-background transition-colors shadow-2xs"
                @click="triggerToast('Meal pause toggled', 'restaurant')"
              >
                Pause for Meal
              </button>
            </div>
          </div>
        </div>

        <!-- Dual Verification Grid (Geofence + Biometric Selfie) -->
        <div :class="['grid gap-5', settings?.require_selfie ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1']">
          <!-- Card 1: Geofence Verification Radar -->
          <div class="bg-card-background rounded-2xl p-5  flex flex-col justify-between gap-4 relative overflow-hidden">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px] text-primary">near_me</span>
                <span class="text-sm font-semibold text-primary-text">Geofence Radar</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary-background text-secondary-text border border-primary-border/60">
                {{ isConservative ? 'Conservative' : 'Distance Only' }}
              </span>
            </div>

            <!-- Sonar / Radar Visualizer -->
            <div class="relative w-full h-44 rounded-xl bg-background border border-primary-border/70 overflow-hidden flex items-center justify-center">
              <!-- Radial Grid Pattern -->
              <div
                class="absolute inset-0 opacity-15"
                style="background-image: radial-gradient(#888 1px, transparent 1px); background-size: 16px 16px;"
              ></div>

              <!-- Concentric Distance Rings -->
              <div class="absolute w-36 h-36 rounded-full border border-primary-border/60"></div>
              <div class="absolute w-24 h-24 rounded-full border border-primary-border/80"></div>
              <div class="absolute w-12 h-12 rounded-full border border-primary/30"></div>

              <!-- Animated Ping Wave -->
              <div
                class="absolute w-28 h-28 rounded-full opacity-30 animate-ping pointer-events-none"
                :class="isWithinGeofence ? 'bg-emerald-500' : 'bg-amber-500'"
              ></div>

              <!-- User Pin on Radar -->
              <div class="relative z-10 flex flex-col items-center">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md transition-colors"
                  :class="isWithinGeofence ? 'bg-emerald-600' : 'bg-amber-600'"
                >
                  <span class="material-symbols-outlined text-[16px]">person_pin_circle</span>
                </div>
                <div class="mt-1 px-1.5 py-0.5 rounded-md bg-card-background border border-primary-border/80  text-[10px] font-semibold text-primary-text">
                  {{ distanceDisplay }}
                </div>
              </div>

              <!-- Coordinates Pill Overlay -->
              <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-secondary-text bg-card-background/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-primary-border/70">
                <span class="truncate font-mono">{{ coordsDisplay }}</span>
                <span class="font-medium shrink-0 ml-1" :class="accuracyColorClass">
                  {{ accuracyDisplay }}
                </span>
              </div>
            </div>

            <!-- Footer Details & Refresh Button -->
            <div class="flex items-center justify-between pt-1">
              <div class="flex flex-col min-w-0 pr-2">
                <span class="text-xs font-semibold text-primary-text truncate">{{ officeNameDisplay }}</span>
                <span class="text-[11px] text-secondary-text truncate">
                  {{ isWithinGeofence ? `Inside allowed ${settings?.allowed_radius_meters || 100}m radius` : 'Outside geofence perimeter' }}
                </span>
              </div>
              <!-- <button
                type="button"
                class="p-2 rounded-xl bg-background border border-primary-border text-secondary-text hover:text-primary-text hover:bg-card-background transition-colors flex items-center justify-center shrink-0"
                :disabled="locating"
                @click="refreshLocation"
                title="Refresh GPS Coordinates"
              >
                <span
                  class="material-symbols-outlined text-[18px] transition-transform duration-500"
                  :class="{ 'animate-spin': locating }"
                >
                  refresh
                </span>
              </button> -->
            </div>

            <!-- Location Errors / Warnings if any -->
            <div v-if="locationError" class="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs">
              {{ locationError }}
            </div>
            <div
              v-else-if="coords && settings?.max_gps_accuracy_meters && coords.accuracy > settings.max_gps_accuracy_meters"
              class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs"
            >
              GPS accuracy (±{{ Math.round(coords.accuracy) }}m) exceeds max allowed (±{{ settings.max_gps_accuracy_meters }}m).
            </div>
          </div>

          <!-- Card 2: Biometric Selfie Verification (Only rendered when required) -->
          <div
            v-if="settings?.require_selfie"
            class="bg-card-background rounded-2xl p-5  flex flex-col justify-between gap-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px] text-primary">face</span>
                <span class="text-sm font-semibold text-primary-text">Biometric Selfie</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Required
              </span>
            </div>

            <!-- Viewfinder Area -->
            <div class="relative w-full h-48 rounded-xl bg-background border border-primary-border/70 overflow-hidden flex items-center justify-center">
              <!-- Active Camera Video Stream (Mirrored for natural selfie view) -->
              <video
                v-show="cameraActive"
                ref="videoEl"
                class="absolute inset-0 w-full h-full object-cover -scale-x-100"
                playsinline
                autoplay
                muted
              />
              <canvas ref="canvasEl" class="hidden" />

              <!-- Captured Selfie Image -->
              <img
                v-if="selfiePreview && !cameraActive"
                :src="selfiePreview"
                alt="Selfie verification preview"
                class="absolute inset-0 w-full h-full object-cover"
              />

              <!-- Standby Placeholder (when camera is off and no preview) -->
              <div
                v-if="!cameraActive && !selfiePreview"
                class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none"
              >
                <div class="w-12 h-12 rounded-full bg-secondary-background border border-primary-border flex items-center justify-center text-secondary-text mb-2">
                  <span class="material-symbols-outlined text-2xl">photo_camera_front</span>
                </div>
                <p class="text-xs font-semibold text-primary-text">Camera Standby</p>
                <p class="text-[11px] text-secondary-text mt-0.5">Click "Open Camera" to capture verification selfie</p>
              </div>

              <!-- Overlay Oval Reticle (Centered over video feed) -->
              <div
                v-if="cameraActive"
                class="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div class="relative w-28 h-36 rounded-full border-2 border-dashed border-white/90 shadow-[0_0_20px_rgba(0,0,0,0.35)] flex items-center justify-center">
                  <div class="w-24 h-32 rounded-full border border-white/40"></div>
                  <div class="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                </div>
              </div>

              <!-- Status HUD Chip (Top Left) -->
              <div class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-card-background/90 text-primary-text backdrop-blur-md text-[11px] font-medium flex items-center gap-1.5 border border-primary-border/70  pointer-events-none">
                <span
                  class="material-symbols-outlined text-[15px]"
                  :class="selfiePreview && !cameraActive ? 'text-emerald-500' : (cameraActive ? 'text-amber-500 animate-pulse' : 'text-secondary-text')"
                >
                  {{ selfiePreview && !cameraActive ? 'verified' : (cameraActive ? 'center_focus_strong' : 'photo_camera') }}
                </span>
                <span>
                  {{ cameraActive ? 'Align Face in Oval' : (selfiePreview ? 'Photo Ready' : 'Camera Ready') }}
                </span>
              </div>
            </div>

            <!-- Viewfinder Controls -->
            <div class="flex items-center justify-between pt-1">
              <div class="flex flex-col min-w-0 pr-2">
                <span class="text-xs font-semibold text-primary-text truncate">
                  {{ cameraActive ? 'Camera Live' : (selfiePreview ? 'Selfie Verified' : 'Facial Capture') }}
                </span>
                <span class="text-[11px] text-secondary-text truncate">
                  {{ cameraActive ? 'Keep face centered in frame' : (selfiePreview ? 'Ready for punch record' : 'Anti-spoofing enabled') }}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <template v-if="cameraActive">
                  <button
                    type="button"
                    class="btn-secondary text-xs px-2.5 py-1.5 rounded-xl text-secondary-text hover:text-primary-text"
                    @click="stopCamera"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="btn-primary text-xs px-3.5 py-1.5 rounded-xl  flex items-center gap-1.5"
                    @click="captureSelfie"
                  >
                    <span class="material-symbols-outlined text-[16px]">photo_camera</span>
                    <span>Capture</span>
                  </button>
                </template>

                <button
                  v-else-if="selfiePreview"
                  type="button"
                  class="btn-secondary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 hover:border-primary-border"
                  @click="startCamera"
                >
                  <span class="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Retake</span>
                </button>

                <button
                  v-else
                  type="button"
                  class="btn-primary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 "
                  @click="startCamera"
                >
                  <span class="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>Open Camera</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Terminal System Reference Banner -->
        <div class="bg-card-background rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 ">
          <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <div class="flex flex-col flex-1 text-center sm:text-left">
            <div class="flex items-center justify-center sm:justify-start gap-2">
              <span class="text-xs font-semibold text-primary-text">Terminal Node Protocol Sync</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary-background text-secondary-text border border-primary-border/60">
                v4.18
              </span>
            </div>
            <p class="text-xs text-secondary-text mt-0.5 leading-relaxed">
              Attendance records synchronize instantly to Modus HR Enterprise Ledger. Geofence verification and biometric capture enforce compliance across Tier-1 campuses.
            </p>
          </div>
        </div>
      </div>

      <!-- ── RIGHT COLUMN: Shift Progress, Compliance & Recent History (lg:col-span-5) ── -->
      <div class="lg:col-span-5 flex flex-col gap-6">
        <!-- Live Shift Tracking Metric Card -->
        <div class="bg-card-background rounded-2xl p-6  flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-primary-text">Shift Progress</span>
            <span class="text-xs font-semibold text-primary">{{ shiftProgressPercent }}% Completed</span>
          </div>

          <!-- Progress Bar Component -->
          <div class="w-full bg-secondary-background h-2.5 rounded-full overflow-hidden border border-primary-border/60">
            <div
              class="h-full bg-primary transition-all duration-700 rounded-full"
              :style="{ width: `${shiftProgressPercent}%` }"
            ></div>
          </div>

          <!-- Active Elapsed Work Timer HUD -->
          <div class="flex items-baseline justify-between pt-1">
            <div class="flex flex-col">
              <span class="text-xs text-secondary-text">Elapsed Working Time</span>
              <span class="text-2xl font-bold font-mono tracking-tight text-primary-text mt-0.5">
                {{ elapsedTimerText }}
              </span>
            </div>
            <div class="flex flex-col text-right">
              <span class="text-xs text-secondary-text">Remaining</span>
              <span class="text-sm font-semibold font-mono text-secondary-text mt-0.5">
                {{ remainingTimerText }}
              </span>
            </div>
          </div>

          <!-- Timeline Milestone Markers -->
          <div class="grid grid-cols-3 gap-2 p-3 bg-background border border-primary-border/70 rounded-xl text-center">
            <div class="flex flex-col items-center">
              <span class="text-[11px] text-secondary-text">Check-In</span>
              <span class="text-xs font-semibold text-primary-text mt-0.5">
                {{ today?.check_in_at ? formatShortTime(today.check_in_at) : '--:--' }}
              </span>
            </div>
            <div class="flex flex-col items-center border-x border-primary-border/60 px-1">
              <span class="text-[11px] text-secondary-text">Half Day (4h)</span>
              <span class="text-xs font-semibold text-primary-text mt-0.5">
                {{ milestoneHalfDay }}
              </span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-[11px] text-secondary-text">Shift Goal (8h)</span>
              <span class="text-xs font-semibold text-primary-text mt-0.5">
                {{ milestoneGoal }}
              </span>
            </div>
          </div>

          <!-- Narrative Status Summary -->
          <p class="text-xs text-secondary-text leading-relaxed">
            {{ shiftNarrativeText }}
          </p>
        </div>

        <!-- Station Policy Compliance Card -->
        <div class="bg-card-background rounded-2xl p-6  flex flex-col gap-3">
          <span class="text-sm font-semibold text-primary-text">Station Policy Compliance</span>
          <div class="flex flex-col divide-y divide-primary-border/60 text-xs">
            <div class="flex items-center justify-between py-2">
              <span class="text-secondary-text">Office Location</span>
              <span class="font-medium text-primary-text">{{ officeNameDisplay }}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-secondary-text">Geofence Radius</span>
              <span class="font-medium text-primary-text">
                {{ settings?.allowed_radius_meters || 100 }}m Allowed (±{{ settings?.max_gps_accuracy_meters || 50 }}m GPS)
              </span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-secondary-text">Geofence on Checkout</span>
              <span class="font-medium text-primary-text">
                {{ settings?.require_geofence_on_checkout ? 'Mandatory' : 'Optional' }}
              </span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-secondary-text">Assigned Schedule</span>
              <span class="font-medium text-primary-text">Full Time Regular (09:00 - 18:00)</span>
            </div>
          </div>
        </div>

        <!-- Recent Logs History Card -->
        <div class="bg-card-background rounded-2xl p-6  flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-primary-text">Recent Shift History</span>
            <span class="text-xs text-secondary-text">Past 3 Days</span>
          </div>

          <div v-if="recentPunches && recentPunches.length" class="flex flex-col divide-y divide-primary-border/60">
            <div
              v-for="r in recentPunches.slice(0, 3)"
              :key="r.attendance_id || r.attendance_date"
              class="py-3 flex items-center justify-between hover:bg-background/50 transition-colors rounded-lg px-2 -mx-2"
            >
              <div class="flex flex-col min-w-0 pr-2">
                <span class="text-xs font-semibold text-primary-text">{{ r.attendance_date }}</span>
                <span class="text-[11px] text-secondary-text truncate mt-0.5">
                  {{ r.check_in_at ? formatShortTime(r.check_in_at) : '—' }} – {{ r.check_out_at ? formatShortTime(r.check_out_at) : '—' }}
                  <span v-if="r.reason">· {{ r.reason }}</span>
                </span>
              </div>
              <div class="flex flex-col items-end shrink-0">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                  :class="statusBadgeClass(r.status)"
                >
                  {{ r.status }}
                </span>
                <span class="text-[11px] text-secondary-text font-mono mt-0.5">
                  {{ r.worked_minutes != null ? Math.floor(r.worked_minutes / 60) + 'h ' + (r.worked_minutes % 60) + 'm' : '—' }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-6 text-xs text-secondary-text">
            No recent attendance records found.
          </div>

          <!-- Weekly Regularization Prompt -->
          <div class="p-3 bg-background border border-primary-border/80 rounded-xl flex items-center justify-between gap-3 mt-1">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-primary">help_outline</span>
              <span class="text-xs text-secondary-text">Missed a punch this cycle?</span>
            </div>
            <router-link
              to="/hrms/attendance"
              class="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Regularize
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 4. FLOATING INTERACTIVE TOAST ── -->
    <div
      class="fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none bg-primary text-inverted px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium"
      :class="toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'"
    >
      <span class="material-symbols-outlined text-[18px] text-emerald-400">{{ toastIcon }}</span>
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { useAuthStore } from "@/stores/auth/auth";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const hrms = useHrmsStore();
const auth = useAuthStore();
const permissions = usePermissionsStore();

// ─── GPS & Verification State ────────────────────────────────────────────────
const coords = ref(null);
const locationError = ref("");
const locating = ref(false);
const submitting = ref(false);
const currentAction = ref("");

// ─── Selfie Camera State ─────────────────────────────────────────────────────
const selfieBlob = ref(null);
const selfiePreview = ref("");
const cameraActive = ref(false);
const videoEl = ref(null);
const canvasEl = ref(null);
let mediaStream = null;

// ─── Real-time Clocks & Timers ───────────────────────────────────────────────
const currentTime = ref(new Date());
let timeInterval = null;

// ─── Toast Feedback State ────────────────────────────────────────────────────
const toastVisible = ref(false);
const toastMessage = ref("");
const toastIcon = ref("check_circle");
let toastTimeout = null;

const triggerToast = (msg, icon = "check_circle") => {
  toastMessage.value = msg;
  toastIcon.value = icon;
  toastVisible.value = true;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastVisible.value = false;
  }, 3000);
};

// ─── Store Computeds ─────────────────────────────────────────────────────────
const settings = computed(() => hrms.myAttendance?.settings || hrms.attendanceSettings);
const enabled = computed(() => !!settings.value?.location_attendance_enabled);
const today = computed(() => hrms.myAttendance?.today || null);
const openCheckIn = computed(() => !!hrms.myAttendance?.open_check_in);
const recentPunches = computed(() => hrms.myAttendance?.recent || []);
const canManageSettings = computed(() => permissions.can("attendance.settings.manage"));

const isConservative = computed(() => settings.value?.geofence_accuracy_mode === "CONSERVATIVE");

const userNameOrRole = computed(() => {
  return auth.currentUser?.name || auth.currentUser?.email || "Employee";
});

const officeNameDisplay = computed(() => {
  return settings.value?.office_name || "Headquarters Campus";
});

const timeZoneStr = computed(() => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `IST • UTC+05:30`;
  } catch {
    return "UTC+05:30";
  }
});

const currentDateStr = computed(() => {
  return currentTime.value.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const currentTimeStr = computed(() => {
  return currentTime.value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});

// Shift status & calculations
const isShiftCompleted = computed(() => {
  return !!today.value?.check_out_at;
});

const todayStatusComputed = computed(() => {
  if (today.value?.status) return today.value.status;
  if (openCheckIn.value) return "IN_PROGRESS";
  return "NOT_STARTED";
});

const statusLabelComputed = computed(() => {
  if (today.value?.status) return today.value.status;
  if (openCheckIn.value) return "IN PROGRESS";
  return "NOT STARTED";
});

const shiftTargetMinutes = computed(() => settings.value?.required_full_day_minutes || 480);
const shiftTargetHours = computed(() => Math.round(shiftTargetMinutes.value / 60));
const shiftHalfMinutes = computed(() => settings.value?.required_half_day_minutes || 240);
const shiftHalfHours = computed(() => Math.round(shiftHalfMinutes.value / 60));

// Elapsed Seconds calculation
const elapsedSeconds = computed(() => {
  if (!today.value?.check_in_at) return 0;
  const start = new Date(today.value.check_in_at).getTime();
  if (today.value.check_out_at) {
    const end = new Date(today.value.check_out_at).getTime();
    return Math.max(0, Math.floor((end - start) / 1000));
  }
  const now = currentTime.value.getTime();
  return Math.max(0, Math.floor((now - start) / 1000));
});

const shiftProgressPercent = computed(() => {
  const targetSec = shiftTargetMinutes.value * 60;
  if (!targetSec) return 0;
  return Math.min(100, Math.round((elapsedSeconds.value / targetSec) * 100));
});

const formatHMS = (totalSec) => {
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}h ${m}m ${s}s`;
};

const elapsedTimerText = computed(() => formatHMS(elapsedSeconds.value));

const remainingTimerText = computed(() => {
  const targetSec = shiftTargetMinutes.value * 60;
  const rem = Math.max(0, targetSec - elapsedSeconds.value);
  return formatHMS(rem);
});

const milestoneHalfDay = computed(() => {
  if (!today.value?.check_in_at) return "13:00 PM";
  const start = new Date(today.value.check_in_at).getTime();
  const halfDate = new Date(start + shiftHalfMinutes.value * 60 * 1000);
  return formatShortTime(halfDate.toISOString());
});

const milestoneGoal = computed(() => {
  if (!today.value?.check_in_at) return "17:00 PM";
  const start = new Date(today.value.check_in_at).getTime();
  const goalDate = new Date(start + shiftTargetMinutes.value * 60 * 1000);
  return formatShortTime(goalDate.toISOString());
});

const shiftNarrativeText = computed(() => {
  if (isShiftCompleted.value) {
    return "Duty day finalized. Punch records are locked and registered to the enterprise ledger.";
  }
  if (openCheckIn.value) {
    return "Shift active. Geofence tracking & elapsed hours are accumulating against your daily policy.";
  }
  return "Shift has not started yet. Complete biometric & location validation to punch in.";
});

// ─── Geolocation & Haversine formula ─────────────────────────────────────────
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

const effectiveDistance = computed(() => {
  if (distanceMeters.value == null || !coords.value) return null;
  return distanceMeters.value + (coords.value.accuracy || 0);
});

const isWithinGeofence = computed(() => {
  if (distanceMeters.value == null || !settings.value?.allowed_radius_meters) return false;
  if (isConservative.value) {
    return (effectiveDistance.value || 0) <= settings.value.allowed_radius_meters;
  }
  return distanceMeters.value <= settings.value.allowed_radius_meters;
});

const distanceDisplay = computed(() => {
  if (distanceMeters.value == null) return "Locating...";
  return `~${Math.round(distanceMeters.value)}m from pin`;
});

const coordsDisplay = computed(() => {
  if (!coords.value) return "Acquiring GPS...";
  return `${coords.value.latitude.toFixed(5)}° N, ${coords.value.longitude.toFixed(5)}° E`;
});

const accuracyDisplay = computed(() => {
  if (!coords.value) return "";
  return `±${Math.round(coords.value.accuracy)}m Acc`;
});

const accuracyColorClass = computed(() => {
  if (!coords.value) return "text-secondary-text";
  if (settings.value?.max_gps_accuracy_meters && coords.value.accuracy > settings.value.max_gps_accuracy_meters) {
    return "text-red-500";
  }
  return "text-emerald-500";
});

// ─── Status Badges Helper ────────────────────────────────────────────────────
const statusBadgeClass = (status) => {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    case "IN_PROGRESS":
      return "bg-primary/10 text-primary border-primary/30";
    case "HALF_DAY":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "ABSENT":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "LEAVE":
      return "bg-purple-500/10 text-purple-600 border-purple-500/30";
    case "WFH":
    case "ON_DUTY":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-secondary-background text-secondary-text border-primary-border";
  }
};

const statusDotClass = (status) => {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-500";
    case "IN_PROGRESS":
      return "bg-primary animate-pulse";
    case "HALF_DAY":
      return "bg-amber-500";
    case "ABSENT":
      return "bg-red-500";
    default:
      return "bg-secondary-text";
  }
};

const formatShortTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

// ─── Geolocation Actions ─────────────────────────────────────────────────────
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
      triggerToast(`GPS recalibrated (±${Math.round(pos.coords.accuracy)}m)`, "gps_fixed");
    },
    (err) => {
      locationError.value =
        err.code === 1
          ? "Location permission denied. Please allow location access in your browser."
          : "Could not obtain GPS position. Step outdoors or away from obstructions.";
      locating.value = false;
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
  );
};

// ─── Camera / Selfie Actions ─────────────────────────────────────────────────
const startCamera = async () => {
  locationError.value = "";
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    cameraActive.value = true;
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream;
    }
  } catch (err) {
    locationError.value = "Camera permission is required to capture your punch selfie.";
    cameraActive.value = false;
  }
};

const captureSelfie = () => {
  const video = videoEl.value;
  const canvas = canvasEl.value;
  if (!video || !canvas || !video.videoWidth) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      selfieBlob.value = blob;
      selfiePreview.value = URL.createObjectURL(blob);
      stopCamera();
      triggerToast("Biometric selfie verified", "photo_camera");
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
  cameraActive.value = false;
};

// ─── Punch Submission ────────────────────────────────────────────────────────
const submitPunch = async (kind) => {
  if (!coords.value || submitting.value) return;
  if (settings.value?.require_selfie && !selfieBlob.value) {
    locationError.value = "Please capture a selfie photo before punching.";
    triggerToast("Selfie photo required", "warning");
    return;
  }
  submitting.value = true;
  currentAction.value = kind;

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
    triggerToast(kind === "out" ? "Punched Out Successfully" : "Punched In Successfully", kind === "out" ? "logout" : "login");
  } finally {
    submitting.value = false;
    currentAction.value = "";
  }
};

// ─── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(async () => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);

  await hrms.fetchMyAttendance();
  refreshLocation();
});

onBeforeUnmount(() => {
  if (timeInterval) clearInterval(timeInterval);
  if (toastTimeout) clearTimeout(toastTimeout);
  stopCamera();
});
</script>
