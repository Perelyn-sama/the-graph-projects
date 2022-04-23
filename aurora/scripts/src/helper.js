const express = require("express");
const Web3 = require("web3");
const cors = require("cors");
const BRLMasterChef = require("../abis/BRLMasterChef.json");

require("dotenv").config(); // install me oooooooo
// Get rpc url for aurora o

async function main() {
  const BRL_CHEF_ADDR = "0x35CC71888DBb9FfB777337324a4A60fdBAA19DDE";

  const network = process.env.AURORA_NETWORK;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));
  const instance = new web3.eth.Contract(BRLMasterChef, BRL_CHEF_ADDR);

  //   const currentBlock = await instance.methods.getBlockNumber();

  //   const multiplier = await instance.getMultiplier(
  //     currentBlock,
  //     currentBlock + 1
  //   );

  //   const rewardsPerWeek =
  //     (((await instance.BRLPerBlock()) / 1e18) * multiplier * 604800) / 1.1;

  //   return rewardsPerWeek;
  //   return instance.methods.getBlockNumber();
  //   return currentBlock;
  //   console.log(instance.methods);
  //   console.log(web3.eth.getBlockNumber().then((res) => res));
  //   console.log(num);
  const num = web3.eth.getBlockNumber();
  return num;
}

// console.log(main().then((res) => res));

console.log(main());
