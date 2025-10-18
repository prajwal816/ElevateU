import axios from "axios";
import { getToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with auth token
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ====================
// STUDY SESSIONS
// ====================
export const startStudySession = async (data?: { course?: string; activity?: string }) => {
  const response = await apiClient.post("/study-sessions/start", data);
  return response.data;
};

export const pingStudySession = async () => {
  const response = await apiClient.put("/study-sessions/ping");
  return response.data;
};

export const endStudySession = async () => {
  const response = await apiClient.post("/study-sessions/end");
  return response.data;
};

export const getStudyHoursSummary = async (days: number = 7) => {
  const response = await apiClient.get(`/study-sessions/summary?days=${days}`);
  return response.data;
};

export const getDailyTimetable = async (date: string) => {
  const response = await apiClient.get(`/study-sessions/timetable?date=${date}`);
  return response.data;
};

// ====================
// TODOS
// ====================
export const getTodos = async () => {
  const response = await apiClient.get("/todos");
  return response.data;
};

export const createTodo = async (data: {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
}) => {
  const response = await apiClient.post("/todos", data);
  return response.data;
};

export const updateTodo = async (id: string, data: Partial<{
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  completed: boolean;
}>) => {
  const response = await apiClient.put(`/todos/${id}`, data);
  return response.data;
};

export const deleteTodo = async (id: string) => {
  const response = await apiClient.delete(`/todos/${id}`);
  return response.data;
};

export const toggleTodo = async (id: string) => {
  const response = await apiClient.put(`/todos/${id}/toggle`);
  return response.data;
};

// ====================
// EVENTS
// ====================
export const getEvents = async (start?: string, end?: string) => {
  let url = "/events";
  if (start && end) {
    url += `?start=${start}&end=${end}`;
  }
  const response = await apiClient.get(url);
  return response.data;
};

export const createEvent = async (data: {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  course?: string;
  type?: "class" | "assignment" | "exam" | "event";
}) => {
  const response = await apiClient.post("/events", data);
  return response.data;
};

export const updateEvent = async (id: string, data: any) => {
  const response = await apiClient.put(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: string) => {
  const response = await apiClient.delete(`/events/${id}`);
  return response.data;
};

// ====================
// LEADERBOARD
// ====================
export const getLeaderboard = async (limit: number = 10, role?: string) => {
  let url = `/leaderboard?limit=${limit}`;
  if (role) {
    url += `&role=${role}`;
  }
  const response = await apiClient.get(url);
  return response.data;
};

export const getMyRank = async () => {
  const response = await apiClient.get("/leaderboard/my-rank");
  return response.data;
};

// ====================
// COURSES
// ====================
export const getCourses = async (filters?: { search?: string; category?: string; level?: string; published?: boolean }) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.level) params.append('level', filters.level);
  if (filters?.published !== undefined) params.append('published', filters.published.toString());
    
  const response = await apiClient.get(`/courses?${params.toString()}`);
  return response.data;
};
  
export const getTeacherCourses = async () => {
  const response = await apiClient.get("/courses/my-courses");
  return response.data;
};

export const getEnrolledCourses = async () => {
  const response = await apiClient.get("/enrollments");
  return response.data;
};
export const getCourseById = async (id: string) => {
  const response = await apiClient.get(`/courses/${id}`);
  return response.data;
};
  
export const createCourse = async (formData: FormData) => {
  const response = await apiClient.post("/courses", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
  
export const updateCourse = async (id: string, formData: FormData) => {
  const response = await apiClient.put(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
  
export const deleteCourse = async (id: string) => {
  const response = await apiClient.delete(`/courses/${id}`);
  return response.data;
};
  
export const enrollInCourse = async (courseId: string) => {
  const response = await apiClient.post(`/courses/${courseId}/enroll`);
  return response.data;
};
  
export const unenrollFromCourse = async (courseId: string) => {
  const response = await apiClient.delete(`/courses/${courseId}/unenroll`);
  return response.data;
};
  
export const getCourseStudents = async (courseId: string) => {
  const response = await apiClient.get(`/courses/${courseId}/students`);
  return response.data;
};
  
  // ====================
  // COURSE UNITS & TOPICS
  // ====================
export const getCourseUnits = async (courseId: string) => {
  const response = await apiClient.get(`/courses/${courseId}/units`);
  return response.data;
};
  
export const createUnit = async (courseId: string, data: { title: string; description?: string; order?: number }) => {
  const response = await apiClient.post(`/courses/${courseId}/units`, data);
  return response.data;
};
  
export const updateUnit = async (unitId: string, data: { title?: string; description?: string; order?: number }) => {
  const response = await apiClient.put(`/courses/units/${unitId}`, data);
  return response.data;
};
  
export const deleteUnit = async (unitId: string) => {
  const response = await apiClient.delete(`/courses/units/${unitId}`);
  return response.data;
};
  
export const getUnitTopics = async (unitId: string) => {
  const response = await apiClient.get(`/courses/units/${unitId}/topics`);
  return response.data;
};
  
export const createTopic = async (unitId: string, formData: FormData) => {
  const response = await apiClient.post(`/courses/units/${unitId}/topics`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
  
export const updateTopic = async (topicId: string, formData: FormData) => {
  const response = await apiClient.put(`/courses/topics/${topicId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
  
export const deleteTopic = async (topicId: string) => {
  const response = await apiClient.delete(`/courses/topics/${topicId}`);
  return response.data;
};
  
  // ====================
  // ANNOUNCEMENTS
  // ====================
export const getCourseAnnouncements = async (courseId: string) => {
  const response = await apiClient.get(`/announcements/course/${courseId}`);
  return response.data;
};
  
export const createAnnouncement = async (courseId: string, data: { title: string; content: string }) => {
  const response = await apiClient.post(`/announcements/course/${courseId}`, data);
  return response.data;
};
  
export const updateAnnouncement = async (id: string, data: { title?: string; content?: string }) => {
  const response = await apiClient.put(`/announcements/${id}`, data);
  return response.data;
};
  
export const deleteAnnouncement = async (id: string) => {
  const response = await apiClient.delete(`/announcements/${id}`);
  return response.data;
};
  
  // ====================
  // FORUM
  // ====================
export const getForumPosts = async (courseId: string) => {
  const response = await apiClient.get(`/forum/${courseId}`);
  return response.data;
};
  
export const createForumPost = async (courseId: string, data: { title: string; content: string }) => {
  const response = await apiClient.post(`/forum/${courseId}`, data);
  return response.data;
};
  
export const replyToPost = async (postId: string, content: string) => {
  const response = await apiClient.post(`/forum/posts/${postId}/reply`, { content });
  return response.data;
};
  
export const deleteForumPost = async (postId: string) => {
  const response = await apiClient.delete(`/forum/posts/${postId}`);
  return response.data;
};
// ====================
// ASSIGNMENTS
// ====================
export const getAssignments = async () => {
  const response = await apiClient.get("/assignments");
  return response.data;
};

export const getCourseAssignments = async (courseId: string) => {
  const response = await apiClient.get(`/assignments/course/${courseId}`);
  return response.data;
};

export const createAssignment = async (data: any) => {
  const response = await apiClient.post("/assignments", data);
  return response.data;
};

export const updateAssignment = async (id: string, data: any) => {
  const response = await apiClient.put(`/assignments/${id}`, data);
  return response.data;
};

export const deleteAssignment = async (id: string) => {
  const response = await apiClient.delete(`/assignments/${id}`);
  return response.data;
};

// ====================
// SUBMISSIONS
// ====================
export const submitAssignment = async (formData: FormData) => {
  const response = await apiClient.post("/submissions", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateSubmission = async (submissionId: string, formData: FormData) => {
  const response = await apiClient.put(`/submissions/${submissionId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getMySubmissions = async () => {
  const response = await apiClient.get("/submissions/my-submissions");
  return response.data;
};

export const getSubmissionsByAssignment = async (assignmentId: string) => {
  const response = await apiClient.get(`/submissions/assignment/${assignmentId}`);
  return response.data;
};

// ====================
// REVIEWS
// ====================
export const submitReview = async (courseId: string, reviewData: { rating: number; comment: string }) => {
  const response = await apiClient.post(`/reviews/${courseId}`, reviewData);
  return response.data;
};

export const getCourseReviews = async (courseId: string) => {
  const response = await apiClient.get(`/reviews/${courseId}`);
  return response.data;
};

// ====================
// ENROLLMENTS
// ====================
export const updateEnrollmentProgress = async (enrollmentId: string, topicId: string) => {
  const response = await apiClient.put(`/enrollments/${enrollmentId}/progress`, { topicId });
  return response.data;
};
// ====================
// GRADES
// ====================
export const getMyGrades = async (studentId: string) => {
  const response = await apiClient.get(`/grades/student/${studentId}`);
  return response.data;
};
export const getCourseGrades = async (courseId: string) => {
  const response = await apiClient.get(`/grades/course/${courseId}`);
  return response.data;
};
// ====================
// PLAGIARISM
// ====================
export const checkPlagiarism = async (assignmentId: string) => {
  const response = await apiClient.post(`/plagiarism/check/${assignmentId}`);
  return response.data;
};

export const getPlagiarismReports = async (assignmentId: string) => {
  const response = await apiClient.get(`/plagiarism/${assignmentId}`);
  return response.data;
};
export default apiClient;