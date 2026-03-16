import api from './axios';

export const sendMessage     = (data)          => api.post('/messages', data);
export const getConversation = (userId, itemId) => api.get(`/messages/${userId}/${itemId}`);
export const getInbox        = ()              => api.get('/messages/inbox');
