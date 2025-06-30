
const provider = new ethers.providers.JsonRpcProvider("https://rpc.shannonnet.somnia.network");
const address = "0x696ee979e8CC1D5a2CA7778606a3269C00978346";

const abi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokensClaimed(address indexed claimer, address indexed receiver, uint256 quantity)"
];

const iface = new ethers.utils.Interface(abi);

const CLAIM_EVENT_TOPIC = "0xfa76a4010d9533e3e964f2930a65fb6042a12fa6ff5b08281837a10b0be7321e";

async function getBlockTimestamp(blockNumber) {
  const block = await provider.getBlock(blockNumber);
  return new Date(block.timestamp * 1000).toISOString().split("T")[0];
}

async function fetchAndProcessLogs(startBlock, endBlock) {
  const logs = await provider.getLogs({
    address,
    fromBlock: startBlock,
    toBlock: endBlock,
  });

  const transfers = [];
  const claims = [];

  for (const log of logs) {
    if (log.topics[0] === iface.getEventTopic("Transfer")) {
      const parsed = iface.parseLog(log);
      const timestamp = await getBlockTimestamp(log.blockNumber);
      transfers.push({ timestamp });
    } else if (log.topics[0] === CLAIM_EVENT_TOPIC) {
      console.log("Detected claim log topic", log);
      const parsed = iface.parseLog(log);
      const timestamp = await getBlockTimestamp(log.blockNumber);
      claims.push({ timestamp });
    }
  }

  return { transfers, claims };
}

async function main() {
  const startBlock = 110820000;
  const endBlock = await provider.getBlockNumber();

  let allTransfers = [];
  let allClaims = [];

  for (let i = startBlock; i <= endBlock; i += 5000) {
    const from = i;
    const to = Math.min(i + 4999, endBlock);
    console.log(`Fetching logs from ${from} to ${to}`);

    const { transfers, claims } = await fetchAndProcessLogs(from, to);
    allTransfers.push(...transfers);
    allClaims.push(...claims);
  }

  const dailyTransfers = {};
  const dailyClaims = {};

  allTransfers.forEach(t => dailyTransfers[t.timestamp] = (dailyTransfers[t.timestamp] || 0) + 1);
  allClaims.forEach(c => dailyClaims[c.timestamp] = (dailyClaims[c.timestamp] || 0) + 1);

  document.getElementById("totalTxns").textContent = allTransfers.length;
  document.getElementById("totalTransfers").textContent = allTransfers.length;
  document.getElementById("totalClaims").textContent = allClaims.length;

  renderChart(dailyTransfers, dailyClaims);
}

function renderChart(transfers, claims) {
  const ctx1 = document.getElementById("transferChart").getContext("2d");
  new Chart(ctx1, {
    type: "bar",
    data: {
      labels: Object.keys(transfers),
      datasets: [{
        label: "Transfers per Day",
        data: Object.values(transfers),
      }],
    }
  });

  const ctx2 = document.getElementById("claimChart").getContext("2d");
  new Chart(ctx2, {
    type: "bar",
    data: {
      labels: Object.keys(claims),
      datasets: [{
        label: "Claims per Day",
        data: Object.values(claims),
      }],
    }
  });
}

main();
