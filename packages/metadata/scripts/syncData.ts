import fs from 'node:fs'

import { availablePerks, availablePets, crops, MaybePromise, petUpgrades, playerStats, rarities } from 'shared'

function writeToFile(path: string, data: any) {
  return Bun.write(path, JSON.stringify(data, null, 2))
}

async function syncSchema({
  type: fileName,
  data,
  definition,
}: {
  type: 'food' | 'pets' | 'upgrades'
  data: any[]
  definition: string
}) {
  const path = `schemas/${fileName}.json`
  const schemaBefore = await Bun.file(path).json()
  const newSchema = {
    ...schemaBefore,
    properties: {
      ...data.reduce((acc, item) => {
        acc[item] = { $ref: `#/definitions/${definition}` }
        return acc
      }, {}),
    },
    required: data,
  }

  await writeToFile(path, newSchema)
}

type AnyFn = (...args: any) => MaybePromise<any>

const enumPath = (name: string) => `enums/${name}.json`

type Step =
  | 'backup'
  | 'syncPerks'
  | 'syncRarities'
  | 'syncStats'
  | 'syncFoodSchema'
  | 'syncPetsSchema'
  | 'syncUpgradesSchema'
const actions: Record<Step, AnyFn[]> = {
  backup: [
    () => fs.cpSync('data', `data-backup-${Date.now()}`, { recursive: true }),
  ],
  syncPerks: [() => writeToFile(enumPath('perks'), { enum: availablePerks })],
  syncRarities: [() => writeToFile(enumPath('rarities'), { enum: rarities })],
  syncStats: [() => writeToFile(enumPath('stats'), { enum: playerStats })],
  syncFoodSchema: [
    () =>
      syncSchema({
        type: 'food',
        data: [...crops],
        definition: 'food',
      }),
  ],
  syncPetsSchema: [
    () =>
      syncSchema({ type: 'pets', data: [...availablePets], definition: 'pet' }),
  ],
  syncUpgradesSchema: [
    () =>
      syncSchema({
        type: 'upgrades',
        data: [...petUpgrades],
        definition: 'upgrade',
      }),
  ],
};

(async () => {
  const start = performance.now()

  let perf = 0
  let i = 1

  // start applying actions
  for (const _step in actions) {
    const step = _step as keyof typeof actions
    console.log(`[${i}] ${step}...`)

    perf = performance.now()
    i++

    for (const action of actions[step]) {
      try {
        await action()
      }
      catch (err) {
        console.error(err)
        process.exit(1)
      }
    }

    console.log(`Done in ${performance.now() - perf}ms\n`)
  }

  console.log(`All tasks done in ${performance.now() - start}ms\n`)
})()
