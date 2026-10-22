import { authClient } from './authApi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const plainClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatbotApi = {
  sendMessage: async ({ message, language = 'en', history = [] }) => {
    const token = localStorage.getItem('fb_access_token');
    const client = token ? authClient : plainClient;
    const res = await client.post('/chatbot/chat', {
      message,
      language,
      history,
    });
    return res.data;
  },
};

export default chatbotApi;
