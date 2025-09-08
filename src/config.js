// src/config.js

// Automatically use localhost when running locally, otherwise use Render URL
const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'

    : 'https://student-management-iida.onrender.com'; // <-- Replace with your actual Render backend URL
//https://student-management-iida.onrender.com
export { API_BASE_URL };
