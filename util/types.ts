import { assetHub, polkadot } from "@polkadot-api/descriptors";
import type { TypedApi } from "polkadot-api";

export const DESCRIPTORS = {
  assetHub,
  polkadot,
} as const;

type Descriptors = typeof DESCRIPTORS;

export type ChainId = keyof Descriptors;

export type Api<Id extends ChainId> = TypedApi<Descriptors[Id]>;
