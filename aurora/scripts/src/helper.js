const axios = require("axios");
const express = require("express");
const Web3 = require("web3");
const cors = require("cors");
const BRLMasterChef = require("../abis/BRLMasterChef.json");

require("dotenv").config(); // install me oooooooo
// Get rpc url for aurora o

const getCurrentblock = async () => {
  const now = new Date();
  const uinx = Math.round(now / 1000.0);
  const currentBlock = await axios
    .get(
      `https://api.aurorascan.dev/api?module=block&action=getblocknobytime&timestamp=${uinx}&closest=before&apikey=YourApiKeyToken`
    )
    .then((res) => res.data.result);
  // console.log(currentBlock);
};

async function main() {
  const BRL_CHEF_ADDR = "0x35CC71888DBb9FfB777337324a4A60fdBAA19DDE";
  const network = process.env.AURORA_NETWORK;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));
  const instance = new web3.eth.Contract(BRLMasterChef, BRL_CHEF_ADDR);

  const currentBlock = getCurrentblock();

  const multiplier = instance.methods.getMultiplier(
    currentBlock,
    currentBlock + 1
  );

  // const rewardsPerWeek =
  //   (((await instance.methods.BRLPerBlock()) / 1e18) * multiplier * 604800) /
  //   1.1;

  // console.log(rewardsPerWeek);
  return instance.methods.owner().call();
}

// console.log(main());
const network = process.env.AURORA_NETWORK;

const web3 = new Web3(new Web3.providers.HttpProvider(network));
const MyContract = new web3.eth.Contract(
  BRLMasterChef,
  "0x35cc71888dbb9ffb777337324a4a60fdbaa19dde"
);
// console.log(MyContract.methods.getMultiplier(64271292, 64271293).call());
console.log(MyContract.methods.getMultiplier(64271292, 64271293));
