import axios, { type AxiosError, type AxiosResponse } from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  (err: AxiosError) => Promise.reject(err)
)
