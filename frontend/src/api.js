import axios from 'axios';
const client = axios.create({
  baseURL: 'https://smart-student-learning-platform-f8ob.onrender.com/api'
});


client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sslp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.apiMessage =
        'Cannot reach the server. Make sure the backend is running (npm run dev in backend folder).';
    } else if (typeof error.response.data === 'string') {
      error.apiMessage = 'Server returned an unexpected response. Check that the API is running on the correct port.';
    } else {
      error.apiMessage = error.response.data?.message;
    }
    return Promise.reject(error);
  }
);

export const getApiError = (err, fallback) => err?.apiMessage || err?.response?.data?.message || fallback;

export const register = (data) => client.post('/auth/register', data);
export const login = (data) => client.post('/auth/login', data);
export const getMe = () => client.get('/auth/me');
export const getDashboardStats = () => client.get('/dashboard/stats');
export const getCourses = () => client.get('/courses');
export const createCourse = (data) => client.post('/courses', data);
export const updateCourse = (id, data) => client.patch(`/courses/${id}`, data);
export const deleteCourse = (id) => client.delete(`/courses/${id}`);
export const enrollCourse = (id) => client.post(`/courses/${id}/enroll`);
export const getAssignments = (courseId) => client.get(`/assignments/course/${courseId}`);
export const createAssignment = (data) => client.post('/assignments', data);
export const submitAssignment = (id, data) => client.post(`/assignments/${id}/submit`, data);
export const gradeSubmission = (assignmentId, submissionId, data) =>
  client.patch(`/assignments/${assignmentId}/submission/${submissionId}/grade`, data);
export const getJobs = () => client.get('/jobs');
export const postJob = (data) => client.post('/jobs', data);
export const deleteJob = (id) => client.delete(`/jobs/${id}`);
export const applyJob = (id) => client.post(`/jobs/${id}/apply`);
export const getUsers = () => client.get('/users');
export const updateUser = (id, data) => client.patch(`/users/${id}`, data);
export const deleteUser = (id) => client.delete(`/users/${id}`);

export const getUserId = (user) => user?.id || user?._id;
