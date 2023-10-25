import { availablePets, getRandomFromArray, greedyRound, petUpgrades, randomNumber, rarities, shopItemTypes, shuffledArray } from 'shared'
import type { Rarity, ShopItem, ShopItemType } from 'shared'
import { upgrades } from 'shared/data'

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

export function generateShopItems(amount = 5): ShopItem[] {
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
