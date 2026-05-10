import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ───────────────────────────────────────────
export const registerUser = (username, email, password) =>
  API.post('/auth/register', { username, email, password });

export const loginUser = (email, password) =>
  API.post('/auth/login', { email, password });

export const getMe = () =>
  API.get('/auth/me');

// ─── Users ──────────────────────────────────────────
export const getUserProfile = (userId) =>
  API.get(`/users/${userId}`);

export const updateUserProfile = (id, data) => API.put(`/users/${id}`, data);
export const toggleFollow = (targetId) => API.post(`/users/follow/${targetId}`);
export const getSuggestedUsers = () => API.get('/users/suggested');
export const getCommunityUsers = (search = '') => API.get(`/users/community?search=${search}`);

// ─── Groups ──────────────────────────────────────────
export const createGroup = (data) => API.post('/groups', data);
export const getMyGroups = () => API.get('/groups/me');
export const getPublicGroups = () => API.get('/groups/public');
export const getGroupDetails = (id) => API.get(`/groups/${id}`);
export const joinGroup = (id) => API.post(`/groups/${id}/join`);
export const addGroupMember = (groupId, userId) => API.post(`/groups/${groupId}/members/${userId}`);
export const removeGroupMember = (groupId, userId) => API.delete(`/groups/${groupId}/members/${userId}`);

// ─── Questions ──────────────────────────────────────
export const createQuestion = (title, body, topics, images, groupId) =>
  API.post('/questions', { title, body, topics, images, groupId });

export const getQuestions = (page = 1) =>
  API.get(`/questions?page=${page}`);

export const getQuestionById = (id) =>
  API.get(`/questions/${id}`);

export const searchQuestions = (text = '', tag = '') =>
  API.get('/questions/search', { params: { text, tag } });

export const getUserQuestions = (userId) =>
  API.get(`/questions/user/${userId}`);

// ─── Answers ────────────────────────────────────────
export const postAnswer = (questionId, text) =>
  API.post(`/answers/${questionId}`, { text });

export const getAnswersByQuestion = (questionId) =>
  API.get(`/answers/question/${questionId}`);

export const getUserAnswers = (userId) =>
  API.get(`/answers/user/${userId}`);

// Notifications
export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) => API.patch(`/notifications/read/${id}`);
export const markAllNotificationsRead = () => API.patch("/notifications/read-all");

export const editAnswer = (answerId, text) =>
  API.put(`/answers/${answerId}`, { text });

export const deleteAnswer = (answerId) =>
  API.delete(`/answers/${answerId}`);

// ─── Comments ───────────────────────────────────────
export const commentOnAnswer = (answerId, text) =>
  API.post(`/comments/answer/${answerId}`, { text });

export const replyToComment = (commentId, text) =>
  API.post(`/comments/comment/${commentId}`, { text });

export const getCommentsByParent = (parentId) =>
  API.get(`/comments/${parentId}`);

export const deleteQuestion = (id) =>
  API.delete(`/questions/${id}`);

export const updateComment = (id, text) =>
  API.put(`/comments/${id}`, { text });

export const deleteComment = (id) =>
  API.delete(`/comments/${id}`);

// ─── Likes ──────────────────────────────────────────
export const toggleLike = (targetId, targetType) =>
  API.post('/likes/toggle', { targetId, targetType });

export const getLikeInfo = (targetId, targetType) =>
  API.get(`/likes/${targetId}`, { params: { targetType } });

// ─── Topics ─────────────────────────────────────────
export const getTopics = () =>
  API.get('/topics');

export const createTopic = (name) =>
  API.post('/topics', { name });

export default API;
