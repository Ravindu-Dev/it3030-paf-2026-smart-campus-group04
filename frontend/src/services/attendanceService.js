import api from "./api";

/**
 * Attendance API service.
 * Wraps all attendance-related API calls.
 */

/** Mark attendance via QR scan (ADMIN/MANAGER only) */
export const markAttendance = (data) => api.post("/attendance/mark", data);

/** Get current user's attendance history */
export const getMyAttendance = () => api.get("/attendance/my");

/** Get all attendance records (ADMIN/MANAGER only) */
export const getAllAttendance = () => api.get("/attendance");

/** Get current user's attendance stats */
export const getMyStats = () => api.get("/attendance/stats/me");

/** Get overall attendance stats (ADMIN/MANAGER only) */
export const getOverallStats = () => api.get("/attendance/stats");

/** Get a specific user's attendance (ADMIN/MANAGER only) */
export const getUserAttendance = (userId) =>
  api.get(`/attendance/user/${userId}`);
