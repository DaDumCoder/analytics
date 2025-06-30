
const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811");

const contractAddress = "0x696ee979e8CC1D5a2CA7778606a3269C00978346";
const transferTopic = ethers.utils.id("Transfer(address,address,uint256)");
const claimTopic = ethers.utils.id("TokensClaimed(uint256,address,address,uint256,uint256)");
const CHUNK_SIZE = 9000;
const START_BLOCK = 110000000; // adjust based on real deployment

async function fetchLogsInChunks(fromBlock, toBlock, topic, abi, label) {
    const iface = new ethers.utils.Interface(abi);
    let logs = [];

    for (let i = fromBlock; i <= toBlock; i += CHUNK_SIZE) {
        const chunkToBlock = Math.min(i + CHUNK_SIZE - 1, toBlock);
        try {
            const fetchedLogs = await provider.getLogs({
                address: contractAddress,
                fromBlock: i,
                toBlock: chunkToBlock,
                topics: [topic]
            });

            for (const log of fetchedLogs) {
                try {
                    const decoded = iface.parseLog(log);
                    logs.push(decoded);
                } catch (e) {
                    console.warn(`Failed to decode ${label} log`, log, e);
                }
            }

            console.log(`Fetched ${fetchedLogs.length} ${label} logs from ${i} to ${chunkToBlock}`);
        } catch (err) {
            console.error(`Error fetching ${label} logs from ${i} to ${chunkToBlock}`, err);
        }
    }

    return logs;
}

async function loadAnalytics() {
    try {
        const response = await fetch('./abi.json');
        const abi = await response.json();

        const latestBlock = await provider.getBlockNumber();
        const transfers = await fetchLogsInChunks(START_BLOCK, latestBlock, transferTopic, abi, 'transfer');
        const claims = await fetchLogsInChunks(START_BLOCK, latestBlock, claimTopic, abi, 'claim');

        document.getElementById('total-transactions').innerText = transfers.length + claims.length;
        document.getElementById('total-transfers').innerText = transfers.length;
        document.getElementById('total-claims').innerText = claims.length;
        document.getElementById('gas-used').innerText = 'N/A';
    } catch (e) {
        console.error('Error loading analytics:', e);
    }
}

window.onload = loadAnalytics;
