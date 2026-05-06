import api from './axiosInstance';

export const getTasks = (projectId) => api.get(`/projects/${projectId}/tasks`);
export const getTask = (projectId, id) => api.get(`/projects/${projectId}/tasks/${id}`);
export const createTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data);
export const updateTask = (projectId, id, data) => api.put(`/projects/${projectId}/tasks/${id}`, data);
export const deleteTask = (projectId, id) => api.delete(`/projects/${projectId}/tasks/${id}`);
