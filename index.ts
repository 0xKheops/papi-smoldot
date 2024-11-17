import {
  MultiAddress,
  PolkadotRuntimeOriginCaller,
} from "@polkadot-api/descriptors";
import { alice, bob } from "./util/accounts";
import { getApi, type ApiProviderMode } from "./util/getApi";
import type { ChainId } from "./util/types";

const testTransferDryRun = async (chainId: ChainId, mode: ApiProviderMode) => {
  const timeKey = `dryRun - ${chainId} - ${mode}`;
  console.time(timeKey);
  try {
    const api = await getApi(chainId as "assetHub", mode);

    const xfer = api.tx.Balances.transfer_all({
      dest: MultiAddress.Id(bob.address),
      keep_alive: true,
    });

    const dryRun = await api.apis.DryRunApi.dry_run_call(
      PolkadotRuntimeOriginCaller.system({
        type: "Signed",
        value: alice.address,
      }),
      xfer.decodedCall,
      { at: "best" }
    );

    console.log(
      `Dry run on ${chainId} with ${mode} mode. success:${
        dryRun.success
      } result:${dryRun.success && dryRun.value.execution_result.success}`
    );
  } catch (err) {
    console.error(`Failed to dry run on ${chainId} with ${mode} mode`, err);
  } finally {
    console.timeEnd(timeKey);
  }
};

await Promise.all([
  testTransferDryRun("polkadot", "normal"),
  testTransferDryRun("polkadot", "withPolkadotSdkCompat"),
  testTransferDryRun("polkadot", "smoldot"),
]);

process.exit(0);
