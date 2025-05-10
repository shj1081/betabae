import axios from 'axios';

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', // 서버 주소
  withCredentials: true,
});
