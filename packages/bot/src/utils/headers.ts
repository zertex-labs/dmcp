import { config } from 'src/config'

export const apiSecretHeaders = {
  'x-api-secret': config.env.API_SECRET,
}
