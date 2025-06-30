const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811");

async function loadData() {
  const txCount = await provider.getTransactionCount("0x696ee979e8CC1D5a2CA7778606a3269C00978346");
  document.getElementById("txCount").innerText = txCount.toLocaleString();

  const block = await provider.getBlock("latest");
  const gasUsed = block.gasUsed ? block.gasUsed.toString() : "Unavailable";
  document.getElementById("gasUsed").innerText = gasUsed;

  // Optional: Use ABI to read transfers
  // If the contract emits ERC20 `Transfer` event, we can fetch logs:
  const transferTopic = ethers.utils.id("Transfer(address,address,uint256)");
  const logs = await provider.getLogs({
    address: "0x696ee979e8CC1D5a2CA7778606a3269C00978346",
    fromBlock: 0,
    toBlock: "latest",
    topics: [transferTopic]
  });

  document.getElementById("transferCount").innerText = logs.length;
}

loadData();
