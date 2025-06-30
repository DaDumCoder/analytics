
document.addEventListener("DOMContentLoaded", async () => {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/somnia_testnet/...");
    const contractAddress = "0xYourContractAddress"; // Replace with actual
    const abi = await fetch('abi.json').then(res => res.json());
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    try {
        // Dummy fetch simulation for example
        updateElement("totalTransactions", "123");
        updateElement("totalTransfers", "45");
        updateElement("totalGasUsed", "67890");
        updateElement("totalInteractions", "168");
        updateElement("totalClaims", "12");
    } catch (err) {
        console.error("Error loading analytics:", err);
    }
});
