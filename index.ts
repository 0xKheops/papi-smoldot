import {
  MultiAddress,
  PolkadotRuntimeOriginCaller,
} from "@polkadot-api/descriptors";
import { alice, bob } from "./util/accounts";
import { getApi, type ApiProviderMode } from "./util/getApi";
import type { ChainId } from "./util/types";

const testTransferDryRun = async (chainId: ChainId, mode: ApiProviderMode) => {
  const key = `[${chainId} - ${mode}]`;
  console.time(key);
  try {
    const api = await getApi(chainId as "assetHub", mode);

    const balance = await api.query.System.Account.getValue(alice.address, {
      at: "best",
    });

    console.log(`${key} Alice balance : ${balance.data.free}`);

    const xfer = api.tx.Balances.transfer_keep_alive({
      dest: MultiAddress.Id(bob.address),
      value: 1000000000000n,
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
      `${key} Dry run completed. success:${dryRun.success} result:${
        dryRun.success && dryRun.value.execution_result.success
      } events:${dryRun.success && dryRun.value.emitted_events.length}`
    );
  } catch (err) {
    console.error(`${key} Failed to dry run`, err);
  } finally {
    console.timeEnd(key);
  }
};

await Promise.all([
  testTransferDryRun("polkadot", "normal"),
  testTransferDryRun("polkadot", "withPolkadotSdkCompat"),
  testTransferDryRun("polkadot", "smoldot"),
]);

process.exit(0);
