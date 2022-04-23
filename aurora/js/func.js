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
