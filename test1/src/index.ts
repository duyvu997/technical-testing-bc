import { Alchemy, Network } from 'alchemy-sdk';

import { CovalentClient } from '@covalenthq/client-sdk';
import EthDater from 'ethereum-block-by-date';
import { Worker } from 'worker_threads';

interface TokenHolder {
  address: string;
}

interface TokenHolderResponse {
  items: TokenHolder[];
  pagination: {
    has_more: boolean;
    page_number: number;
    page_size: number;
    total_count: number;
  };
}
const config = {
  apiKey: 'enYSTXGJ57ClqmCq4xwegx926oM8INC-',
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);
const dater = new EthDater(alchemy.core as any);

const parseDateInput = (dateInput: string | number): string => {
  if (typeof dateInput === 'number') {
    return new Date(dateInput * 1000).toISOString().split('T')[0];
  } else {
    return new Date(dateInput).toISOString().split('T')[0];
  }
};

const fetchTokenHolders = async (
  client: CovalentClient,
  date: string
): Promise<TokenHolder[]> => {
  let tokenHolders: TokenHolder[] = [];
  let pageNumber = 0;
  let pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const resp =
      await client.BalanceService.getTokenHoldersV2ForTokenAddressByPage(
        'eth-mainnet',
        '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        { date, pageSize, pageNumber }
      );

    const response = resp.data as TokenHolderResponse;

    tokenHolders = tokenHolders.concat(response?.items || []);

    hasMore = response.pagination.has_more;
    pageNumber++;
  }

  return tokenHolders;
};

const divideIntoParts = <T>(arr: T[], parts: number): T[][] => {
  const divided: T[][] = [];
  const chunkSize = Math.ceil(arr.length / parts);

  for (let i = 0; i < arr.length; i += chunkSize) {
    const part = arr.slice(i, i + chunkSize);
    divided.push(part);
  }

  return divided;
};

async function getBlockNumberByEpochTime(epochTime: any) {
  const timestamp = new Date(epochTime).getTime();
  const block = await dater.getDate(timestamp);
  console.log(`Block at time ${epochTime}: ${block.block}`);
  return block.block;
}

const runWorkers = async (
  dateInput: string | number,
  numWorkers: number
): Promise<string[]> => {
  const client = new CovalentClient('cqt_rQQ6gxxcMpbrYtHYYPXpgKwwKP7H');
  const formattedDate = parseDateInput(dateInput);

  try {
    console.time('fetchTokenHolders');
    const tokenHolders = await fetchTokenHolders(client, formattedDate);
    console.timeEnd('fetchTokenHolders');
    console.log(`Fetched ${tokenHolders.length} token holders`);

    const block = await getBlockNumberByEpochTime(dateInput);

    console.time('fetchBalances');
    const dividedTokenHolders = divideIntoParts(
      tokenHolders.slice(0, 100),
      numWorkers
    );

    console.log(`Divided token holders into ${numWorkers} parts`);

    const workerPromises = dividedTokenHolders.map((part, index) => {
      return new Promise<string[]>((resolve, reject) => {
        const worker = new Worker('./src/worker.js', {
          workerData: {
            tokenHolders: part,
            block,
          },
        });

        worker.on('message', (message) => {
          if (message) {
            console.log(`Worker ${index + 1} completed. Balances:`, message);
            resolve(message);
          } else if (message.error) {
            console.error(`Worker ${index + 1} error:`, message.error);
            reject(message.error);
          }
        });

        worker.on('error', (error) => {
          console.error(`Worker ${index + 1} encountered an error:`, error);
          reject(error);
        });

        worker.on('exit', (code) => {
          if (code !== 0) {
            console.error(`Worker ${index + 1} exited with code ${code}`);
            reject(`Worker ${index + 1} exited with code ${code}`);
          }
        });
      });
    });

    const workerResults = await Promise.all(workerPromises);

    const allBalances = workerResults.flat();

    const totalEthBalance = allBalances.reduce(
      (total, balance) => total + parseFloat(balance),
      0
    );

    console.log(`Total ETH balance: ${totalEthBalance} ETH`);
    console.timeEnd('fetchBalances');
    return allBalances;
  } catch (error) {
    console.error('Main thread encountered an error:', error);
    return [];
  }
};

runWorkers('2024-04-02', 1).catch((error) => console.error(error));
