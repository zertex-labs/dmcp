import {
  rarities,
  availableBonuses,
  availablePets,
  availableFoods
} from '../types';

const sync = (path: string, data: any) =>
  Bun.write(path, JSON.stringify(data, null, 2));

(async () => {
  const start = performance.now();

  let perf = 0;
  let i = 1;

  {
    console.log(`[${i}] Syncing bonuses...`);
    (perf = performance.now()), i++;
    await sync('data/enums/bonuses.json', { enum: availableBonuses });

    console.log('Synced bonuses in', performance.now() - perf, 'ms\n');
  }

  {
    console.log(`[${i}] Syncing rarities...`);
    (perf = performance.now()), i++;
    await sync('data/enums/rarities.json', { enum: rarities });

    console.log('Synced rarities in', performance.now() - perf, 'ms\n');
  }

  {
    console.log(
      `[${i}] Syncing pet property keys... (${availablePets.join(', ')})`
    );
    (perf = performance.now()), i++;
    const schemaBefore = await Bun.file('data/schemas/pets.json').json();

    const newSchema = {
      ...schemaBefore,
      properties: {
        ...availablePets.reduce((acc, pet) => {
          acc[pet] = { $ref: '#/definitions/pet' };
          return acc;
        }, {})
      },
      required: availablePets
    };

    await sync('data/schemas/pets.json', newSchema);

    console.log(
      'Synced pet property keys in',
      performance.now() - perf,
      'ms\n'
    );
  }

  {
    // sync food properties
    console.log(`[${i}] Syncing food properties...`);
    (perf = performance.now()), i++;
    const schemaBefore = await Bun.file('data/schemas/food.json').json();
    const foods = availableFoods.map((food) => food.toUpperCase());

    const newSchema = {
      ...schemaBefore,
      properties: {
        ...foods.reduce((acc, food) => {
          acc[food] = { $ref: '#/definitions/food' };
          return acc;
        }, {})
      },
      required: foods
    };

    await sync('data/schemas/food.json', newSchema);

    console.log(
      'Synced food property keys in',
      performance.now() - perf,
      'ms\n'
    );
  }

  console.log(
    'Syncing enums done in',
    performance.now() - start,
    "ms. (if the types don't update try resting the extension/ts server)"
  );
})();
