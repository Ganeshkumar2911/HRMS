import { usePermissionsStore } from "./permissions";

/**
 * Backward-compatibility wrapper for useMyPermissionsStore
 */
export const useMyPermissionsStore = usePermissionsStore;
export default usePermissionsStore;
