async function loadAuroraChefContract(
  App,
  tokens,
  prices,
  chef,
  chefAddress,
  chefAbi,
  rewardTokenTicker,
  rewardTokenFunction,
  rewardsPerBlockFunction,
  rewardsPerWeekFixed,
  pendingRewardsFunction,
  deathPoolIndices,
  claimFunction
) {
  const chefContract =
    chef ?? new ethers.Contract(chefAddress, chefAbi, App.provider);

  const poolCount = parseInt(await chefContract.poolLength(), 10);
  const totalAllocPoints = await chefContract.totalAllocPoint();

  _print(
    `<a href='https://aurorascan.dev/address/${chefAddress}' target='_blank'>Staking Contract</a>`
  );
  _print(`Found ${poolCount} pools.\n`);

  _print(`Showing incentivized pools only.\n`);

  const rewardTokenAddress = await chefContract.callStatic[
    rewardTokenFunction
  ]();
  const rewardToken = await getAuroraToken(
    App,
    rewardTokenAddress,
    chefAddress
  );

  const rewardsPerWeek =
    rewardsPerWeekFixed ??
    (((await chefContract.callStatic[rewardsPerBlockFunction]()) /
      10 ** rewardToken.decimals) *
      604800) /
      3;

  const poolInfos = await Promise.all(
    [...Array(poolCount).keys()].map(
      async (x) =>
        await getAuroraPoolInfo(
          App,
          chefContract,
          chefAddress,
          x,
          pendingRewardsFunction
        )
    )
  );

  var tokenAddresses = [].concat.apply(
    [],
    poolInfos.filter((x) => x.poolToken).map((x) => x.poolToken.tokens)
  );

  await Promise.all(
    tokenAddresses.map(async (address) => {
      tokens[address] = await getAuroraToken(App, address, chefAddress);
    })
  );

  if (deathPoolIndices) {
    //load prices for the deathpool assets
    deathPoolIndices
      .map((i) => poolInfos[i])
      .map((poolInfo) =>
        poolInfo.poolToken
          ? getPoolPrices(tokens, prices, poolInfo.poolToken, "aurora")
          : undefined
      );
  }

  const poolPrices = poolInfos.map((poolInfo) =>
    poolInfo.poolToken
      ? getPoolPrices(tokens, prices, poolInfo.poolToken, "aurora")
      : undefined
  );

  _print("Finished reading smart contracts.\n");

  let aprs = [];
  for (i = 0; i < poolCount; i++) {
    if (poolPrices[i]) {
      const apr = printChefPool(
        App,
        chefAbi,
        chefAddress,
        prices,
        tokens,
        poolInfos[i],
        i,
        poolPrices[i],
        totalAllocPoints,
        rewardsPerWeek,
        rewardTokenTicker,
        rewardTokenAddress,
        pendingRewardsFunction,
        null,
        claimFunction,
        "aurora",
        poolInfos[i].depositFee,
        poolInfos[i].withdrawFee
      );
      aprs.push(apr);
    }
  }

  let totalUserStaked = 0,
    totalStaked = 0,
    averageApr = 0;
  for (const a of aprs) {
    if (!isNaN(a.totalStakedUsd)) {
      totalStaked += a.totalStakedUsd;
    }
    if (a.userStakedUsd > 0) {
      totalUserStaked += a.userStakedUsd;
      averageApr += (a.userStakedUsd * a.yearlyAPR) / 100;
    }
  }
  averageApr = averageApr / totalUserStaked;
  _print_bold(`Total Staked: $${formatMoney(totalStaked)}`);
  if (totalUserStaked > 0) {
    _print_bold(
      `\nYou are staking a total of $${formatMoney(
        totalUserStaked
      )} at an average APR of ${(averageApr * 100).toFixed(2)}%`
    );
    _print(
      `Estimated earnings:` +
        ` Day $${formatMoney((totalUserStaked * averageApr) / 365)}` +
        ` Week $${formatMoney((totalUserStaked * averageApr) / 52)}` +
        ` Year $${formatMoney(totalUserStaked * averageApr)}\n`
    );
  }
  return { prices, totalUserStaked, totalStaked, averageApr };
}

async function getAuroraToken(App, tokenAddress, stakingAddress) {
  if (tokenAddress == "0x0000000000000000000000000000000000000000") {
    return getAuroraErc20(App, null, tokenAddress, "");
  }
  const type = window.localStorage.getItem(tokenAddress);
  if (type)
    return getAuroraStoredToken(App, tokenAddress, stakingAddress, type);
  try {
    const crv = new ethcall.Contract(tokenAddress, CURVE_ABI);
    const [minter] = await App.ethcallProvider.all([crv.minter()]);
    const res = await getAuroraCurveToken(
      App,
      crv,
      tokenAddress,
      stakingAddress,
      minter
    );
    window.localStorage.setItem(tokenAddress, "curve");
    return res;
  } catch (err) {}
  try {
    const stable = new ethcall.Contract(tokenAddress, STABLESWAP_ABI);
    const _coin0 = await App.ethcallProvider.all([stable.coins(0)]);
    window.localStorage.setItem(tokenAddress, "stableswap");
    return await getAuroraStableswapToken(
      App,
      stable,
      tokenAddress,
      stakingAddress
    );
  } catch (err) {}
  try {
    const pool = new ethcall.Contract(tokenAddress, UNI_ABI);
    const _token0 = await App.ethcallProvider.all([pool.token0()]);
    const uniPool = await getAuroraUniPool(
      App,
      pool,
      tokenAddress,
      stakingAddress
    );
    window.localStorage.setItem(tokenAddress, "uniswap");
    return uniPool;
  } catch (err) {}
  try {
    const basicVault = new ethcall.Contract(tokenAddress, HARVEST_VAULT_ABI);
    const _token = await App.ethcallProvider.all([basicVault.underlying()]);
    const res = await getAuroraBasicVault(
      App,
      basicVault,
      tokenAddress,
      stakingAddress
    );
    window.localStorage.setItem(tokenAddress, "basicAuroraVault");
    return res;
  } catch (err) {}
  try {
    const erc20 = new ethcall.Contract(tokenAddress, ERC20_ABI);
    const _name = await App.ethcallProvider.all([erc20.name()]);
    const erc20tok = await getAuroraErc20(
      App,
      erc20,
      tokenAddress,
      stakingAddress
    );
    window.localStorage.setItem(tokenAddress, "erc20");
    return erc20tok;
  } catch (err) {
    console.log(err);
    console.log(`Couldn't match ${tokenAddress} to any known token type.`);
  }
}
