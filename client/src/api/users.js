import api from './axiosInstance';

export const getTeamMembers = () => api.get('/users/team');
