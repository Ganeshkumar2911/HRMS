import { defineStore } from "pinia";
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth/auth";

export const useProfileStore = defineStore("profile", () => {
  const authStore = useAuthStore();

  const user = computed(() => authStore.currentUser);
  const employee = computed(() => authStore.currentEmployee);

  const fetchUserProfile = (force = false) => {
    return authStore.fetchCurrentUser(force);
  };

  const fetchEmployeeProfile = (force = false) => {
    return authStore.fetchCurrentEmployee(force);
  };

  return {
    user,
    employee,
    fetchUserProfile,
    fetchEmployeeProfile,
  };
});

export default useProfileStore;
