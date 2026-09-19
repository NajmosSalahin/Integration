import { getAccessToken } from './token';

export async function uploadImage(file, folder) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload/image', {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(getAccessToken() && { Authorization: `Bearer ${getAccessToken()}` }),
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}