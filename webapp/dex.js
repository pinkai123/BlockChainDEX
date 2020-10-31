// import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";
let Web3 = require("web3");
const Tx = require('ethereumjs-tx')

const fs = require('fs');
const { get } = require("http");
const DEX = JSON.parse(fs.readFileSync('../build/contracts/DEX.json', 'utf8'));
const ERC20 = JSON.parse(fs.readFileSync('../build/contracts/ERC20.json', 'utf8'));

//const { DEX } = require("../build/contracts/DEX.json");

const infuraWSS = `wss://ropsten.infura.io/ws/v3/...`;

const web3 = new Web3(
  Web3.currentProvider || new Web3.providers.WebsocketProvider(infuraWSS)
);

export const DexContractAddress = "0x3DDBc4f3396a3C43206983aC100Ad4cAc1d48C8A"; // PLEASE CHANGE IT TO YOURS
export const Testnet = "Ropsten"; // PLEASE CHANGE IT TO YOURS

let provider;
//const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
// the address that will send the test transaction
const addressFrom = '0x791F8...'
const privKey = process.env.privateKey
// the exchange contract address
const addressTo = DexContractAddress;
const dex = new web3.eth.Contract(
  DEX.abi,
  addressTo
);
let PairArray = [];

async function sleep(milliseconds){
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function Approve(amount,tokenA_symbol,tokenB_symbol,token_address){
  let symbolpair = await getsymbolPair(tokenA_symbol,tokenB_symbol);
  let delegate = await dex.methods.getAddress(web3.utils.fromAscii(symbolpair)).call();
  console.log(delegate);
  provider = await detectEthereumProvider();
  // Using MetaMask API to send transaction
  //
  // please read: https://docs.metamask.io/guide/ethereum-provider.html#ethereum-provider-api
  if (provider) {
    // From now on, this should always be true:
    // provider === window.ethereum
    console.log(ethereum.selectedAddress);
    const txHash = await ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: ethereum.selectedAddress,
          to: token_address,
          value: 0,
          data: web3.eth.abi.encodeFunctionCall(
            {
              name: "approve",
              type: "function",
              inputs: 
              [{
                name: "spender",
                type: "address"
              },
              {
                name: "amount",
                type: "uint256" 
              }]
            },
            [delegate,amount]
          ), // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html#encodefunctioncall
        },
      ],
    });
    console.log(txHash);
    let transactionReceipt = null
        while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
            transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
            console.log(transactionReceipt);
            await sleep(10000);
        }
        console.log("Got the Approve transaction receipt: ", transactionReceipt)
    return { Result: "Done" };
  } else {
    console.log("Please install MetaMask!");
    return { Result: "NotDone" };
  }
}


// Signs the given transaction data and sends it.
async function sendSigned(txData, cb) {
  const privateKey = new Buffer.from(privKey.toString(),'hex')
  const transaction = new Tx(txData)
  transaction.sign(privateKey)
  const serializedTx = transaction.serialize().toString('hex')
  web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
}

async function ConstAndSend(encodedABI) {
  let Result = null;
  web3.eth.getTransactionCount(addressFrom).then(txCount => {

    // construct the transaction data
    const txData = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(6000000),
      gasPrice: web3.utils.toHex(10000000000), // 10 Gwei
      to: addressTo,
      from: addressFrom,
      data: encodedABI
    }  
    sendSigned(txData, function(err, result) {
      if (err) return console.log('error', err)
      console.log('sent', result)
      Result = result
    
  })
  });
  let transactionReceipt = null
  while (transactionReceipt == null || Result == null) { // Waiting expectedBlockTime until the transaction is mined
      transactionReceipt = await web3.eth.getTransactionReceipt(Result);
      console.log(transactionReceipt);
      await sleep(10000);
  }
  console.log("Got the other transaction receipt: ", transactionReceipt)
}

export const getPairArray = async () => {
  let NewArray = [];
  NewArray = await dex.methods.getPairArray().call();
  for (let i=0; i<NewArray.length;i++){
    console.log(web3.utils.toAscii(NewArray[i]));
    PairArray[i] = await web3.utils.toAscii(NewArray[i]).replace(/[^A-Z/]/g,"");
  }
  return PairArray;
}

export const getTxnList = async () => {
  let idList = [];
  let OrderList = [];
  let percentage;
  console.log(PairArray.length);
  if (provider){
    for (let i=0; i<PairArray.length;i++){
      idList = await dex.methods.getidList(web3.utils.fromAscii(PairArray[i]),ethereum.selectedAddress).call();
      console.log(idList);
      for (let j=0; j<idList.length;j++){
        percentage = await dex.methods.getPercentage(web3.utils.fromAscii(PairArray[i]),idList[j]).call();
        OrderList.push({"symbolPair":PairArray[i],"id":idList[j],"percentage":percentage});
      }
      console.log(OrderList[0]);
    }
  }
  return OrderList;
}

async function getsymbolPair(tokenA_symbol,tokenB_symbol){
   let symbolpair = tokenA_symbol.concat("/",tokenB_symbol);
   return symbolpair;
}

async function getTokenA_address(tokenA_symbol,tokenB_symbol){
  let pair = await getsymbolPair(tokenA_symbol,tokenB_symbol);
  console.log(pair);
  let tokenA_address = await dex.methods.getTokenA(web3.utils.fromAscii(pair)).call();
  console.log(tokenA_address);
  return tokenA_address;
}

async function getTokenB_address(tokenA_symbol,tokenB_symbol){
  let pair = await getsymbolPair(tokenA_symbol,tokenB_symbol);
  console.log(pair);
  let tokenB_address = await dex.methods.getTokenB(web3.utils.fromAscii(pair)).call();
  console.log(tokenB_address);
  return tokenB_address;
}

export const addPair = async (tokenA_symbol,tokenB_symbol,tokenA_address, tokenB_address) => {
  let symbolpair = await getsymbolPair(tokenA_symbol,tokenB_symbol);
  console.log(symbolpair);
  let size = await dex.methods.getSize().call();
  console.log(size);
  console.log(tokenA_address, tokenB_address);
  const tx = await dex.methods.addPair(
    web3.utils.fromAscii(symbolpair),
    tokenA_address,
    tokenB_address);
  const encodedABI = tx.encodeABI();
  await ConstAndSend(encodedABI);
  size = await dex.methods.getSize().call();
  console.log(size);
  return "Pair added";
};

 export const addOrder = async (tokenA_symbol,tokenB_symbol,tokenA_amount,tokenB_amount,buy) => {
  let token_address,amount;
  if (buy){
    token_address = await getTokenB_address(tokenA_symbol,tokenB_symbol);
    amount = tokenB_amount;
  }
  else{
    token_address = await getTokenA_address(tokenA_symbol,tokenB_symbol);
    console.log(token_address);
    amount = tokenA_amount;
  }
  console.log(token_address,amount);
  let result = await Approve(amount,tokenA_symbol,tokenB_symbol,token_address);
  console.log(result);
  if (provider) {

    let symbolpair = await getsymbolPair(tokenA_symbol,tokenB_symbol);
    const tx = dex.methods.addOrder(web3.utils.fromAscii(symbolpair),ethereum.selectedAddress,tokenA_amount,tokenB_amount,buy);
    const encodedABI = tx.encodeABI();
    await ConstAndSend(encodedABI);
    console.log(tx);
    
    return "Order added";
  }
 };