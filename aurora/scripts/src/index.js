const express = require("express");
const Web3 = require("web3");
const cors = require("cors");

const BRLToken = require("../abis/BRLToken.json");
const BRLMasterChef = require("../abis/BRLMasterChef.json");
const AuroraFactory = require("../abis/AuroraFactory.json");
const AuroraRouter = require("../abis/AuroraRouter.json");

require("dotenv").config(); // install me oooooooo

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 7000;

app.get("/api/balance/:address", async (req, res) => {
  const network =
    req.query.network === "eth"
      ? process.env.ETH_NETWORK
      : req.body.network === "bsc"
      ? process.env.BSC_NETWORK
      : req.body.network === "aur"
      ? process.env.AURORA_NETWORK
      : null;

  const web3 = new Web3(new Web3.providers.HttpProvider(network));
  try {
    const userBalance = await web3.eth.getBalance(req.params.address);

    return res.json({
      amount: parseFloat(web3.utils.fromWei(userBalance, "ether")),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/owner/:contract/:address", async (req, res) => {
  const network =
    req.query.network === "eth"
      ? process.env.ETH_NETWORK
      : req.body.network === "bsc"
      ? process.env.BSC_NETWORK
      : req.body.network === "aur"
      ? process.env.AURORA_NETWORK
      : null;

  const web3 = new Web3(new Web3.providers.HttpProvider(network));
  const instance = new web3.eth.Contract(abi, req.params.contract);

  try {
    const response = await instance.methods.owner().call();

    if (response == req.params.address) {
      return res.json({ status: true });
    } else {
      return res.json({ status: false });
    }
    // return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
