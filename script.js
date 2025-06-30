document.addEventListener("DOMContentLoaded", async () => {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811");
    const contractAddress = "0x696ee979e8CC1D5a2CA7778606a3269C00978346"; // Your token contract
    const abi = await fetch('abi.json').then(res => res.json());
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    const topicTransfer = ethers.utils.id("Transfer(address,address,uint256)");
    const topicClaim = ethers.utils.id("claim(address,uint256)"); // Use actual event name if different

    try {
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = latestBlock - 5000 > 0 ? latestBlock - 5000 : 0;

        // --- Transfers ---
        const transferLogs = await provider.getLogs({
            address: contractAddress,
            fromBlock,
            toBlock: "latest",
            topics: [topicTransfer]
        });
        updateElement("totalTransfers", transferLogs.length);

        // --- Claims ---
        const claimLogs = await provider.getLogs({
            address: contractAddress,
            fromBlock,
            toBlock: "latest",
            topics: [topicClaim]
        });
        updateElement("totalClaims", claimLogs.length);

        // --- Total Transactions ---
        const blockPromises = [];
        for (let i = fromBlock; i <= latestBlock; i++) {
            blockPromises.push(provider.getBlockWithTransactions(i));
        }
        const blocks = await Promise.all(blockPromises);
        const allTxs = blocks.flatMap(b => b.transactions);
        const txCount = allTxs.filter(tx => tx.to && tx.to.toLowerCase() === contractAddress.toLowerCase()).length;
        updateElement("totalTransactions", txCount);

        // --- Gas Used ---
        let gasUsed = 0;
        for (const tx of allTxs) {
            try {
                const receipt = await provider.getTransactionReceipt(tx.hash);
                gasUsed += receipt.gasUsed.toNumber();
            } catch { }
        }
        updateElement("totalGasUsed", gasUsed.toLocaleString());

        // --- Interactions ---
        updateElement("totalInteractions", txCount + transferLogs.length + claimLogs.length);

    } catch (err) {
        console.error("Error loading analytics:", err);
    }
});
