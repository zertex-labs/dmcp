import type { AvailablePerk, Crop, FarmingUser, Food, PerkType, Pet, PetSkeleton, PlayerStat, Rarity, User } from 'shared'
import { createBaseChances, randomNumber } from 'shared'
import { food as dataFood, perks as dataPerks, upgrades } from 'shared/data'
import { JoinNullability } from 'drizzle-orm/query-builders/select.types'
import { createRedisKey, redis } from '../../redis'
import type { SyncableFarmingUser } from '../../utils'
import { useFarmingUsersBatcher } from '../../utils'

export type CalculatedPlayerStats = Record<PlayerStat, number>
type NamedFood = Food & { name: Crop }
type NamedFoodWithChance = NamedFood & { chance: number }

type FarmingResponse = ReturnType<typeof doFarm>

// TODO cleanup and not so much re-computing

const batcher = useFarmingUsersBatcher()

export function calculateUserStats(
  pet: Pet & PetSkeleton,
  base: CalculatedPlayerStats,
): CalculatedPlayerStats {
  const finalChances = createBaseChances()

  const { level, upgradeSlots, perks: perkNames, maxLevel } = pet
  // const { perks: perkNames, maxLevel } = pet.skeleton;

  // get the actual perk objects from the perk names
  const perks = perkNames.map(
    name => dataPerks.data[name as AvailablePerk] as PerkType,
  )

  // apply perks to chances
  perks.forEach((perk) => {
    const { appliesTo, baseValue, maxValue } = perk
    const perLevel = (maxValue - baseValue) / maxLevel

    appliesTo.forEach((stat) => {
      finalChances[stat] += baseValue + perLevel * level
    })
  })

  // apply upgrade slots to chances
  upgradeSlots.forEach((upgradeSlot) => {
    const upgrade = upgrades[upgradeSlot]
    Object.entries(upgrade.appliesTo).forEach(([stat, value]) => {
      finalChances[stat as PlayerStat] += value
    })
  })

  // apply chances
  Object.entries(finalChances).forEach(([_stat, percentageToIncrease]) => {
    if (percentageToIncrease === 0) return

    const stat = _stat as PlayerStat
    const oldValue = base[stat]
    const toIncrease = oldValue * percentageToIncrease
      ; (base[stat] += toIncrease).toFixed(3)
  })

  return base
}

export async function getFarmingUser(userId: string, ifExistStoreInMemory = false) {
  const user = batcher.get(userId)
  console.log(user, 'user')
  if (user) return user

  const key = createRedisKey('farmingUser', userId)
  console.log(key)
  const redisRes = await redis.json.get(key, '$') as FarmingUser[] | null
  console.log(redisRes, 'redisRes')
  if (!redisRes || redisRes.length === 0) return

  const fuser = redisRes[0]!
  if (ifExistStoreInMemory) batcher.createOrUpdate({ ...fuser, onlyMemory: true })

  return fuser
}

export async function getOrCreateFarmingUser(o: {
  farmingResponse: FarmingResponse
  user: User
}): Promise<FarmingUser> {
  const { farmingResponse, user } = o
  const key = createRedisKey('farmingUser', user.id)
  let farmingUser = batcher.get(user.id) ?? (await redis.json.get(key, '$') as [SyncableFarmingUser])?.[0]

  // if we have a user we just update it
  console.log('farmingUser gg', farmingUser)
  if (farmingUser) {
    farmingUser.total += farmingResponse.total
    farmingResponse.items.forEach((item) => {
      if (farmingUser.individual?.[item.name]) farmingUser.individual[item.name] += item.amount
      else farmingUser.individual[item.name] = item.amount
    })

    farmingUser.totalWeight += farmingResponse.totalWeight
    farmingUser.onlyMemory = false

    batcher.createOrUpdate(farmingUser)

    console.log('farmingUser 2', farmingUser)

    return farmingUser
  }

  // if we don't have a user we create one
  farmingUser = {
    id: user.id,
    totalWeight: farmingResponse.totalWeight,
    individual: farmingResponse.items.reduce(
      (acc, curr) => {
        acc[curr.name] = curr.amount
        return acc
      },
      {} as Record<Crop, number>,
    ),
    total: farmingResponse.total,
  }

  batcher.createOrUpdate(farmingUser)

  console.log('farmingUser 3', farmingUser)

  return farmingUser
}

function parseFoodBasedOnProbability(): {
  guaranteed: NamedFood[]
  other: NamedFood[]
} {
  const guaranteed: NamedFood[] = []
  const other: NamedFood[] = []

  Object.entries(dataFood).forEach(([name, food]) => {
    if (typeof food == 'string') return

    const e = food.probability === 0 ? guaranteed : other
    e.push({ ...(food as Food), name: name as Crop })
  })

  return {
    guaranteed,
    other,
  }
}
export function calculateChances(food: NamedFood[]): NamedFoodWithChance[] {
  const probabilityTotalAmount = food.reduce((acc, cur) => {
    acc += cur.probability
    return acc
  }, 0)

  const chancePerItem = 1 / probabilityTotalAmount

  const probabilityChances = food.map((food) => {
    return {
      ...food,
      chance: food.probability * chancePerItem,
    }
  })

  return probabilityChances
}

export function parseAllFoodItemsWithChances() {
  const probabilityBased = parseFoodBasedOnProbability()
  const withChances = calculateChances(probabilityBased.other)
  withChances.push(
    ...probabilityBased.guaranteed.map(x => ({ ...x, chance: -1 })),
  )

  return withChances
}

export function doFarm({
  allItems,
}: {
  stats: CalculatedPlayerStats
  rarity: Rarity
  allItems: ReturnType<typeof parseAllFoodItemsWithChances>
}) {
  const roll = Math.random()
  const finalItems = allItems.filter((food) => {
    const invertedChance = 1 - food.chance
    return food.chance === -1 || roll > invertedChance
  })

  const withAmounts = finalItems.map((food) => {
    const amount = randomNumber(1, food.maxItems)
    return {
      ...food,
      amount,
    }
  })

  return {
    items: withAmounts,
    total: withAmounts.reduce((acc, curr) => acc + curr.amount, 0),
    totalWeight: withAmounts.reduce((acc, curr) => acc + curr.amount * curr.weight, 0),
  }
}
