import type { AvailableFood } from 'types'

export const LEADERBOARD_UPDATE_INTERVAL = 1000 * 60 * 10 // 10 minutes
export const LEADERBOARD_SIZE = 10 as const

export interface LeaderboardEntry {
  username: string
  total: number

  individual: Record<AvailableFood, number>
}

let store: ReturnType<typeof _createStore>
export function useLeaderboard() {
  if (!store) store = _createStore()
  return store
}

type Updater = () => Promise<LeaderboardEntry[]>
function _createStore() {
  let updaterTimer: Timer
  let lastUpdated = performance.now()
  const data = [] as LeaderboardEntry[]

  async function update(updater: Updater) {
    data.splice(0, data.length, ...(await updater()))
    lastUpdated = performance.now()
  }

  function newUpdater(updater: Updater, time = LEADERBOARD_UPDATE_INTERVAL) {
    if (time < 1000 * 60) throw new Error('Interval must be at least 1 minute')

    if (updaterTimer) {
      console.log(
        `Received new interval; new time is ${time}; \n${
          new Error('stack').stack
        }`,
      )
      clearInterval(updaterTimer)
    }

    update(updater)
      .then(() => {
        setInterval(() => update(updater), time)
      })
      .catch((err) => {
        console.log('New updater failed', err)
      })
  }

  return {
    newUpdater,
    update,
    get data() {
      return data
    },
    get lastUpdated() {
      return lastUpdated
    },
    get updaterInterval() {
      return updaterTimer
    },
  }
}

export default useLeaderboard
