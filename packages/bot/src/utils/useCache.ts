import { PublicKey } from '@solana/web3.js';
import { Mission } from '@solport/solana-taiyo-missions';
import { PilotWithMetadata } from '../types';
import { UsableClient } from '../client';

type CacheReturnTypes = {
  mission: Mission;
  pilot: PilotWithMetadata;
};

type UseCache = ReturnType<typeof __makeStore>;

let store: UseCache;

export function useCache(): UseCache {
  if (!store) store = __makeStore();

  return store;
}

function __makeStore() {
  let cachedMissions: Record<string, Mission> = {};
  let cachedPilots: Record<string, PilotWithMetadata> = {};
  let client: UsableClient;

  async function get<K extends keyof CacheReturnTypes>(
    type: K,
    pubkey: PublicKey,
    client: UsableClient
  ): Promise<CacheReturnTypes[K]> {
    switch (type) {
      case 'mission':
        return getActiveMissions() as any;
      case 'pilot':
        return getPilot(pubkey) as any;
      default:
        throw Error('Invalid type');
    }
  }

  async function getActiveMissions(): Promise<CacheReturnTypes['mission']> {
    let missions = client.program.fetchAllMissions();
  }

  async function getPilot(mint: PublicKey): Promise<PilotWithMetadata> {
    return Promise.resolve({} as PilotWithMetadata);
  }
  return { getMission: getActiveMissions };
}
