const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811");

const contractAddress = "0x696ee979e8CC1D5a2CA7778606a3269C00978346";
const transferTopic = ethers.utils.id("Transfer(address,address,uint256)");

async function fetchLogsInChunks(startBlock, endBlock, chunkSize = 5000) {
  let allLogs = [];
  for (let i = startBlock; i <= endBlock; i += chunkSize) {
    const toBlock = Math.min(i + chunkSize - 1, endBlock);
    try {
      const logs = await provider.getLogs({
        address: contractAddress,
        fromBlock: i,
        toBlock: toBlock,
        topics: [transferTopic]
      });
      console.log(`Fetched ${logs.length} logs from ${i} to ${toBlock}`);
      allLogs.push(...logs);
    } catch (err) {
      console.error(`Error in block range ${i}–${toBlock}:`, err);
    }
  }
  return allLogs;
}

async function run() {
  const latestBlock = await provider.getBlockNumber();
  const blockTimeSec = 3; // Estimate
  const blocksIn30Days = Math.floor((30 * 24 * 60 * 60) / blockTimeSec);
  const startBlock = latestBlock - blocksIn30Days;

  const logs = await fetchLogsInChunks(startBlock, latestBlock);
  document.getElementById("transferCount").innerText = logs.length.toLocaleString();
}

run();
