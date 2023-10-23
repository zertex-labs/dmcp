import { getAllItems } from '../../src/redis'
import type { JobHandler } from '../schedule'

export default (async ({ redis }) => {
  console.log('i hate black people')
  redis.json.get('user:db:192562679091691520').then(console.log)
}) satisfies JobHandler
