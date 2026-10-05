import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const now = new Date();

export const useHrmsStore = defineStore("hrms", () => {
  const snackbar = useSnackbarStore();

  const hrmsMonth = ref(now.getMonth() + 1);
  const hrmsYear = ref(now.getFullYear());
  const selectedEmployeeId = ref(null);

  const employees = ref([]);
  const activeEmployee = ref(null);
  const employeeHistory = ref([]);
  const departments = ref([]);
  const designations = ref([]);
  const workLocations = ref([]);
  const holidays = ref([]);
  const workWeekPolicies = ref([]);
  const attendanceRows = ref([]);
  const attendanceCalendar = ref([]);
  const leaveTypes = ref([]);
  const leavePolicies = ref([]);
  const leaveBalances = ref([]);
  const leaveRequests = ref([]);
  const monthCalendar = ref(null);

  const inFlight = {
    employees: false,
    departments: false,
    designations: false,
    workLocations: false,
    holidays: false,
    workWeek: false,
    attendance: false,
    leaveTypes: false,
    leavePolicies: false,
    leaveBalances: false,
    leaveRequests: false,
    calendar: false,
  };

  const isFetched = ref({
    employees: false,
    departments: false,
    designations: false,
    workLocations: false,
    holidays: false,
    workWeek: false,
    leaveTypes: false,
    leavePolicies: false,
  });

  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  const listFetch = (key, url, targetRef, params = {}, force = false) => {
    if (inFlight[key]) return Promise.resolve(targetRef.value);
    if (isFetched.value[key] && !force) return Promise.resolve(targetRef.value);

    inFlight[key] = true;
    loading.value = true;

    return apiRequest(urls.KEYS.GET, url, {
      params,
      isTokenRequired: true,
      onSuccess: (res) => {
        targetRef.value = Array.isArray(res) ? res : res?.items || [];
        if (key in isFetched.value) isFetched.value[key] = true;
      },
      onFailure: (err) => {
        error.value = err?.message || "Request failed";
        if (err?.status !== 403) snackbar.show(error.value, "error");
      },
      onFinally: () => {
        inFlight[key] = false;
        loading.value = false;
      },
    });
  };

  const fetchEmployees = (params = {}, force = false) =>
    listFetch("employees", urls.hrms.employees, employees, params, force);

  const fetchEmployee = (employeeId) => {
    return apiRequest(urls.KEYS.GET, urls.hrms.employeeDetail(employeeId), {
      isTokenRequired: true,
      onSuccess: (res) => {
        activeEmployee.value = res;
      },
      onFailure: (err) => snackbar.show(err?.message || "Failed to load employee", "error"),
    });
  };

  const createEmployee = (payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.hrms.employeeCreate, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Employee created", "success");
        fetchEmployees({}, true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Create failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const updateEmployee = (employeeId, payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.PATCH, urls.hrms.employeeUpdate(employeeId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show("Employee updated", "success");
        activeEmployee.value = res;
        fetchEmployees({}, true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Update failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const fetchEmployeeHistory = (employeeId) =>
    apiRequest(urls.KEYS.GET, urls.hrms.employeeHistory(employeeId), {
      isTokenRequired: true,
      onSuccess: (res) => {
        employeeHistory.value = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      },
    });

  const addAddress = (employeeId, payload) =>
    apiRequest(urls.KEYS.POST, urls.hrms.employeeAddresses(employeeId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Address added", "success");
        fetchEmployee(employeeId);
      },
      onFailure: (err) => snackbar.show(err?.message || "Failed", "error"),
    });

  const addEmergencyContact = (employeeId, payload) =>
    apiRequest(urls.KEYS.POST, urls.hrms.employeeEmergencyContacts(employeeId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Contact added", "success");
        fetchEmployee(employeeId);
      },
      onFailure: (err) => snackbar.show(err?.message || "Failed", "error"),
    });

  const fetchDepartments = (force = false) =>
    listFetch("departments", urls.hrms.departments, departments, {}, force);
  const fetchDesignations = (force = false) =>
    listFetch("designations", urls.hrms.designations, designations, {}, force);
  const fetchWorkLocations = (force = false) =>
    listFetch("workLocations", urls.hrms.workLocations, workLocations, {}, force);

  const saveOrg = (method, url, payload, refresh) => {
    actionLoading.value = true;
    return apiRequest(method, url, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Saved", "success");
        refresh(true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Save failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const createDepartment = (payload) =>
    saveOrg(urls.KEYS.POST, urls.hrms.departments, payload, fetchDepartments);
  const updateDepartment = (id, payload) =>
    saveOrg(urls.KEYS.PATCH, urls.hrms.departmentDetail(id), payload, fetchDepartments);
  const createDesignation = (payload) =>
    saveOrg(urls.KEYS.POST, urls.hrms.designations, payload, fetchDesignations);
  const updateDesignation = (id, payload) =>
    saveOrg(urls.KEYS.PATCH, urls.hrms.designationDetail(id), payload, fetchDesignations);
  const createWorkLocation = (payload) =>
    saveOrg(urls.KEYS.POST, urls.hrms.workLocations, payload, fetchWorkLocations);
  const updateWorkLocation = (id, payload) =>
    saveOrg(urls.KEYS.PATCH, urls.hrms.workLocationDetail(id), payload, fetchWorkLocations);

  const fetchHolidays = (force = false) =>
    listFetch("holidays", urls.hrms.holidays, holidays, {}, force);
  const fetchWorkWeekPolicies = (force = false) =>
    listFetch("workWeek", urls.hrms.workWeekPolicies, workWeekPolicies, {}, force);

  const createHoliday = (payload) =>
    saveOrg(urls.KEYS.POST, urls.hrms.holidays, payload, fetchHolidays);
  const updateHoliday = (id, payload) =>
    saveOrg(urls.KEYS.PATCH, urls.hrms.holidayDetail(id), payload, fetchHolidays);
  const deleteHoliday = (id) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.DELETE, urls.hrms.holidayDetail(id), {
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Holiday deleted", "success");
        fetchHolidays(true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Delete failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const createWorkWeekPolicy = (payload) =>
    saveOrg(urls.KEYS.POST, urls.hrms.workWeekPolicies, payload, fetchWorkWeekPolicies);
  const updateWorkWeekPolicy = (id, payload) =>
    saveOrg(urls.KEYS.PATCH, urls.hrms.workWeekPolicyDetail(id), payload, fetchWorkWeekPolicies);

  const fetchAttendanceCalendar = (params = {}) => {
    inFlight.attendance = true;
    return apiRequest(urls.KEYS.GET, urls.hrms.attendanceCalendar, {
      params: {
        year: hrmsYear.value,
        month: hrmsMonth.value,
        ...params,
      },
      isTokenRequired: true,
      onSuccess: (res) => {
        attendanceCalendar.value = Array.isArray(res) ? res : [];
      },
      onFailure: (err) => {
        if (err?.status !== 403) snackbar.show(err?.message || "Failed", "error");
      },
      onFinally: () => {
        inFlight.attendance = false;
      },
    });
  };

  const markAttendance = (payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.hrms.attendanceMark, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Attendance marked", "success");
        fetchAttendanceCalendar();
      },
      onFailure: (err) => snackbar.show(err?.message || "Mark failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const correctAttendance = (attendanceId, payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.hrms.attendanceCorrection(attendanceId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Attendance corrected", "success");
        fetchAttendanceCalendar();
      },
      onFailure: (err) => snackbar.show(err?.message || "Correction failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const fetchLeaveTypes = (force = false) =>
    listFetch("leaveTypes", urls.hrms.leaveTypes, leaveTypes, {}, force);
  const fetchLeavePolicies = (force = false) =>
    listFetch("leavePolicies", urls.hrms.leavePolicies, leavePolicies, {}, force);
  const fetchLeaveBalances = (params = {}, force = true) =>
    listFetch("leaveBalances", urls.hrms.leaveBalances, leaveBalances, params, force);
  const fetchLeaveRequests = (params = {}, force = true) =>
    listFetch("leaveRequests", urls.hrms.leaveRequests, leaveRequests, params, force);

  const createLeaveType = (payload) =>
    saveOrg(urls.KEYS.POST, urls.hrms.leaveTypes, payload, fetchLeaveTypes);
  const updateLeaveType = (id, payload) =>
    saveOrg(urls.KEYS.PATCH, urls.hrms.leaveTypeDetail(id), payload, fetchLeaveTypes);
  const createLeavePolicy = (payload) =>
    saveOrg(urls.KEYS.POST, urls.hrms.leavePolicies, payload, fetchLeavePolicies);

  const adjustBalance = (payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.hrms.leaveBalanceAdjust, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Balance adjusted", "success");
        fetchLeaveBalances({}, true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Adjust failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const createLeaveRequest = (payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.hrms.leaveRequests, {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Leave request submitted", "success");
        fetchLeaveRequests({}, true);
        fetchLeaveBalances({}, true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Request failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const leaveAction = (url, message) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, url, {
      data: {},
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show(message, "success");
        fetchLeaveRequests({}, true);
        fetchLeaveBalances({}, true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Action failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const approveLeave = (id) => leaveAction(urls.hrms.leaveRequestApprove(id), "Leave approved");
  const rejectLeave = (id) => leaveAction(urls.hrms.leaveRequestReject(id), "Leave rejected");
  const cancelLeave = (id) => leaveAction(urls.hrms.leaveRequestCancel(id), "Leave cancelled");

  const fetchMonthCalendar = (params = {}) => {
    inFlight.calendar = true;
    return apiRequest(urls.KEYS.GET, urls.hrms.calendar, {
      params: {
        year: hrmsYear.value,
        month: hrmsMonth.value,
        ...params,
      },
      isTokenRequired: true,
      onSuccess: (res) => {
        monthCalendar.value = res;
      },
      onFailure: (err) => {
        if (err?.status !== 403) snackbar.show(err?.message || "Failed", "error");
      },
      onFinally: () => {
        inFlight.calendar = false;
      },
    });
  };

  return {
    hrmsMonth,
    hrmsYear,
    selectedEmployeeId,
    employees,
    activeEmployee,
    employeeHistory,
    departments,
    designations,
    workLocations,
    holidays,
    workWeekPolicies,
    attendanceRows,
    attendanceCalendar,
    leaveTypes,
    leavePolicies,
    leaveBalances,
    leaveRequests,
    monthCalendar,
    inFlight,
    isFetched,
    loading,
    actionLoading,
    error,
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    fetchEmployeeHistory,
    addAddress,
    addEmergencyContact,
    fetchDepartments,
    fetchDesignations,
    fetchWorkLocations,
    createDepartment,
    updateDepartment,
    createDesignation,
    updateDesignation,
    createWorkLocation,
    updateWorkLocation,
    fetchHolidays,
    fetchWorkWeekPolicies,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    createWorkWeekPolicy,
    updateWorkWeekPolicy,
    fetchAttendanceCalendar,
    markAttendance,
    correctAttendance,
    fetchLeaveTypes,
    fetchLeavePolicies,
    fetchLeaveBalances,
    fetchLeaveRequests,
    createLeaveType,
    updateLeaveType,
    createLeavePolicy,
    adjustBalance,
    createLeaveRequest,
    approveLeave,
    rejectLeave,
    cancelLeave,
    fetchMonthCalendar,
  };
});
