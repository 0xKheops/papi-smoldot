import { getCachedPromise } from "./getCachedPromise";
import type { ChainId } from "./types";

const loadChainSpec = async (chainId: ChainId) => {
  try {
    switch (chainId) {
      case "polkadot":
        return (await import("polkadot-api/chains/polkadot")).chainSpec;

      case "assetHub":
        return (await import("polkadot-api/chains/polkadot_asset_hub"))
          .chainSpec;
      default:
        throw new Error(`Unknown chain: ${chainId}`);
    }
  } catch (cause) {
    throw new Error(`Failed to load chain spec for chain ${chainId}`, {
      cause,
    });
  }
};

export const getChainSpec = async (chainId: ChainId) => {
  return getCachedPromise("getChainSpec", chainId, () =>
    loadChainSpec(chainId)
  );
};
