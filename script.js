
const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811");

const contractAddress = "0x696ee979e8CC1D5a2CA7778606a3269C00978346";
const transferTopic = ethers.utils.id("Transfer(address,address,uint256)");
const claimTopic = ethers.utils.id("TokensClaimed(uint256,address,address,uint256,uint256)");

const contractStartBlock = 51000000; // Replace with actual deployment block
const chunkSize = 5000;

async function fetchLogsInChunks(startBlock, endBlock, abi, topic, label) {
    let allLogs = [];
    const iface = new ethers.utils.Interface(abi);

    for (let i = startBlock; i <= endBlock; i += chunkSize) {
        const toBlock = Math.min(i + chunkSize - 1, endBlock);
        try {
            const logs = await provider.getLogs({
                address: contractAddress,
                fromBlock: i,
                toBlock,
                topics: [topic],
            });
            console.log(`Fetched ${logs.length} ${label} logs from ${i} to ${toBlock}`);
            for (const log of logs) {
                try {
                    const decoded = iface.parseLog(log);
                    log.decoded = decoded;
                    allLogs.push(log);
                } catch (e) {
                    console.warn(`Failed to decode ${label} log:`, log, e);
                }
            }
        } catch (e) {
            console.error(`Error fetching ${label} logs from ${i} to ${toBlock}`, e);
        }
    }

    return allLogs;
}

async function loadAnalytics() {
    const response = await fetch('./abi.json');
    const abi = await response.json();

    const latestBlock = await provider.getBlockNumber();

    const transferLogs = await fetchLogsInChunks(contractStartBlock, latestBlock, abi, transferTopic, 'transfer');
    const claimLogs = await fetchLogsInChunks(contractStartBlock, latestBlock, abi, claimTopic, 'claim');

    document.getElementById('total-transactions').innerText = transferLogs.length + claimLogs.length;
    document.getElementById('total-transfers').innerText = transferLogs.length;
    document.getElementById('total-claims').innerText = claimLogs.length;
    document.getElementById('gas-used').innerText = 'N/A'; // Optional: Add gas tracking if needed
}

window.onload = loadAnalytics;
