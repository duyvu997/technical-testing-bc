### Requirements
Bored Ape Yacht Club (BAYC) is the current bluechip NFT project on Ethereum Blockchain.  
- Blockchain: Ethereum
- Contract address: 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d
- Website: https://boredapeyachtclub.com/#/    


Create a program using node.js/Java to get the total ETH value in the crypto wallets of all holders at any time.       


The program should take epoch time as the only input, and output the ETH value.    

### How to run 


#### step 1
modify the input date in `index.ts`
```
runWorkers('2024-04-02', 1).catch((error) => console.error(error));
```
replace the date `2024-04-02` 

current i set the code to just get 100

#### step 2
install deps
```
npm install
```

#### step 3
```
npm start
```

### Summary solution
I used both 3rd for this test: Alchemy(free plan) and Covalent(free plan) 
- use Covalent to fetch all holder's wallet at specific time/date. 
- use node's worker to split the holder into multiple parts then use Alchemy to get ETH balance at block number fit with the input time. (Cause Alchemy return the eth balance faster - in ms). 
- sum all eth balances

#### cons 
- use 3rd -> rate limit with free plan, 5req/s -> getting all holder's balances (~5k) takes around 30mins. Currently, I just set the logic to sum 100 addresses in `index.ts`
```
    const dividedTokenHolders = divideIntoParts(
        tokenHolders.slice(0, 100),
        numWorkers
    );
```   
let remove the slice logic to get **all** wallet balances
 ```
    const dividedTokenHolders = divideIntoParts(
        tokenHolders,
        numWorkers
    );
``` 