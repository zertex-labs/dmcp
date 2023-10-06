import {
  rarities,
  availablePerks,
  availablePets,
  availableFoods,
  petUpgrades
} from '../types';

const dataEntries = ['food', 'perks', 'pets', 'upgrades'] as const;
type DataEntry = (typeof dataEntries)[number];
type Data = Readonly<any[]> | any[];

const entryToKeys = {
  food: availableFoods,
  perks: availablePerks,
  pets: availablePets,
  upgrades: petUpgrades
} satisfies Record<DataEntry, Data>;

const validate = async (entry: DataEntry, data: Data) => {
  const file = await Bun.file(`data/${entry}.json`).json();

  const missingKeys = data.filter((key) =>
    file?.data ? !file.data?.[key] : !file?.[key]
  );

  if (missingKeys.length) {
    console.error(`[${entry.toUpperCase()}] Missing keys:`, missingKeys);
  }

  return !missingKeys.length;
};

(async () => {
  const valid = await Promise.all(
    dataEntries.map((entry) => validate(entry, entryToKeys[entry]))
  );
  if (valid.every((v) => v)) {
    console.log('All data is valid!');
  }
})();
