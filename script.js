document.addEventListener("DOMContentLoaded", async () => {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet");
    const contractAddress = "0xd3a6a3f851ec843df96860eab2086267b47249e8"; // Your token contract
    const abi = await fetch('abi.json').then(res => res.json());
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    const topicTransfer = ethers.utils.id("Transfer(address,address,uint256)");
    const topicClaim = ethers.utils.id("Claim(address,uint256)"); // Use actual event name if different

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
