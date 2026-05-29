const getAuthToken = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.token || '';
    }
  } catch (err) {
    console.error('Error getting auth token', err);
  }
  return '';
};

// We will use standard fetch inside an easy-to-use API caller helper
// to keep coding extremely simple, lightweight and direct without complex setups.
const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If we are sending standard JSON, set Content-Type
  // Multer uploads will use FormData, in which case Content-Type should not be set manually.
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Something went wrong');
  }

  return responseData;
};

export default apiRequest;
