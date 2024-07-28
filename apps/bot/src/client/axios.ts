import axios from 'axios'
import { config } from 'src/config'

export const apiClient = axios.create({
  baseURL: `${config.env.API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})
