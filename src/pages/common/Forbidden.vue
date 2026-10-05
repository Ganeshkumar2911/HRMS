<template>
  <div class="max-w-lg mx-auto py-16 space-y-4">
    <div class="p-6 rounded-xl bg-card-background border border-primary-border text-center space-y-3">
      <div class="w-12 h-12 mx-auto rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center">
        <span class="material-symbols-rounded text-2xl">lock</span>
      </div>
      <h1 class="title-text text-primary-text">Access restricted</h1>
      <p class="sub-text text-secondary-text">
        {{
          checking
            ? "Checking your permissions…"
            : "You do not have permission to view this page. Contact an administrator if you need access."
        }}
      </p>
      <router-link to="/chat" class="btn-primary inline-flex text-xs px-4 py-2">
        Back to Chat
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const route = useRoute();
const router = useRouter();
const permissionsStore = usePermissionsStore();
const checking = ref(true);

onMounted(async () => {
  try {
    await permissionsStore.fetchMyPermissions(true);
  } catch (_) {
    // Keep the restricted message when reload fails.
  }

  const fromPath = typeof route.query.from === "string" ? route.query.from : "";
  if (fromPath.startsWith("/")) {
    const matched = router.resolve(fromPath).matched;
    const requiredPermission = matched
      .map((record) => record.meta?.requiredPermission)
      .filter(Boolean)
      .at(-1);

    if (!requiredPermission || permissionsStore.can(requiredPermission)) {
      await router.replace(fromPath);
      return;
    }
  }

  checking.value = false;
});
</script>
