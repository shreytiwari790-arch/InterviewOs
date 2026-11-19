import { api } from './api';

export const contactService = {
  sendMessage: (message) => api.post('/contact', message),
};
