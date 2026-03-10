import axios, { type AxiosError, type AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

api.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  (err: AxiosError) => Promise.reject(err)
)
