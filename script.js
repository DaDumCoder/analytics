
const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811");

const contractAddress = "0x696ee979e8CC1D5a2CA7778606a3269C00978346";
const transferTopic = ethers.utils.id("Transfer(address,address,uint256)");
const claimTopic = ethers.utils.id("TokensClaimed(uint256,address,address,uint256,uint256)");

async function fetchLogs(topic, abi, label) {
    const iface = new ethers.utils.Interface(abi);
    const logs = await provider.getLogs({
        address: contractAddress,
        fromBlock: "earliest",
        toBlock: "latest",
        topics: [topic]
    });

    const decodedLogs = [];
    for (const log of logs) {
        try {
            const decoded = iface.parseLog(log);
            decodedLogs.push(decoded);
        } catch (e) {
            console.warn(`Failed to decode ${label} log`, log, e);
        }
    }

    console.log(`Fetched ${decodedLogs.length} ${label} logs`, decodedLogs);
    return decodedLogs;
}

async function loadAnalytics() {
    try {
        const response = await fetch('./abi.json');
        const abi = await response.json();

        const transfers = await fetchLogs(transferTopic, abi, 'transfer');
        const claims = await fetchLogs(claimTopic, abi, 'claim');

        document.getElementById('total-transactions').innerText = transfers.length + claims.length;
        document.getElementById('total-transfers').innerText = transfers.length;
        document.getElementById('total-claims').innerText = claims.length;
        document.getElementById('gas-used').innerText = 'N/A';
    } catch (e) {
        console.error('Error loading analytics:', e);
    }
}

window.onload = loadAnalytics;
