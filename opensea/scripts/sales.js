const axios = require("axios");
// const { ethers } = require("ethers");

const main = async () => {
  try {
    const result = await axios.post(
      "https://api.studio.thegraph.com/query/25599/opensea/v0.0.1",
      {
        query: `
      {
        ordersMatcheds(first: 5){
            id
            buyHash
            sellHash
            price
          }
      }  
      `,
      }
    );
    const raw = result.data.data.ordersMatcheds;
    const res = raw.map((e, i, a) => {
      //   return ethers.utils.parseEther(better);
      a[i].price = (a[i].price / 10 ** 18).toString().concat(" Ether");
      return a;
    });

    console.log(res[0]);
  } catch (error) {
    console.error(error);
  }
};

main();
