import type { FarmingUser } from 'shared'
import { getAllItems } from './getAllItems'

const leaderboard = useLeaderboard()

export function registerLeaderboardUpdater() {
  console.log('registerUpdater')
  if (leaderboard.updaterInterval) return

  leaderboard.newUpdater(async () => {
    const users = await getAllItems<string, FarmingUser>('_user-*')

    console.log(users)

    return []
  })
}
