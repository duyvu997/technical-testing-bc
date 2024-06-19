import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { parentPort, workerData } from 'worker_threads';

const config = {
  apiKey: 'enYSTXGJ57ClqmCq4xwegx926oM8INC-',
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

interface WorkerData {
  tokenHolders: { address: string }[];
  block: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchBalances(owners: { address: string }[], block: number): Promise<string> {
  let totalBalance = BigInt(0);

  const processBatch = async (batch: { address: string }[]) => {
    const batchPromises = batch.map(async (owner) => {
      try {
        const balance = await alchemy.core.getBalance(owner.address, block);
        console.log(`Balance of ${owner.address} at block ${block}: ${balance} ETH`);
        return BigInt(balance.toString());
      } catch (error) {
        console.error(`Error fetching balance for ${owner.address}:`, error);
        return BigInt(0);
      }
    });

    const batchResults = await Promise.all(batchPromises);
    return batchResults.reduce((acc, balance) => acc + balance, BigInt(0));
  };

  // Split owners into batches of 5 for parallel processing Alchemy rate limits
  const batches = [];
  for (let i = 0; i < owners.length; i += 5) {
    batches.push(owners.slice(i, i + 5));
  }

  for (const batch of batches) {
    const batchTotal = await processBatch(batch);
    totalBalance += batchTotal;
    await sleep(1000);
  }

  return Utils.formatEther(totalBalance.toString());
}

(async () => {
  const { tokenHolders, block } = workerData as WorkerData;
  const result = await fetchBalances(tokenHolders, block);
  parentPort?.postMessage(result);
})();
