import { authClient } from './authApi';

export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await authClient.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data; // { url, relativeUrl, fileName, size }
  },
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await authClient.post('/uploads/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data; // { url, relativeUrl, fileName, originalName, size }
  }
};
