const provider = new ethers.providers.JsonRpcProvider("https://50312.rpc.thirdweb.com");

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
