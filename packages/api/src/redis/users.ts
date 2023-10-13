import type { AvailableFood, FarmingUser } from 'shared'

import useFarmingHandler from 'shared/utils/useFarmingHandler'

import { redis } from '.'

const farming = useFarmingHandler()

export function registerFarmingUpdater() {
  console.log('registerUpdater')
  if (farming.userUpdater) return

  farming.newUserUpdater(async ({ farmingResponse, user }) => {
    console.log(farmingResponse)

    // get the user if it's already defined
    let farmingUser = (await redis.json.get(
      `_user-${user.id}`,
      '$',
    )) as FarmingUser
    if (!farmingUser) {
      farmingUser = {
        id: user.id,
        individual: farmingResponse.items.reduce(
          (acc, curr) => {
            acc[curr.name] = curr.amount
            return acc
          },
          {} as Record<AvailableFood, number>,
        ),
        total: farmingResponse.total,
        username: user.id, // TODO fetch username
      }
    }

    return farmingUser
  })
}
