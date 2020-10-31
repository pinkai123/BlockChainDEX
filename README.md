# How to deploy DEX dApp

## For Testnet(Ropsten)

Extract the file and open to ./BlockChainDEX/truffle-config.js

Comment out line 22 and change to your infuraKey
```sh
const infuraKey = "af0159....";
```
Open ./BlockChainDEX/.secret and add in your mnemonic

Compile and migrate the code

```sh
npm compile
npm migrate --reset --network ropsten
```
Open ./BlockChainDEX/webapp/dex.js

Go to line 14 and change to your own Ropsten endpoint
```sh
const infuraWSS = `wss://ropsten.infura.io/ws/v3/...`;
```
Go to line 26 and 27 and add in your own public and private key(Do save your private key as an environment variable)

```sh
const addressFrom = '0x791F8...'
const privKey = process.env.privateKey
```
Go to line 20 to change to the new DEX contract address you have compiled above
```sh
export const DexContractAddress = "0x3DDBc4f3396a3C43206983aC100Ad4cAc1d48C8A"; 
```

Start the web app
```sh
npm start
```
I have included 2 ERC20 Token sol in the contract folder. Please feel free to use them to test out the DEX.

## For Ganache

Extract the file and open to ./BlockChainDEX/truffle-config.js

Comment out line 61 to 68 and comment in line 45 to 49
```sh
development: {
  host: "127.0.0.1",     // Localhost (default: none)
  port: 7545,            // Standard Ethereum port (default: none)
  network_id: "*",       // Any network (default: none)
},
```
Compile and migrate the code

```sh
npm compile
npm migrate --reset 
```
Open ./BlockChainDEX/webapp/dex.js

Comment out line 14 to 18

Comment in line 24
```sh
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
```
Go to line 26 and 27 and add in your own public and private key

```sh
const addressFrom = '0x791F...'
const privKey = process.env.privateKey
```

Go to line 20 to change to the new DEX contract address you have compiled above
```sh
export const DexContractAddress = "0x3DDBc4f3396a3C43206983aC100Ad4cAc1d48C8A"; 
```

Start the web app
```sh
npm start
```
