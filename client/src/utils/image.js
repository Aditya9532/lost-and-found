export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url; // Already an absolute URL
  
  // Extract base URL from REACT_APP_API_URL
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace('/api', '');
  
  return `${baseUrl}${url}`;
};
