import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers";
import { AccountId } from "polkadot-api";
import { getPolkadotSigner } from "polkadot-api/signer";

export const getAccount = (
  mnemonic: string,
  derivationPath: string,
  label: string = derivationPath
) => {
  const entropy = mnemonicToEntropy(mnemonic);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);

  const keyPair = derive(derivationPath);
  return {
    label,
    address: AccountId().dec(keyPair.publicKey),
    signer: getPolkadotSigner(keyPair.publicKey, "Sr25519", keyPair.sign),
  };
};

export const getDevAccount = (
  derivationPath: string,
  label: string = derivationPath
) => getAccount(DEV_PHRASE, derivationPath, label);

export type Account = ReturnType<typeof getDevAccount>;

export const alice = getDevAccount("//Alice", "Alice");
export const bob = getDevAccount("//Bob", "Bob");
export const charlie = getDevAccount("//Charlie", "Charlie");
export const dave = getDevAccount("//Dave", "Dave");
export const eve = getDevAccount("//Eve", "Eve");
export const ferdie = getDevAccount("//Ferdie", "Ferdie");
