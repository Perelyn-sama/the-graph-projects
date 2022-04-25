const axios = require("axios");
const express = require("express");
const Web3 = require("web3");
const cors = require("cors");
const BRLMasterChef = require("../abis/BRLMasterChef.json");
const BigNumber = require("bignumber.js");

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

async function getMultiplier() {
  const network = process.env.AURORA_NETWORK;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));
  const MyContract = new web3.eth.Contract(
    BRLMasterChef,
    "0x35cc71888dbb9ffb777337324a4a60fdbaa19dde"
  );

  let res = await MyContract.methods.getMultiplier(64271292, 64271293).call();
  return res;
}

async function getBRLPerBlock() {
  const network = process.env.AURORA_NETWORK;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));
  const MyContract = new web3.eth.Contract(
    BRLMasterChef,
    "0x35cc71888dbb9ffb777337324a4a60fdbaa19dde"
  );

  let res = await MyContract.methods.BRLPerBlock().call();
  return res;
}

async function main() {
  const BRL_CHEF_ADDR = "0x35CC71888DBb9FfB777337324a4A60fdBAA19DDE";
  const network = process.env.AURORA_NETWORK;
  const web3 = new Web3(new Web3.providers.HttpProvider(network));
  const instance = new web3.eth.Contract(BRLMasterChef, BRL_CHEF_ADDR);

  const currentBlock = getCurrentblock();

  const multiplier = getMultiplier();

  // const BRLPerBlock = getBRLPerBlock();

  // const rewardsPerWeek = ((BRLPerBlock / 1e18) * multiplier * 604800) / 1.1;

  // console.log(BRLPerBlock);
  // console.log(1e18);

  // return rewardsPerWeek;
}

main();
getBRLPerBlock().then((res) => console.log(res));
