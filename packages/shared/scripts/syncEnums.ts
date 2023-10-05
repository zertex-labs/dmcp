import { rarities, availableBonuses, availablePets } from '../types';

const sync = (path: string, data: any) =>
  Bun.write(path, JSON.stringify(data, null, 2));

(async () => {
  const start = performance.now();

  let perf = 0;
  let i = 1;

  {
    console.log(`[${i}] Syncing bonuses...`);
    (perf = performance.now()), i++;
    await sync('src/data/enums/bonuses.json', { enum: availableBonuses });

    console.log('Synced bonuses in', performance.now() - perf, 'ms\n');
  }

  {
    console.log(`[${i}] Syncing rarities...`);
    (perf = performance.now()), i++;
    await sync('src/data/enums/rarities.json', { enum: rarities });

    console.log('Synced rarities in', performance.now() - perf, 'ms\n');
  }

  {
    console.log(`[${i}] Syncing pet keys... (${availablePets.join(', ')})`);
    (perf = performance.now()), i++;
    const schemaBefore = await Bun.file('src/data/schemas/pets.json').json();

    const newSchema = {
      ...schemaBefore,
      properties: {
        ...schemaBefore.properties,
        ...availablePets.reduce((acc, pet) => {
          acc[pet] = { $ref: '#/definitions/pet' };
          return acc;
        }, {})
      },
      required: [...new Set([...schemaBefore.required, ...availablePets])]
    };

    await sync('src/data/schemas/pets.json', newSchema);

    console.log('Synced pet keys in', performance.now() - perf, 'ms\n');
  }

  console.log(
    'Syncing enums done in',
    performance.now() - start,
    "ms. (if the types don't update try resting the extension/ts server)"
  );
})();
