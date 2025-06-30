
const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811");

const contractAddress = "0x696ee979e8CC1D5a2CA7778606a3269C00978346";
const transferTopic = ethers.utils.id("Transfer(address,address,uint256)");
const contractStartBlock = 110820000; // Adjust if known

async function fetchLogsInChunks(startBlock, endBlock, abi, chunkSize = 5000) {
  let allLogs = [];
  const iface = new ethers.utils.Interface(abi);

  for (let i = startBlock; i <= endBlock; i += chunkSize) {
    const toBlock = Math.min(i + chunkSize - 1, endBlock);
    try {
      const logs = await provider.getLogs({
        address: contractAddress,
        fromBlock: i,
        toBlock,
        topics: [transferTopic]
      });
      console.log(`Fetched ${logs.length} logs from ${i} to ${toBlock}`);

      for (const log of logs) {
        try {
          const decoded = iface.parseLog(log);
          log.decoded = decoded;
        } catch (err) {
          console.warn("Could not decode log:", err);
        }
      }

      allLogs.push(...logs);
    } catch (err) {
      console.error(`Error in block range ${i}–${toBlock}:`, err);
    }
  }

  return allLogs;
}

async function groupLogsByDay(logs) {
  const logsByDay = {};
  for (const log of logs) {
    const block = await provider.getBlock(log.blockNumber);
    const date = new Date(block.timestamp * 1000).toISOString().split("T")[0];
    if (!logsByDay[date]) logsByDay[date] = 0;
    logsByDay[date]++;
  }
  return logsByDay;
}

function renderDailyChart(dataObj) {
  const ctx = document.getElementById("dailyChart").getContext("2d");
  const labels = Object.keys(dataObj).sort();
  const values = labels.map(date => dataObj[date]);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Transfers per Day",
        data: values,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Transfers" }, beginAtZero: true }
      }
    }
  });
}

async function run() {
  const abi = await fetch("abi.json").then(res => res.json());

  const latestBlock = await provider.getBlockNumber();
  const blockTimeSec = 3;
  const blocksIn30Days = Math.floor((30 * 24 * 60 * 60) / blockTimeSec);
  const startBlock = contractStartBlock;

  const logs = await fetchLogsInChunks(startBlock, latestBlock, abi);

  document.getElementById("transferCount").innerText = logs.length.toLocaleString();

  const uniqueTxs = new Set(logs.map(l => l.transactionHash));
  document.getElementById("txCount").innerText = uniqueTxs.size.toLocaleString();

  let totalGas = 0;
  for (const txHash of uniqueTxs) {
    try {
      const tx = await provider.getTransactionReceipt(txHash);
      totalGas += tx.gasUsed.toNumber();
    } catch (err) {
      console.warn("Error getting gas for tx:", txHash, err);
    }
  }
  document.getElementById("gasUsed").innerText = totalGas.toLocaleString();

  const logsByDay = await groupLogsByDay(logs);
  renderDailyChart(logsByDay);
}

run();


async function fetchClaimLogsInChunks(startBlock, endBlock, chunkSize = 5000) {
  const claimTopic = ethers.utils.id("TokensClaimed(uint256,address,address,uint256,uint256)");
  const allLogs = [];

  for (let i = startBlock; i <= endBlock; i += chunkSize) {
    const toBlock = Math.min(i + chunkSize - 1, endBlock);
    try {
      const logs = await provider.getLogs({
        address: contractAddress,
        fromBlock: i,
        toBlock,
        topics: [claimTopic],
      });
      console.log(`Fetched ${logs.length} claim logs from ${i} to ${toBlock}`);
      allLogs.push(...logs);
    } catch (err) {
      console.error(`Error fetching claim logs from ${i} to ${toBlock}:`, err);
    }
  }

  return allLogs;
}

function renderClaimChart(dataObj) {
  const ctx = document.getElementById("claimChart").getContext("2d");
  const labels = Object.keys(dataObj).sort();
  const values = labels.map(date => dataObj[date]);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Claims per Day",
        data: values,
        backgroundColor: "rgba(255, 99, 132, 0.6)"
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Claims" }, beginAtZero: true }
      }
    }
  });
}

async function groupLogsByDayFromLogs(logs) {
  const byDay = {};
  for (const log of logs) {
    const block = await provider.getBlock(log.blockNumber);
    const date = new Date(block.timestamp * 1000).toISOString().split("T")[0];
    if (!byDay[date]) byDay[date] = 0;
    byDay[date]++;
  }
  return byDay;
}

// Run claim analytics
(async () => {
  const abi = await fetch("abi.json").then(res => res.json());
  const latestBlock = await provider.getBlockNumber();
  const blockTimeSec = 3;
  const blocksIn30Days = Math.floor((30 * 24 * 60 * 60) / blockTimeSec);
  const startBlock = contractStartBlock;

  const claimLogs = await fetchClaimLogsInChunks(startBlock, latestBlock);
  document.getElementById("claimCount").innerText = `Total Claims: ${claimLogs.length}`;

  const dailyClaimData = await groupLogsByDayFromLogs(claimLogs);
  renderClaimChart(dailyClaimData);
})();


async function fetchAllLogsInChunks(startBlock, endBlock, chunkSize = 5000) {
  const allLogs = [];

  for (let i = startBlock; i <= endBlock; i += chunkSize) {
    const toBlock = Math.min(i + chunkSize - 1, endBlock);
    try {
      const logs = await provider.getLogs({
        address: contractAddress,
        fromBlock: i,
        toBlock
      });
      console.log(`Fetched ${logs.length} all logs from ${i} to ${toBlock}`);
      allLogs.push(...logs);
    } catch (err) {
      console.error(`Error fetching all logs from ${i} to ${toBlock}:`, err);
    }
  }

  return allLogs;
}

function renderAllTxChart(dataObj) {
  const ctx = document.getElementById("allTxChart").getContext("2d");
  const labels = Object.keys(dataObj).sort();
  const values = labels.map(date => dataObj[date]);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "All Interactions per Day",
        data: values,
        backgroundColor: "rgba(153, 102, 255, 0.6)"
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Transactions" }, beginAtZero: true }
      }
    }
  });
}

// Fetch all txs & render
(async () => {
  const latestBlock = await provider.getBlockNumber();
  const startBlock = 49726370;

  const allLogs = await fetchAllLogsInChunks(startBlock, latestBlock);
  document.getElementById("allTxCount").innerText = `Total Interactions: ${allLogs.length}`;

  const allByDay = await groupLogsByDayFromLogs(allLogs);
  renderAllTxChart(allByDay);
})();
