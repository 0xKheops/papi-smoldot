import { createClient } from "polkadot-api";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getWsProvider } from "polkadot-api/ws-provider/node";
import papiConfig from "../.papi/polkadot-api.json";
import { start } from "polkadot-api/smoldot";
import { DESCRIPTORS, type Api, type ChainId } from "./types";
import { getChainSpec } from "./getChainSpec";
import { getSmProvider } from "polkadot-api/sm-provider";

const smoldot = start();

export type ApiProviderMode = "normal" | "withPolkadotSdkCompat" | "smoldot";

const getWebSocketProvider = async (chainId: ChainId) => {
  const wsUrl = papiConfig.entries[chainId]?.wsUrl as string;
  if (!wsUrl) throw new Error(`wsUrl not found for chainId: ${chainId}`);
  return getWsProvider(wsUrl);
};

const PARA_TO_RELAY: Record<ChainId, ChainId | null> = {
  assetHub: "polkadot",
  polkadot: null,
};

const getSmoldotProvider = async (chainId: ChainId) => {
  if (PARA_TO_RELAY[chainId]) {
    const relaySpecs = await getChainSpec(PARA_TO_RELAY[chainId]);
    const paraSpecs = await getChainSpec(chainId);

    const relay = await smoldot.addChain({ chainSpec: relaySpecs });

    return getSmProvider(
      smoldot.addChain({ chainSpec: paraSpecs, potentialRelayChains: [relay] })
    );
  }

  const chainSpec = await getChainSpec(chainId);
  return getSmProvider(smoldot.addChain({ chainSpec }));
};

const getClient = async (chainId: ChainId, mode: ApiProviderMode) => {
  switch (mode) {
    case "smoldot": {
      const provider = await getSmoldotProvider(chainId);
      return createClient(provider);
    }
    case "normal": {
      const provider = await getWebSocketProvider(chainId);
      return createClient(provider);
    }
    case "withPolkadotSdkCompat": {
      const provider = await getWebSocketProvider(chainId);
      return createClient(withPolkadotSdkCompat(provider));
    }
  }
};

export const getApi = async <Id extends ChainId>(
  chainId: Id,
  mode: ApiProviderMode
): Promise<Api<Id>> => {
  const client = await getClient(chainId, mode);

  return client.getTypedApi(DESCRIPTORS[chainId]) as Api<Id>;
};
