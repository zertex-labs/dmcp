import type { Rarity, Shop, ShopItem, ShopItemType } from 'shared'
import { availablePets, getRandomFromArray, greedyRound, petUpgrades, randomNumber, rarities, shopItemTypes, shuffledArray } from 'shared'
import { upgrades } from 'shared/data'
import { createRedisKey, redis } from '../../redis'
import { error, log } from '../../utils'

const maxPets = 2
const chances: Record<ShopItemType, number> = {
  pet: 0.1,
  upgrade: 0.9,
}

if (Object.values(chances).reduce((acc, x) => acc += x, 0) !== 1) throw new Error(`Chances must add up to 1. ${chances}`)

function weightedRandom(items: { type: ShopItemType; chance: number }[]) {
  const total = items.reduce((acc, item) => acc + item.chance, 0)
  let random = Math.random() * total

  return items.find((item) => {
    random -= item.chance
    return random <= 0
  })!
}

const priceRanges = {
  pet: {
    COMMON: [1_000, 5_000],
    UNCOMMON: [5_000, 10_000],
    EPIC: [10_000, 25_000],
    LEGENDARY: [25_000, 50_000],
    MYTHICAL: [50_000, 100_000],
  },
} satisfies {
  pet: Record<Rarity, [min: number, max: number]>
}

export function generateShopItems(amount = 6): ShopItem[] {
  // equal chance for all type
  const typesWithChances = shopItemTypes.map(type => ({ type, chance: chances[type] }))
  let types = ['pet'] as ShopItemType[]

  for (let i = 0; i < amount - 1; i++) {
    const petTotal = types.filter(type => type === 'pet').length
    if (petTotal >= maxPets) {
      // if we reach max pets, just fill the rest with upgrades
      types.push(...Array(amount - types.length).fill('upgrade'))
      break
    }
    else {
      const { type } = weightedRandom(typesWithChances)
      types.push(type)
    }
  }

  for (let i = 0; i < randomNumber(1, 5); i++)
    types = shuffledArray(types)

  return types.map((type) => {
    console.log(type)
    if (type === 'pet') {
      const rarity = getRandomFromArray(rarities)

      return {
        type,
        key: getRandomFromArray(availablePets),
        rarity,
        price: greedyRound(randomNumber(...priceRanges.pet[rarity]), 2500),
      } satisfies ShopItem
    }

    const upgrade = getRandomFromArray(petUpgrades)
    return {
      type,
      key: upgrade,
      price: upgrades[upgrade].price,
    } satisfies ShopItem
  })
}

export async function getShop(date: string): Promise<Shop | undefined> {
  const key = createRedisKey('shop', date)
  let shop = await redis.json.get(key)

  if (!shop) {
    shop = {
      items: generateShopItems(),
      generatedAt: new Date().toISOString(),
    }

    try {
      await redis.json.set(key, '$', shop as any)

      // expire in 1 week
      const [serverTime] = await redis.time()
      const unix = (serverTime + (7 * 24 * 60 * 60)) * 1000
      redis.pexpireat(key, unix).then((res) => { res === 1 && log(`Set shop ${date} to expire at ${new Date(unix)}(1 week);`) })
    }
    catch (e: any) {
      error(e, `trying to json.set shop ${date}`)
    }
  }

  return shop
}
